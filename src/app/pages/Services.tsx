import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Star, DollarSign, Clock, Users, X, Search } from "lucide-react";
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
} from "../api";

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  rating: number;
  reviews: number;
  orders: number;
  status: "active" | "inactive";
  image: string;
}

interface Category {
  id: number;
  name: string;
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Service | null>(null);
  const [deleteModal, setDeleteModal] = useState<Service | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    status: "active" as "active" | "inactive",
    image: "",
    features: [] as string[],
  });

  const categoryOptions = ["all", ...categories.map((c) => c.name)];

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getServiceCategories();
        const data = Array.isArray(response) ? response
          : response.data ? response.data
          : response.categories ? response.categories
          : [];
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, category: data[0].name }));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch services when filters/search change
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getServices({
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          status: undefined,
          priceRange: undefined,
        });
        const servicesData = Array.isArray(response) ? response
          : response.data ? response.data
          : response.services ? response.services
          : [];
        setServices(servicesData);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || servicesData.length,
        }));
      } catch (err) {
        setError("Failed to load services");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchQuery, pagination.page]);

  const handleAddService = async () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.duration ||
      !formData.description ||
      !formData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createService({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        duration: formData.duration,
        status: formData.status,
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=300&fit=crop",
        features: formData.features,
      });

      setAddModal(false);
      resetForm();
      setSuccessMessage(`"${formData.name}" has been added successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh services list
      setSelectedCategory("all");
      setSearchQuery("");
      setPagination({ page: 1, limit: 12, total: 0 });
    } catch (err) {
      setError("Failed to create service");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async () => {
    if (!editModal) return;

    if (
      !formData.name ||
      !formData.price ||
      !formData.duration ||
      !formData.description ||
      !formData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateService(editModal.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        duration: formData.duration,
        status: formData.status,
        image: formData.image || editModal.image,
        features: formData.features,
      });

      setEditModal(null);
      resetForm();
      setSuccessMessage(`"${formData.name}" has been updated successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh services list
      setPagination({ page: 1, limit: 12, total: 0 });
    } catch (err) {
      setError("Failed to update service");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteModal) return;

    setIsSubmitting(true);
    try {
      await deleteService(deleteModal.id);
      setDeleteModal(null);
      setSuccessMessage(`"${deleteModal.name}" has been deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh services list
      setPagination({ page: 1, limit: 12, total: 0 });
    } catch (err) {
      setError("Failed to delete service");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (service: Service) => {
    setEditModal(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      duration: service.duration,
      status: service.status,
      image: service.image,
      features: [],
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: categories.length > 0 ? categories[0].name : "",
      description: "",
      price: "",
      duration: "",
      status: "active",
      image: "",
      features: [],
    });
  };

  const activeServicesCount = services.filter(
    (s) => s.status === "active"
  ).length;
  const totalOrders = services.reduce((sum, s) => sum + s.orders, 0);

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <div className="size-12 animate-spin rounded-full border-4 border-[#e1e1e7] border-t-[#0048ff]"></div>
          </div>
          <p className="text-[#6b6b88]">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-6 py-4">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
            Services Management
          </h1>
          <p className="text-[#6b6b88]">Manage all available astrology services</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
        >
          <Plus className="size-4" />
          Add New Service
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
          <input
            type="text"
            placeholder="Search services by name or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination({ page: 1, limit: 12, total: 0 });
            }}
            className="w-full rounded-lg border border-[#e1e1e7] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categoryOptions.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setPagination({ page: 1, limit: 12, total: 0 });
            }}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-[#0048ff] text-white"
                : "border border-[#e1e1e7] bg-white text-[#6b6b88] hover:bg-[#f5f6fa]"
            }`}
          >
            {category === "all" ? "All Services" : category}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading && services.length > 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="size-12 animate-spin rounded-full border-4 border-[#e1e1e7] border-t-[#0048ff]"></div>
            </div>
            <p className="text-[#6b6b88]">Loading services...</p>
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-[#e1e1e7] bg-[#f5f6fa] p-12">
          <div className="text-center">
            <p className="text-[#6b6b88]">No services found. Try adjusting your filters or add a new service.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="group overflow-hidden rounded-xl border border-[#e1e1e7] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Service Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={service.image}
                  alt={service.name}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=300&fit=crop";
                  }}
                />
                <div className="absolute right-3 top-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      service.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-[#f5f6fa] px-2 py-1 text-xs font-medium text-[#6b6b88]">
                      {service.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-[#090838]">{service.rating}</span>
                    <span className="text-xs text-[#6b6b88]">({service.reviews})</span>
                  </div>
                </div>

                <h3 className="mb-2 font-semibold text-[#090838]">{service.name}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-[#6b6b88]">{service.description}</p>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#6b6b88]">
                      <DollarSign className="size-4" />
                      <span>Price</span>
                    </div>
                    <span className="font-semibold text-[#090838]">{service.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#6b6b88]">
                      <Clock className="size-4" />
                      <span>Duration</span>
                    </div>
                    <span className="font-medium text-[#090838]">{service.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#6b6b88]">
                      <Users className="size-4" />
                      <span>Orders</span>
                    </div>
                    <span className="font-medium text-[#090838]">{service.orders}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    <Edit className="size-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteModal(service)}
                    className="flex items-center justify-center rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Services</p>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">{pagination.total || services.length}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
              <Star className="size-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Active Services</p>
              <p className="mt-2 text-3xl font-semibold text-green-600">{activeServicesCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-green-100">
              <Star className="size-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Orders</p>
              <p className="mt-2 text-3xl font-semibold text-purple-600">
                {totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-purple-100">
              <Users className="size-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Add New Service</h2>
              <button
                onClick={() => {
                  setAddModal(false);
                  resetForm();
                }}
              >
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Service Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter service name"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                    }
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Price *</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="$49.99"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Duration *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60 min"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Enter service description"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-example.jpg"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-[#6b6b88]">Leave empty to use default image</p>
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Image Preview</label>
                    <div className="overflow-hidden rounded-lg border border-[#e1e1e7]">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=300&fit=crop";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => {
                  setAddModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Edit Service</h2>
              <button
                onClick={() => {
                  setEditModal(null);
                  resetForm();
                }}
              >
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Service Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                    }
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => {
                  setEditModal(null);
                  resetForm();
                }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditService}
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
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
              <h2 className="mb-2 text-xl font-semibold text-[#090838]">Delete Service</h2>
              <p className="text-sm text-[#6b6b88]">
                Are you sure you want to delete "{deleteModal.name}"? This action cannot be undone.
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
                onClick={handleDeleteService}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Service"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-8 right-8 z-50 rounded-lg border border-green-200 bg-green-50 px-6 py-4 shadow-lg">
          <p className="text-sm font-medium text-green-900">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
