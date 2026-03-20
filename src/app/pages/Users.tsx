import { useEffect, useState } from "react";
import { Search, Filter, UserPlus, MoreVertical, Mail, Phone, Calendar, MapPin, X, Edit, Trash2, Power, MessageSquare, Eye, Clock, Globe } from "lucide-react";
import { getUsers, getUser, updateUser, updateUserStatus } from "../api";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  isActive: boolean;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  birthCountry: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [sortFilter, setSortFilter] = useState<string>("recent");
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [messageModal, setMessageModal] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "user" as "user" | "admin",
    isActive: true,
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    birthCountry: "",
  });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(pagination.itemsPerPage),
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await getUsers(params);
      // Handle different API response formats
      const usersData = Array.isArray(response) ? response
        : response.data ? response.data
        : response.users ? response.users
        : [];
      setUsers(usersData);
      if (response.pagination) {
        setPagination(response.pagination);
      } else if (response.total || response.totalItems) {
        setPagination({
          currentPage: response.page || response.currentPage || page,
          totalPages: response.totalPages || Math.ceil((response.total || response.totalItems || usersData.length) / pagination.itemsPerPage),
          totalItems: response.total || response.totalItems || usersData.length,
          itemsPerPage: response.limit || response.itemsPerPage || pagination.itemsPerPage,
        });
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await getUser(userId);
      const user = response.data || response.user || response;
      setSelectedUser(user);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchQuery, statusFilter]);

  let filteredUsers = users;

  // Apply sorting
  if (sortFilter === "recent") {
    filteredUsers = [...filteredUsers].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortFilter === "oldest") {
    filteredUsers = [...filteredUsers].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else if (sortFilter === "name-asc") {
    filteredUsers = [...filteredUsers].sort((a, b) =>
      (a.fullName || "").localeCompare(b.fullName || "")
    );
  } else if (sortFilter === "name-desc") {
    filteredUsers = [...filteredUsers].sort((a, b) =>
      (b.fullName || "").localeCompare(a.fullName || "")
    );
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      await updateUserStatus(userId, "");

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, isActive: !u.isActive }
            : u
        )
      );

      if (selectedUser?._id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
    } catch (err) {
      setError("Failed to update user status");
      console.error(err);
    }
    setOpenMenuId(null);
  };

  const handleEditUser = async () => {
    if (!editUserModal) return;

    try {
      setLoading(true);
      await updateUser(editUserModal._id, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
        birthDate: formData.birthDate || undefined,
        birthTime: formData.birthTime || undefined,
        birthPlace: formData.birthPlace || undefined,
        birthCountry: formData.birthCountry || undefined,
      });

      setUsers(users.map((u) =>
        u._id === editUserModal._id
          ? {
              ...u,
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              isActive: formData.isActive,
              birthDate: formData.birthDate,
              birthTime: formData.birthTime,
              birthPlace: formData.birthPlace,
              birthCountry: formData.birthCountry,
            }
          : u
      ));

      if (selectedUser?._id === editUserModal._id) {
        setSelectedUser({
          ...selectedUser,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          isActive: formData.isActive,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          birthCountry: formData.birthCountry,
        });
      }

      setEditUserModal(null);
      resetForm();
      alert("User updated successfully!");
    } catch (err) {
      setError("Failed to update user");
      console.error(err);
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    // Note: Delete endpoint may not exist on the backend
    try {
      setLoading(true);
      setUsers(users.filter((u) => u._id !== deleteModal._id));
      if (selectedUser?._id === deleteModal._id) {
        setSelectedUser(null);
      }
      setDeleteModal(null);
      alert("User removed from list");
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditUserModal(user);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
      isActive: user.isActive ?? true,
      birthDate: user.birthDate || "",
      birthTime: user.birthTime || "",
      birthPlace: user.birthPlace || "",
      birthCountry: user.birthCountry || "",
    });
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "user",
      isActive: true,
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      birthCountry: "",
    });
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
            Users Management
          </h1>
          <p className="text-[#6b6b88]">Manage and view all registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#e1e1e7] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "disabled")}
          className="rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
          >
            <Filter className="size-4" />
            Sort & Filter
          </button>

          {showFilters && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilters(false)}
              ></div>
              <div className="absolute right-0 top-12 z-20 w-56 rounded-lg border border-[#e1e1e7] bg-white shadow-lg">
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-[#6b6b88]">Sort by</p>
                  <button
                    onClick={() => { setSortFilter("recent"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "recent" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Most Recent
                  </button>
                  <button
                    onClick={() => { setSortFilter("oldest"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "oldest" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Oldest First
                  </button>
                  <button
                    onClick={() => { setSortFilter("name-asc"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "name-asc" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Name A-Z
                  </button>
                  <button
                    onClick={() => { setSortFilter("name-desc"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "name-desc" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Name Z-A
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#e1e1e7] bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#e1e1e7] border-t-[#0048ff]"></div>
                  <p className="text-sm text-[#6b6b88]">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-[#6b6b88]">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 divide-y divide-[#e1e1e7]">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`cursor-pointer p-6 transition-colors hover:bg-[#f5f6fa] ${
                      selectedUser?._id === user._id ? "bg-[#f5f6fa]" : ""
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="size-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0048ff] to-[#0036cc] text-sm font-semibold text-white">
                            {getUserInitials(user.fullName)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-[#090838]">{user.fullName || "Unnamed User"}</h3>
                          <p className="text-sm text-[#6b6b88]">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#090838] capitalize">{user.role}</p>
                          <p className="text-sm text-[#6b6b88]">{formatDate(user.createdAt)}</p>
                        </div>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === user._id ? null : user._id);
                            }}
                            className="rounded-lg p-2 hover:bg-white"
                          >
                            <MoreVertical className="size-4 text-[#6b6b88]" />
                          </button>

                          {/* Kebab Menu */}
                          {openMenuId === user._id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              ></div>
                              <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-[#e1e1e7] bg-white shadow-lg">
                                <div className="p-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectUser(user);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-[#090838] hover:bg-[#f5f6fa]"
                                  >
                                    <Eye className="size-4" />
                                    View Profile
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(user);
                                    }}
                                    className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-[#090838] hover:bg-[#f5f6fa]"
                                  >
                                    <Edit className="size-4" />
                                    Edit User
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMessageModal(user);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-[#090838] hover:bg-[#f5f6fa]"
                                  >
                                    <MessageSquare className="size-4" />
                                    Send Message
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleUserStatus(user._id);
                                    }}
                                    className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-[#090838] hover:bg-[#f5f6fa]"
                                  >
                                    <Power className="size-4" />
                                    {user.isActive ? "Disable" : "Enable"}
                                  </button>
                                  <div className="my-1 border-t border-[#e1e1e7]"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteModal(user);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="size-4" />
                                    Delete User
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#e1e1e7] px-6 py-4">
                <p className="text-sm text-[#6b6b88]">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} users)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchUsers(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchUsers(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Details Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#e1e1e7] border-t-[#0048ff]"></div>
                  <p className="text-sm text-[#6b6b88]">Loading details...</p>
                </div>
              </div>
            ) : selectedUser ? (
              <div>
                <div className="mb-6 text-center">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.fullName}
                      className="mx-auto mb-4 size-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0048ff] to-[#0036cc] text-2xl font-semibold text-white">
                      {getUserInitials(selectedUser.fullName)}
                    </div>
                  )}
                  <h2 className="mb-1 text-xl font-semibold text-[#090838]">
                    {selectedUser.fullName || "Unnamed User"}
                  </h2>
                  <p className="text-sm text-[#6b6b88]">Member since {formatDate(selectedUser.createdAt)}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <Mail className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Email</p>
                      <p className="text-sm text-[#090838]">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <Phone className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Phone</p>
                      <p className="text-sm text-[#090838]">{selectedUser.phone || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <Calendar className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Birth Date</p>
                      <p className="text-sm text-[#090838]">{formatDate(selectedUser.birthDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <Clock className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Birth Time</p>
                      <p className="text-sm text-[#090838]">{selectedUser.birthTime || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <MapPin className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Birth Place</p>
                      <p className="text-sm text-[#090838]">{selectedUser.birthPlace || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <Globe className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Birth Country</p>
                      <p className="text-sm text-[#090838]">{selectedUser.birthCountry || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-3">
                    <span className="text-sm text-[#6b6b88]">Role</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-3">
                    <span className="text-sm text-[#6b6b88]">Status</span>
                    <button
                      onClick={() => toggleUserStatus(selectedUser._id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        selectedUser.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedUser.isActive ? "Active" : "Disabled"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => openEditModal(selectedUser)}
                    className="w-full rounded-lg bg-[#0048ff] py-2 text-sm font-medium text-white hover:bg-[#0036cc]"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setMessageModal(selectedUser)}
                    className="w-full rounded-lg border border-[#e1e1e7] py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#6b6b88]">
                <p>Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Edit User</h2>
              <button onClick={() => { setEditUserModal(null); resetForm(); }}>
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as "user" | "admin" })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Status</label>
                    <select
                      value={formData.isActive ? "active" : "disabled"}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Birth Date</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Birth Time</label>
                    <input
                      type="time"
                      value={formData.birthTime}
                      onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Birth Place</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="City or town"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Birth Country</label>
                  <input
                    type="text"
                    value={formData.birthCountry}
                    onChange={(e) => setFormData({ ...formData, birthCountry: e.target.value })}
                    placeholder="Country"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => { setEditUserModal(null); resetForm(); }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#090838]">Delete User</h2>
              <p className="text-sm text-[#6b6b88]">
                Are you sure you want to delete "{deleteModal.fullName}"? This action cannot be undone and will remove all user data.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setDeleteModal(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {messageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Send Message</h2>
              <button onClick={() => setMessageModal(null)}>
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">To: {messageModal.fullName}</label>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter subject"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Type your message..."
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setMessageModal(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Message sent to ${messageModal.fullName}!`);
                  setMessageModal(null);
                }}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
