import { useState, useEffect, useCallback } from 'react';
import { getPosts, deletePost, deleteComment } from '../api';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const data = await getPosts(params);
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post and all its comments?')) return;
    try {
      await deletePost(id);
      if (selected?._id === id) setSelected(null);
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(postId, commentId);
      // Refresh selected post
      setSelected((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div>
      <h1 className="page-title">Community Posts ({total})</h1>

      <form className="toolbar" onSubmit={handleSearch}>
        <input
          className="input"
          placeholder="Search title, content, or author..."
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
            {posts.map((post) => (
              <div key={post._id} className={`card ${selected?._id === post._id ? 'active' : ''}`}>
                <div className="card-body" onClick={() => setSelected(post)}>
                  <div className="card-header-row">
                    <strong>{post.title}</strong>
                    <span className="badge badge-blue">{post.likes} likes</span>
                  </div>
                  <p className="card-text">{post.body?.substring(0, 100)}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                    <small className="card-meta">
                      By: {post.author || post.userId?.fullName || 'Unknown'}
                    </small>
                    <small className="card-meta">
                      {post.comments?.length || 0} comments | {new Date(post.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn btn-sm" onClick={() => setSelected(post)}>View</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post._id)}>Delete</button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p style={{ color: '#888', padding: '1rem' }}>No posts found</p>}
          </div>

          <div className="form-panel">
            {selected ? (
              <>
                <h3>{selected.title}</h3>
                <div className="detail-meta">
                  <span className="badge badge-purple">{selected.author || selected.userId?.fullName || 'Unknown'}</span>
                  <span className="badge badge-blue">{selected.likes} likes</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#5a5a80' }}>
                  Posted: {new Date(selected.createdAt).toLocaleString()}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #2a2a45', margin: '1rem 0' }} />
                <div className="journal-body">{selected.body}</div>

                {selected.comments && selected.comments.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                      Comments ({selected.comments.length})
                    </h4>
                    <div className="comments-list">
                      {selected.comments.map((c) => (
                        <div key={c._id} className="comment-card">
                          <div className="comment-header">
                            <strong>{c.author || 'Unknown'}</strong>
                            <small>{c.timeAgo || new Date(c.createdAt).toLocaleDateString()}</small>
                          </div>
                          <p className="comment-text">{c.text}</p>
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ marginTop: '0.35rem' }}
                            onClick={() => handleDeleteComment(selected._id, c._id)}
                          >
                            Delete Comment
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>Select a post to view</p>
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
