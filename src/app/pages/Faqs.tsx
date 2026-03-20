import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, GripVertical, HelpCircle } from "lucide-react";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "../api";

interface Faq {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export function Faqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<Faq | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Faq | null>(null);

  const [formData, setFormData] = useState({ question: "", answer: "", order: 0 });

  const fetchFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFaqs();
      setFaqs(Array.isArray(res) ? res : []);
    } catch {
      setError("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const openCreate = () => {
    setFormData({ question: "", answer: "", order: faqs.length });
    setCreateModal(true);
  };

  const openEdit = (faq: Faq) => {
    setFormData({ question: faq.question, answer: faq.answer, order: faq.order });
    setEditModal(faq);
  };

  const handleCreate = async () => {
    if (!formData.question || !formData.answer) {
      setError("Question and answer are required");
      return;
    }
    try {
      await createFaq(formData);
      setCreateModal(false);
      fetchFaqs();
    } catch {
      setError("Failed to create FAQ");
    }
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    try {
      await updateFaq(editModal._id, formData);
      setEditModal(null);
      fetchFaqs();
    } catch {
      setError("Failed to update FAQ");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteFaq(deleteModal._id);
      setDeleteModal(null);
      fetchFaqs();
    } catch {
      setError("Failed to delete FAQ");
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#f5f6fa]">
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#090838]">FAQs</h1>
            <p className="mt-1 text-sm text-[#6b6b88]">Manage frequently asked questions</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-[#0048ff] px-4 py-2 text-sm text-white hover:bg-[#0038cc]"
          >
            <Plus className="size-4" /> Add FAQ
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6b6b88]">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center">
            <HelpCircle className="mx-auto size-12 text-[#6b6b88] opacity-40 mb-3" />
            <p className="text-[#6b6b88]">No FAQs yet. Click "Add FAQ" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq._id} className="rounded-xl bg-white border border-[#e1e1e7] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 pt-1">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0048ff]/10 text-xs font-semibold text-[#0048ff]">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#090838]">{faq.question}</h3>
                    <p className="mt-2 text-sm text-[#6b6b88] leading-relaxed">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(faq)}
                      className="rounded p-2 text-[#6b6b88] hover:bg-[#f5f6fa] hover:text-[#090838]"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal(faq)}
                      className="rounded p-2 text-[#6b6b88] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(createModal || editModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#090838]">{editModal ? "Edit FAQ" : "Add FAQ"}</h3>
              <button onClick={() => { setEditModal(null); setCreateModal(false); }} className="rounded p-1 hover:bg-[#f5f6fa]">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Question</label>
                <input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question..."
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Answer</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  placeholder="Enter the answer..."
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-24 rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setEditModal(null); setCreateModal(false); }} className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm hover:bg-[#f5f6fa]">Cancel</button>
              <button onClick={editModal ? handleSaveEdit : handleCreate} className="rounded-lg bg-[#0048ff] px-4 py-2 text-sm text-white hover:bg-[#0038cc]">
                {editModal ? "Save Changes" : "Create FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-[#090838]">Delete FAQ</h3>
            <p className="mt-2 text-sm text-[#6b6b88]">Are you sure you want to delete this FAQ? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteModal(null)} className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm hover:bg-[#f5f6fa]">Cancel</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
