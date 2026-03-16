import { useState, useEffect, useCallback } from 'react';
import { getJournals, deleteJournal, updateJournal } from '../api';

export default function Journals() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const data = await getJournals(params);
      setEntries(data.entries);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSelect = (entry) => {
    setSelected(entry);
    setEditing(false);
    setMsg('');
  };

  const startEdit = (entry) => {
    setSelected(entry);
    setEditing(true);
    setForm({ title: entry.title || '', body: entry.body || '' });
    setMsg('');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMsg('');
    try {
      const updated = await updateJournal(selected._id, form);
      setSelected(updated);
      setEditing(false);
      setMsg('Saved successfully!');
      fetchEntries();
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await deleteJournal(id);
      if (selected?._id === id) { setSelected(null); setEditing(false); }
      fetchEntries();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEntries();
  };

  return (
    <div>
      <h1 className="page-title">Journal Entries ({total})</h1>

      <form className="toolbar" onSubmit={handleSearch}>
        <input
          className="input"
          placeholder="Search title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="two-col">
          <div className="card-list">
            {entries.map((entry) => (
              <div key={entry._id} className={`card ${selected?._id === entry._id ? 'active' : ''}`}>
                <div className="card-body" onClick={() => handleSelect(entry)}>
                  <div className="card-header-row">
                    <strong>{entry.title || 'Untitled'}</strong>
                  </div>
                  <p className="card-text">{entry.body?.substring(0, 100)}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                    <small className="card-meta">
                      By: {entry.userId?.fullName || 'Unknown'}
                    </small>
                    <small className="card-meta">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn btn-sm" onClick={() => startEdit(entry)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(entry._id)}>Delete</button>
                </div>
              </div>
            ))}
            {entries.length === 0 && <p style={{ color: '#888', padding: '1rem' }}>No journal entries found</p>}
          </div>

          <div className="form-panel">
            {selected && editing ? (
              <>
                <h3>Edit Journal Entry</h3>
                <div className="detail-meta">
                  <span className="badge badge-purple">{selected.userId?.fullName || 'Unknown'}</span>
                  <small style={{ color: '#7878a0' }}>{selected.userId?.email}</small>
                </div>

                {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

                <label className="field-label">Title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <label className="field-label" style={{ marginTop: '0.75rem' }}>Body</label>
                <textarea
                  className="input textarea"
                  rows={14}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />

                <div className="modal-actions">
                  <button className="btn" onClick={() => { setEditing(false); setMsg(''); }}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            ) : selected ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{selected.title || 'Untitled'}</h3>
                  <button className="btn btn-sm" onClick={() => startEdit(selected)}>Edit</button>
                </div>
                <div className="detail-meta">
                  <span className="badge badge-purple">{selected.userId?.fullName || 'Unknown'}</span>
                  <small style={{ color: '#7878a0' }}>{selected.userId?.email}</small>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#5a5a80' }}>
                  Created: {new Date(selected.createdAt).toLocaleString()}
                </div>
                {msg && <div className="alert alert-success">{msg}</div>}
                <hr style={{ border: 'none', borderTop: '1px solid #2a2a45', margin: '1rem 0' }} />
                <div className="journal-body">{selected.body}</div>
              </>
            ) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>Select an entry to view</p>
            )}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
