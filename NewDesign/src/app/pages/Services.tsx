import { useState } from "react";
import { Plus, Edit, Trash2, Star, DollarSign, Clock, Users, X, Search } from "lucide-react";

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

const initialServices: Service[] = [
  {
    id: 1,
    name: "Birth Chart Reading",
    category: "Astrology",
    description: "Comprehensive birth chart analysis with planetary positions and life insights",
    price: "$49.99",
    duration: "60 min",
    rating: 4.9,
    reviews: 342,
    orders: 3500,
    status: "active",
    image: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Tarot Reading",
    category: "Tarot",
    description: "In-depth tarot card reading for guidance and clarity on life questions",
    price: "$29.99",
    duration: "45 min",
    rating: 4.8,
    reviews: 285,
    orders: 2800,
    status: "active",
    image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Compatibility Report",
    category: "Compatibility",
    description: "Detailed relationship compatibility analysis based on astrological charts",
    price: "$39.99",
    duration: "30 min",
    rating: 4.7,
    reviews: 198,
    orders: 2200,
    status: "active",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Monthly Horoscope",
    category: "Horoscope",
    description: "Personalized monthly horoscope predictions and guidance",
    price: "$19.99",
    duration: "20 min",
    rating: 4.6,
    reviews: 456,
    orders: 1800,
    status: "active",
    image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Career Guidance",
    category: "Astrology",
    description: "Career path analysis and professional guidance based on your chart",
    price: "$59.99",
    duration: "75 min",
    rating: 4.9,
    reviews: 178,
    orders: 1500,
    status: "active",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Love Reading",
    category: "Tarot",
    description: "Focused tarot reading on matters of the heart and relationships",
    price: "$34.99",
    duration: "40 min",
    rating: 4.8,
    reviews: 223,
    orders: 1200,
    status: "active",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Yearly Forecast",
    category: "Horoscope",
    description: "Complete yearly forecast with major life events and opportunities",
    price: "$79.99",
    duration: "90 min",
    rating: 4.9,
    reviews: 145,
    orders: 980,
    status: "active",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Chakra Reading",
    category: "Spiritual",
    description: "Energy chakra analysis and balancing recommendations",
    price: "$44.99",
    duration: "50 min",
    rating: 4.7,
    reviews: 167,
    orders: 750,
    status: "inactive",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop",
  },
];

export function Services() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Service | null>(null);
  const [deleteModal, setDeleteModal] = useState<Service | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "Astrology",
    description: "",
    price: "",
    duration: "",
    status: "active" as "active" | "inactive",
    image: "",
  });

  const categories = ["all", "Astrology", "Tarot", "Horoscope", "Compatibility", "Spiritual"];

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddService = () => {
    if (!formData.name || !formData.price || !formData.duration || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    const newService: Service = {
      id: Math.max(...services.map((s) => s.id)) + 1,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      rating: 4.5,
      reviews: 0,
      orders: 0,
      status: formData.status,
      image: formData.image || "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=300&fit=crop",
    };
    
    // Add new service at the beginning of the array
    setServices([newService, ...services]);
    setAddModal(false);
    resetForm();
    
    // Show success message
    setSuccessMessage(`"${formData.name}" has been added successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
    
    // Reset category filter to "all" so the new service is visible
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const handleEditService = () => {
    if (!editModal) return;
    setServices(
      services.map((s) =>
        s.id === editModal.id
          ? {
              ...s,
              name: formData.name,
              category: formData.category,
              description: formData.description,
              price: formData.price,
              duration: formData.duration,
              status: formData.status,
              image: formData.image || s.image,
            }
          : s
      )
    );
    setEditModal(null);
    resetForm();
  };

  const handleDeleteService = () => {
    if (!deleteModal) return;
    setServices(services.filter((s) => s.id !== deleteModal.id));
    setDeleteModal(null);
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
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Astrology",
      description: "",
      price: "",
      duration: "",
      status: "active",
      image: "",
    });
  };

  return (
    <div className="p-8">
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#e1e1e7] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredServices.map((service) => (
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

      {/* Summary */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Services</p>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">{services.length}</p>
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
              <p className="mt-2 text-3xl font-semibold text-green-600">
                {services.filter((s) => s.status === "active").length}
              </p>
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
                {services.reduce((sum, s) => sum + s.orders, 0).toLocaleString()}
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
              <button onClick={() => { setAddModal(false); resetForm(); }}>
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
                    <option value="Astrology">Astrology</option>
                    <option value="Tarot">Tarot</option>
                    <option value="Horoscope">Horoscope</option>
                    <option value="Compatibility">Compatibility</option>
                    <option value="Spiritual">Spiritual</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
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
                          e.currentTarget.src = "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=300&fit=crop";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => { setAddModal(false); resetForm(); }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Add Service
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
              <button onClick={() => { setEditModal(null); resetForm(); }}>
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
                    <option value="Astrology">Astrology</option>
                    <option value="Tarot">Tarot</option>
                    <option value="Horoscope">Horoscope</option>
                    <option value="Compatibility">Compatibility</option>
                    <option value="Spiritual">Spiritual</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
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
                onClick={() => { setEditModal(null); resetForm(); }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditService}
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
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Service
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