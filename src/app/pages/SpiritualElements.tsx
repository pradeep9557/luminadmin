import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, X, Gem, Leaf, Filter } from "lucide-react";
import { getSpiritualElements, getSpiritualElement, createSpiritualElement, updateSpiritualElement, deleteSpiritualElement } from "../api";

interface SpiritualElement {
  _id: string;
  name: string;
  type: "herb" | "crystal";
  description: string;
  tag: string;
  iconUrl: string;
  order: number;
}

export function SpiritualElements() {
  const [elements, setElements] = useState<SpiritualElement[]>([]);
  const [selected, setSelected] = useState<SpiritualElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "herb" | "crystal">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<SpiritualElement | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<SpiritualElement | null>(null);

  const emptyForm = { name: "", type: "herb" as "herb" | "crystal", description: "", tag: "", iconUrl: "", order: 0 };
  const [formData, setFormData] = useState(emptyForm);

  const fetchElements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== "all") params.type = typeFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await getSpiritualElements(params);
      setElements(Array.isArray(res) ? res : []);
    } catch {
      setError("Failed to fetch spiritual elements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchElements(); }, [typeFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchElements(), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const openDetail = async (id: string) => {
    try {
      const item = await getSpiritualElement(id);
      setSelected(item);
    } catch {
      setError("Failed to load element details");
    }
  };

  const openCreate = () => {
    setFormData({ ...emptyForm, order: elements.length });
    setCreateModal(true);
  };

  const openEdit = (el: SpiritualElement) => {
    setFormData({ name: el.name, type: el.type, description: el.description, tag: el.tag, iconUrl: el.iconUrl, order: el.order });
    setEditModal(el);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.description) {
      setError("Name and description are required");
      return;
    }
    try {
      await createSpiritualElement(formData);
      setCreateModal(false);
      fetchElements();
    } catch {
      setError("Failed to create element");
    }
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    try {
      await updateSpiritualElement(editModal._id, formData);
      setEditModal(null);
      fetchElements();
      if (selected?._id === editModal._id) openDetail(editModal._id);
    } catch {
      setError("Failed to update element");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteSpiritualElement(deleteModal._id);
      setDeleteModal(null);
      if (selected?._id === deleteModal._id) setSelected(null);
      fetchElements();
    } catch {
      setError("Failed to delete element");
    }
  };

  const TypeIcon = ({ type }: { type: string }) =>
    type === "crystal" ? <Gem className="size-4 text-purple-500" /> : <Leaf className="size-4 text-green-500" />;

  return (
    <div className="flex h-full">
      {/* List Panel */}
      <div className={`flex flex-col border-r border-[#e1e1e7] bg-white ${selected ? "w-1/2" : "w-full"}`}>
        <div className="border-b border-[#e1e1e7] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#090838]">Spiritual Elements</h1>
              <p className="mt-1 text-sm text-[#6b6b88]">Manage herbs and crystals</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-[#0048ff] px-4 py-2 text-sm text-white hover:bg-[#0038cc]"
            >
              <Plus className="size-4" /> Add Element
            </button>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b6b88]" />
              <input
                type="text"
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#e1e1e7] py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
              />
            </div>
            <div className="flex rounded-lg border border-[#e1e1e7] overflow-hidden">
              {(["all", "herb", "crystal"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 text-sm capitalize ${
                    typeFilter === t ? "bg-[#0048ff] text-white" : "text-[#6b6b88] hover:bg-[#f5f6fa]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#6b6b88]">Loading...</div>
          ) : elements.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-[#6b6b88]">No elements found</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {elements.map((el) => (
                <div
                  key={el._id}
                  onClick={() => openDetail(el._id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors hover:border-[#0048ff]/30 hover:shadow-sm ${
                    selected?._id === el._id ? "border-[#0048ff] bg-blue-50" : "border-[#e1e1e7] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {el.iconUrl ? (
                        <img src={el.iconUrl} alt="" className="size-8 rounded-lg object-cover" />
                      ) : (
                        <div className={`flex size-8 items-center justify-center rounded-lg ${
                          el.type === "crystal" ? "bg-purple-100" : "bg-green-100"
                        }`}>
                          <TypeIcon type={el.type} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-[#090838] text-sm">{el.name}</h3>
                        <span className={`text-xs capitalize ${el.type === "crystal" ? "text-purple-500" : "text-green-500"}`}>
                          {el.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(el); }} className="rounded p-1 text-[#6b6b88] hover:bg-[#f5f6fa]">
                        <Edit className="size-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteModal(el); }} className="rounded p-1 text-[#6b6b88] hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                  {el.tag && (
                    <span className="mt-2 inline-block rounded-full bg-[#f5f6fa] px-2 py-0.5 text-xs text-[#6b6b88]">{el.tag}</span>
                  )}
                  <p className="mt-2 text-xs text-[#6b6b88] line-clamp-2">{el.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="flex w-1/2 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
            <h2 className="text-lg font-semibold text-[#090838]">Element Details</h2>
            <button onClick={() => setSelected(null)} className="rounded p-1 hover:bg-[#f5f6fa]">
              <X className="size-5 text-[#6b6b88]" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              {selected.iconUrl ? (
                <img src={selected.iconUrl} alt="" className="size-16 rounded-xl object-cover" />
              ) : (
                <div className={`flex size-16 items-center justify-center rounded-xl ${
                  selected.type === "crystal" ? "bg-purple-100" : "bg-green-100"
                }`}>
                  <TypeIcon type={selected.type} />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-[#090838]">{selected.name}</h3>
                <span className={`text-sm capitalize font-medium ${selected.type === "crystal" ? "text-purple-500" : "text-green-500"}`}>
                  {selected.type}
                </span>
              </div>
            </div>
            {selected.tag && (
              <div className="mb-4">
                <span className="text-xs font-medium text-[#6b6b88] uppercase">Tag</span>
                <p className="mt-1 text-sm text-[#090838]">{selected.tag}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-[#6b6b88] uppercase">Description</span>
              <p className="mt-1 text-sm text-[#090838] leading-relaxed whitespace-pre-wrap">{selected.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(createModal || editModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#090838]">{editModal ? "Edit Element" : "Add Element"}</h3>
              <button onClick={() => { setEditModal(null); setCreateModal(false); }} className="rounded p-1 hover:bg-[#f5f6fa]">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#090838] mb-1">Name</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#090838] mb-1">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "herb" | "crystal" })} className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none">
                    <option value="herb">Herb</option>
                    <option value="crystal">Crystal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Tag</label>
                <input value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} placeholder="e.g. healing, protection" className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Icon URL</label>
                <input value={formData.iconUrl} onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Order</label>
                <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-24 rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setEditModal(null); setCreateModal(false); }} className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm hover:bg-[#f5f6fa]">Cancel</button>
              <button onClick={editModal ? handleSaveEdit : handleCreate} className="rounded-lg bg-[#0048ff] px-4 py-2 text-sm text-white hover:bg-[#0038cc]">
                {editModal ? "Save Changes" : "Create Element"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-[#090838]">Delete Element</h3>
            <p className="mt-2 text-sm text-[#6b6b88]">Are you sure you want to delete "{deleteModal.name}"? This action cannot be undone.</p>
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
