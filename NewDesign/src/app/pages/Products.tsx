import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, DollarSign, ShoppingCart, X, Upload } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  orders: number;
  status: string;
  image: string;
  description: string;
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Crystal Healing Set",
    category: "Crystals",
    price: "$49.99",
    stock: 45,
    orders: 123,
    status: "active",
    image: "https://images.unsplash.com/photo-1599932347735-864b6c496251?w=400&h=400&fit=crop",
    description: "Premium crystal healing set with 7 chakra stones",
  },
  {
    id: 2,
    name: "Tarot Deck - Mystical Edition",
    category: "Tarot",
    price: "$34.99",
    stock: 78,
    orders: 234,
    status: "active",
    image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=400&fit=crop",
    description: "Beautiful illustrated tarot deck with guidebook",
  },
  {
    id: 3,
    name: "Meditation Cushion",
    category: "Meditation",
    price: "$59.99",
    stock: 32,
    orders: 87,
    status: "active",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=400&fit=crop",
    description: "Comfortable meditation cushion with ergonomic design",
  },
  {
    id: 4,
    name: "Astrology Journal",
    category: "Books",
    price: "$24.99",
    stock: 120,
    orders: 156,
    status: "active",
    image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&h=400&fit=crop",
    description: "Track your astrological journey with this beautiful journal",
  },
  {
    id: 5,
    name: "Incense Gift Set",
    category: "Aromatherapy",
    price: "$29.99",
    stock: 64,
    orders: 198,
    status: "active",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    description: "Premium incense collection for meditation and relaxation",
  },
  {
    id: 6,
    name: "Moon Phase Wall Art",
    category: "Decor",
    price: "$79.99",
    stock: 23,
    orders: 67,
    status: "active",
    image: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=400&fit=crop",
    description: "Beautiful moon phase artwork for your spiritual space",
  },
];

const orderRequests = [
  {
    id: "ORD-2001",
    product: "Crystal Healing Set",
    user: "Sarah Johnson",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    quantity: 2,
    total: "$99.98",
    status: "pending",
    date: "2026-03-03",
  },
  {
    id: "ORD-2002",
    product: "Tarot Deck - Mystical Edition",
    user: "Michael Chen",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    quantity: 1,
    total: "$34.99",
    status: "processing",
    date: "2026-03-03",
  },
  {
    id: "ORD-2003",
    product: "Meditation Cushion",
    user: "Emma Williams",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    quantity: 1,
    total: "$59.99",
    status: "shipped",
    date: "2026-03-02",
  },
  {
    id: "ORD-2004",
    product: "Astrology Journal",
    user: "James Brown",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    quantity: 3,
    total: "$74.97",
    status: "delivered",
    date: "2026-03-01",
  },
];

export function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Crystals",
    price: "",
    stock: "",
    description: "",
    image: "",
  });

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock < 30) ||
      (stockFilter === "medium" && product.stock >= 30 && product.stock < 80) ||
      (stockFilter === "high" && product.stock >= 80);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Handlers
  const handleAddProduct = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    const newProduct: Product = {
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: formData.name,
      category: formData.category,
      price: `$${formData.price}`,
      stock: parseInt(formData.stock),
      orders: 0,
      status: "active",
      image: formData.image || "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=400&fit=crop",
      description: formData.description,
    };

    setProducts([newProduct, ...products]);
    setShowAddModal(false);
    resetForm();
    showSuccess(`"${formData.name}" has been added successfully!`);
  };

  const handleEditProduct = () => {
    if (!editProduct) return;

    setProducts(
      products.map((p) =>
        p.id === editProduct.id
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              price: formData.price.startsWith("$") ? formData.price : `$${formData.price}`,
              stock: parseInt(formData.stock),
              description: formData.description,
              image: formData.image,
            }
          : p
      )
    );

    setEditProduct(null);
    resetForm();
    showSuccess(`"${formData.name}" has been updated successfully!`);
  };

  const handleDeleteProduct = () => {
    if (!deleteProduct) return;
    setProducts(products.filter((p) => p.id !== deleteProduct.id));
    setDeleteProduct(null);
    showSuccess(`"${deleteProduct.name}" has been deleted successfully!`);
  };

  const openEditModal = (product: Product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.replace("$", ""),
      stock: product.stock.toString(),
      description: product.description,
      image: product.image,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Crystals",
      price: "",
      stock: "",
      description: "",
      image: "",
    });
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
            Product Management
          </h1>
          <p className="text-[#6b6b88]">Manage products and track orders</p>
        </div>
        {activeTab === "products" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
          >
            <Plus className="size-4" />
            Add Product
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Products</p>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">{products.length}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
              <Package className="size-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Orders</p>
              <p className="mt-2 text-3xl font-semibold text-purple-600">
                {products.reduce((sum, p) => sum + p.orders, 0)}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-purple-100">
              <ShoppingCart className="size-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Revenue</p>
              <p className="mt-2 text-3xl font-semibold text-green-600">$47,382</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="size-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Low Stock</p>
              <p className="mt-2 text-3xl font-semibold text-red-600">
                {products.filter((p) => p.stock < 30).length}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-red-100">
              <Package className="size-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-[#e1e1e7]">
        <button
          onClick={() => setActiveTab("products")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "products"
              ? "border-[#0048ff] text-[#0048ff]"
              : "border-transparent text-[#6b6b88] hover:text-[#090838]"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "orders"
              ? "border-[#0048ff] text-[#0048ff]"
              : "border-transparent text-[#6b6b88] hover:text-[#090838]"
          }`}
        >
          Order Requests
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#e1e1e7] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
            >
              <Filter className="size-4" />
              Filters
              {(categoryFilter !== "all" || stockFilter !== "all") && (
                <span className="flex size-5 items-center justify-center rounded-full bg-[#0048ff] text-xs text-white">
                  {(categoryFilter !== "all" ? 1 : 0) + (stockFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-6 rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[#090838]">Filters</h3>
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setStockFilter("all");
                  }}
                  className="text-sm text-[#0048ff] hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Crystals">Crystals</option>
                    <option value="Tarot">Tarot</option>
                    <option value="Meditation">Meditation</option>
                    <option value="Books">Books</option>
                    <option value="Aromatherapy">Aromatherapy</option>
                    <option value="Decor">Decor</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Stock Level</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="low">Low Stock (&lt; 30)</option>
                    <option value="medium">Medium Stock (30-79)</option>
                    <option value="high">High Stock (≥ 80)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-xl border border-[#e1e1e7] bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.stock < 30
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-[#f5f6fa] px-2 py-1 text-xs font-medium text-[#6b6b88]">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-[#090838]">{product.name}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-[#6b6b88]">{product.description}</p>

                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-[#090838]">{product.price}</span>
                    <span className="text-sm text-[#6b6b88]">{product.orders} orders</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
                    >
                      <Edit className="size-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setViewProduct(product)}
                      className="flex items-center justify-center rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="rounded-xl border border-[#e1e1e7] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e1e1e7] bg-[#f5f6fa]">
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderRequests.map((order) => (
                  <tr key={order.id} className="border-b border-[#e1e1e7] last:border-0 hover:bg-[#f5f6fa]">
                    <td className="px-6 py-4 text-sm font-medium text-[#090838]">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.userAvatar}
                          alt={order.user}
                          className="size-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-[#6b6b88]">{order.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b6b88]">{order.product}</td>
                    <td className="px-6 py-4 text-sm text-[#090838]">{order.quantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#090838]">{order.total}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b6b88]">{order.date}</td>
                    <td className="px-6 py-4">
                      <button className="rounded-lg p-2 hover:bg-[#e1e1e7]">
                        <Eye className="size-4 text-[#6b6b88]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Add New Product</h2>
              <p className="text-sm text-[#6b6b88]">Create a new product listing</p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Product Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-example.jpg"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-[#6b6b88]">Leave empty to use default image</p>
                  {formData.image && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e1e7]">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=400&fit=crop";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Crystal Healing Set"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    >
                      <option>Crystals</option>
                      <option>Tarot</option>
                      <option>Meditation</option>
                      <option>Books</option>
                      <option>Aromatherapy</option>
                      <option>Decor</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Price *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the product..."
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Edit Product</h2>
              <p className="text-sm text-[#6b6b88]">Update product details</p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Product Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-example.jpg"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                  {formData.image && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e1e7]">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=400&fit=crop";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    >
                      <option>Crystals</option>
                      <option>Tarot</option>
                      <option>Meditation</option>
                      <option>Books</option>
                      <option>Aromatherapy</option>
                      <option>Decor</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Price *</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => {
                  setEditProduct(null);
                  resetForm();
                }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProduct}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">{viewProduct.name}</h2>
              <p className="text-sm text-[#6b6b88]">Product Details</p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-xl border border-[#e1e1e7]">
                  <img
                    src={viewProduct.image}
                    alt={viewProduct.name}
                    className="h-64 w-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-[#e1e1e7] p-4">
                    <p className="mb-1 text-sm text-[#6b6b88]">Category</p>
                    <p className="font-semibold text-[#090838]">{viewProduct.category}</p>
                  </div>
                  <div className="rounded-lg border border-[#e1e1e7] p-4">
                    <p className="mb-1 text-sm text-[#6b6b88]">Price</p>
                    <p className="font-semibold text-[#090838]">{viewProduct.price}</p>
                  </div>
                  <div className="rounded-lg border border-[#e1e1e7] p-4">
                    <p className="mb-1 text-sm text-[#6b6b88]">Stock</p>
                    <p className="font-semibold text-[#090838]">{viewProduct.stock} units</p>
                  </div>
                  <div className="rounded-lg border border-[#e1e1e7] p-4">
                    <p className="mb-1 text-sm text-[#6b6b88]">Orders</p>
                    <p className="font-semibold text-[#090838]">{viewProduct.orders}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-[#090838]">Description</p>
                  <p className="text-sm text-[#6b6b88]">{viewProduct.description}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setViewProduct(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  openEditModal(viewProduct);
                  setViewProduct(null);
                }}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#090838]">Delete Product</h2>
              <p className="text-sm text-[#6b6b88]">
                Are you sure you want to delete "{deleteProduct.name}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setDeleteProduct(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed bottom-8 right-8 z-50 rounded-lg border border-green-200 bg-green-50 px-6 py-4 shadow-lg">
          <p className="text-sm font-medium text-green-900">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
