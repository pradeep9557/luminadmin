import { useState } from "react";
import { Search, Filter, UserPlus, MoreVertical, Mail, Phone, Calendar, MapPin, X, Edit, Trash2, Power, MessageSquare, Eye } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  location: string;
  birthDate: string;
  orders: number;
  spent: string;
  status: "active" | "inactive";
  avatar: string;
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    joinDate: "2025-12-15",
    location: "New York, USA",
    birthDate: "1990-05-15",
    orders: 12,
    spent: "$599.88",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 234-5678",
    joinDate: "2026-01-08",
    location: "San Francisco, USA",
    birthDate: "1988-11-22",
    orders: 8,
    spent: "$359.92",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "Emma Williams",
    email: "emma.w@email.com",
    phone: "+1 (555) 345-6789",
    joinDate: "2025-11-20",
    location: "London, UK",
    birthDate: "1992-03-08",
    orders: 15,
    spent: "$749.85",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    name: "James Brown",
    email: "james.b@email.com",
    phone: "+1 (555) 456-7890",
    joinDate: "2026-02-14",
    location: "Toronto, Canada",
    birthDate: "1985-07-30",
    orders: 5,
    spent: "$249.95",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    phone: "+1 (555) 567-8901",
    joinDate: "2025-10-05",
    location: "Sydney, Australia",
    birthDate: "1995-09-12",
    orders: 20,
    spent: "$999.80",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
  },
  {
    id: 6,
    name: "David Martinez",
    email: "d.martinez@email.com",
    phone: "+1 (555) 678-9012",
    joinDate: "2026-01-25",
    location: "Madrid, Spain",
    birthDate: "1987-12-18",
    orders: 3,
    spent: "$149.97",
    status: "inactive",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: 7,
    name: "Sophie Taylor",
    email: "sophie.t@email.com",
    phone: "+1 (555) 789-0123",
    joinDate: "2025-12-30",
    location: "Paris, France",
    birthDate: "1993-04-25",
    orders: 18,
    spent: "$899.82",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
  {
    id: 8,
    name: "Alex Kim",
    email: "alex.k@email.com",
    phone: "+1 (555) 890-1234",
    joinDate: "2026-02-10",
    location: "Seoul, South Korea",
    birthDate: "1991-06-03",
    orders: 7,
    spent: "$349.93",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  },
];

export function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortFilter, setSortFilter] = useState<string>("recent");
  const [addUserModal, setAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [messageModal, setMessageModal] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    birthDate: "",
  });

  let filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Apply sorting
  if (sortFilter === "recent") {
    filteredUsers = [...filteredUsers].sort((a, b) => 
      new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    );
  } else if (sortFilter === "oldest") {
    filteredUsers = [...filteredUsers].sort((a, b) => 
      new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
    );
  } else if (sortFilter === "orders-high") {
    filteredUsers = [...filteredUsers].sort((a, b) => b.orders - a.orders);
  } else if (sortFilter === "orders-low") {
    filteredUsers = [...filteredUsers].sort((a, b) => a.orders - b.orders);
  } else if (sortFilter === "spent-high") {
    filteredUsers = [...filteredUsers].sort((a, b) => 
      parseFloat(b.spent.replace("$", "")) - parseFloat(a.spent.replace("$", ""))
    );
  } else if (sortFilter === "spent-low") {
    filteredUsers = [...filteredUsers].sort((a, b) => 
      parseFloat(a.spent.replace("$", "")) - parseFloat(b.spent.replace("$", ""))
    );
  }

  const toggleUserStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => prev ? { ...prev, status: prev.status === "active" ? "inactive" : "active" } : null);
    }
    setOpenMenuId(null);
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields");
      return;
    }

    const newUser: User = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      joinDate: new Date().toISOString().split("T")[0],
      location: formData.location || "Not specified",
      birthDate: formData.birthDate || "Not specified",
      orders: 0,
      spent: "$0.00",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    };

    setUsers([newUser, ...users]);
    setAddUserModal(false);
    resetForm();
    alert("User added successfully!");
  };

  const handleEditUser = () => {
    if (!editUserModal) return;
    
    setUsers(users.map((u) =>
      u.id === editUserModal.id
        ? {
            ...u,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            birthDate: formData.birthDate,
          }
        : u
    ));

    if (selectedUser?.id === editUserModal.id) {
      setSelectedUser({
        ...editUserModal,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        birthDate: formData.birthDate,
      });
    }

    setEditUserModal(null);
    resetForm();
    alert("User updated successfully!");
  };

  const handleDeleteUser = () => {
    if (!deleteModal) return;
    setUsers(users.filter((u) => u.id !== deleteModal.id));
    if (selectedUser?.id === deleteModal.id) {
      setSelectedUser(null);
    }
    setDeleteModal(null);
    alert("User deleted successfully!");
  };

  const openEditModal = (user: User) => {
    setEditUserModal(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      birthDate: user.birthDate,
    });
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      birthDate: "",
    });
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
            Users Management
          </h1>
          <p className="text-[#6b6b88]">Manage and view all registered users</p>
        </div>
        <button 
          onClick={() => setAddUserModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
        >
          <UserPlus className="size-4" />
          Add New User
        </button>
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
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
                    onClick={() => { setSortFilter("orders-high"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "orders-high" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Most Orders
                  </button>
                  <button
                    onClick={() => { setSortFilter("orders-low"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "orders-low" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Least Orders
                  </button>
                  <button
                    onClick={() => { setSortFilter("spent-high"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "spent-high" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Highest Spent
                  </button>
                  <button
                    onClick={() => { setSortFilter("spent-low"); setShowFilters(false); }}
                    className={`w-full rounded px-2 py-2 text-left text-sm hover:bg-[#f5f6fa] ${
                      sortFilter === "spent-low" ? "bg-[#f5f6fa] text-[#0048ff]" : "text-[#090838]"
                    }`}
                  >
                    Lowest Spent
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
            <div className="grid grid-cols-1 divide-y divide-[#e1e1e7]">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`cursor-pointer p-6 transition-colors hover:bg-[#f5f6fa] ${
                    selectedUser?.id === user.id ? "bg-[#f5f6fa]" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-[#090838]">{user.name}</h3>
                        <p className="text-sm text-[#6b6b88]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#090838]">{user.orders} orders</p>
                        <p className="text-sm text-[#6b6b88]">{user.spent} spent</p>
                      </div>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.status}
                      </span>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === user.id ? null : user.id);
                          }}
                          className="rounded-lg p-2 hover:bg-white"
                        >
                          <MoreVertical className="size-4 text-[#6b6b88]" />
                        </button>

                        {/* Kebab Menu */}
                        {openMenuId === user.id && (
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
                                    setSelectedUser(user);
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
                                    toggleUserStatus(user.id);
                                  }}
                                  className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-[#090838] hover:bg-[#f5f6fa]"
                                >
                                  <Power className="size-4" />
                                  {user.status === "active" ? "Deactivate" : "Activate"}
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
          </div>
        </div>

        {/* User Details Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
            {selectedUser ? (
              <div>
                <div className="mb-6 text-center">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="mx-auto mb-4 size-24 rounded-full object-cover"
                  />
                  <h2 className="mb-1 text-xl font-semibold text-[#090838]">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-[#6b6b88]">Member since {selectedUser.joinDate}</p>
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
                      <p className="text-sm text-[#090838]">{selectedUser.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <Calendar className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Birth Date</p>
                      <p className="text-sm text-[#090838]">{selectedUser.birthDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] p-3">
                    <MapPin className="size-5 text-[#6b6b88]" />
                    <div>
                      <p className="text-xs text-[#6b6b88]">Location</p>
                      <p className="text-sm text-[#090838]">{selectedUser.location}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-3">
                    <span className="text-sm text-[#6b6b88]">Total Orders</span>
                    <span className="font-semibold text-[#090838]">{selectedUser.orders}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-3">
                    <span className="text-sm text-[#6b6b88]">Total Spent</span>
                    <span className="font-semibold text-[#090838]">{selectedUser.spent}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-3">
                    <span className="text-sm text-[#6b6b88]">Status</span>
                    <button
                      onClick={() => toggleUserStatus(selectedUser.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        selectedUser.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedUser.status}
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

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Add New User</h2>
              <button onClick={() => { setAddUserModal(false); resetForm(); }}>
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => { setAddUserModal(false); resetForm(); }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddUser}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
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
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Save Changes
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
                Are you sure you want to delete "{deleteModal.name}"? This action cannot be undone and will remove all user data.
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
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete User
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
                  <label className="mb-2 block text-sm font-medium text-[#090838]">To: {messageModal.name}</label>
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
                  alert(`Message sent to ${messageModal.name}!`);
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
