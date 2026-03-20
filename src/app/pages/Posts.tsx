import { useEffect, useState } from "react";
import { Search, MoreVertical, X, Edit, Trash2, Eye, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { getPosts, getPost, updatePost, deletePost, deleteComment } from "../api";

interface Comment {
  _id: string;
  userId?: { fullName: string; email: string };
  body: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  body: string;
  author?: string;
  userId?: { fullName: string; email: string };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState<Post | null>(null);
  const [deleteModal, setDeleteModal] = useState<Post | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({ title: "", body: "", author: "" });

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: "20" };
      if (searchQuery) params.search = searchQuery;
      const res = await getPosts(params);
      setPosts(res.posts || []);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || p);
    } catch {
      setError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPosts(1), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const openDetail = async (id: string) => {
    try {
      const post = await getPost(id);
      setSelectedPost(post);
    } catch {
      setError("Failed to load post details");
    }
  };

  const handleEdit = (post: Post) => {
    setFormData({ title: post.title, body: post.body, author: post.author || "" });
    setEditModal(post);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    try {
      await updatePost(editModal._id, formData);
      setEditModal(null);
      fetchPosts(page);
      if (selectedPost?._id === editModal._id) openDetail(editModal._id);
    } catch {
      setError("Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deletePost(deleteModal._id);
      setDeleteModal(null);
      if (selectedPost?._id === deleteModal._id) setSelectedPost(null);
      fetchPosts(page);
    } catch {
      setError("Failed to delete post");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment(postId, commentId);
      openDetail(postId);
    } catch {
      setError("Failed to delete comment");
    }
  };

  return (
    <div className="flex h-full">
      {/* List Panel */}
      <div className={`flex flex-col border-r border-[#e1e1e7] bg-white ${selectedPost ? "w-1/2" : "w-full"}`}>
        <div className="border-b border-[#e1e1e7] p-6">
          <h1 className="text-2xl font-bold text-[#090838]">Posts</h1>
          <p className="mt-1 text-sm text-[#6b6b88]">Manage community posts and comments</p>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b6b88]" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#e1e1e7] py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#6b6b88]">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-[#6b6b88]">No posts found</div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                onClick={() => openDetail(post._id)}
                className={`cursor-pointer border-b border-[#e1e1e7] p-4 transition-colors hover:bg-[#f5f6fa] ${
                  selectedPost?._id === post._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#090838] truncate">{post.title || "Untitled"}</h3>
                    <p className="mt-1 text-xs text-[#6b6b88]">
                      by {post.userId?.fullName || post.author || "Unknown"} · {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm text-[#6b6b88] line-clamp-2">{post.body}</p>
                  </div>
                  <div className="relative ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post._id ? null : post._id); }}
                      className="rounded p-1 hover:bg-[#e1e1e7]"
                    >
                      <MoreVertical className="size-4 text-[#6b6b88]" />
                    </button>
                    {openMenuId === post._id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-8 z-50 w-36 rounded-lg border border-[#e1e1e7] bg-white shadow-lg">
                          <button onClick={() => { handleEdit(post); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[#f5f6fa]">
                            <Edit className="size-4" /> Edit
                          </button>
                          <button onClick={() => { setDeleteModal(post); setOpenMenuId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="size-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-[#e1e1e7] p-4">
            <button onClick={() => fetchPosts(page - 1)} disabled={page <= 1} className="rounded p-1 hover:bg-[#f5f6fa] disabled:opacity-40">
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-sm text-[#6b6b88]">Page {page} of {totalPages}</span>
            <button onClick={() => fetchPosts(page + 1)} disabled={page >= totalPages} className="rounded p-1 hover:bg-[#f5f6fa] disabled:opacity-40">
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedPost && (
        <div className="flex w-1/2 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
            <h2 className="text-lg font-semibold text-[#090838]">Post Details</h2>
            <button onClick={() => setSelectedPost(null)} className="rounded p-1 hover:bg-[#f5f6fa]">
              <X className="size-5 text-[#6b6b88]" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <h3 className="text-xl font-bold text-[#090838]">{selectedPost.title || "Untitled"}</h3>
            <p className="mt-1 text-sm text-[#6b6b88]">
              by {selectedPost.userId?.fullName || selectedPost.author || "Unknown"} · {new Date(selectedPost.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-4 whitespace-pre-wrap text-sm text-[#090838]">{selectedPost.body}</div>

            {/* Comments */}
            {selectedPost.comments && selectedPost.comments.length > 0 && (
              <div className="mt-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-[#090838]">
                  <MessageSquare className="size-4" /> Comments ({selectedPost.comments.length})
                </h4>
                <div className="mt-3 space-y-3">
                  {selectedPost.comments.map((c) => (
                    <div key={c._id} className="rounded-lg bg-[#f5f6fa] p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#090838]">{c.userId?.fullName || "Anonymous"}</p>
                          <p className="mt-1 text-sm text-[#6b6b88]">{c.body}</p>
                          <p className="mt-1 text-xs text-[#6b6b88]">{new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(selectedPost._id, c._id)}
                          className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#090838]">Edit Post</h3>
              <button onClick={() => setEditModal(null)} className="rounded p-1 hover:bg-[#f5f6fa]"><X className="size-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Title</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Author</label>
                <input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Body</label>
                <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={6} className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditModal(null)} className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm hover:bg-[#f5f6fa]">Cancel</button>
              <button onClick={handleSaveEdit} className="rounded-lg bg-[#0048ff] px-4 py-2 text-sm text-white hover:bg-[#0038cc]">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-[#090838]">Delete Post</h3>
            <p className="mt-2 text-sm text-[#6b6b88]">Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.</p>
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
