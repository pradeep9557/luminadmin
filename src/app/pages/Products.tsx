import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, DollarSign, ShoppingCart, X, Upload } from "lucide-react";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getOrders,
} from "../api";

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
  sku?: string;
}

interface Order {
  id: string;
  product: string;
  user: string;
  userAvatar: string;
  quantity: number;
  total: string;
  status: string;
  date: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Crystals",
    price: "",
    stock: "",
    description: "",
    image: "",
    sku: "",
  });

  // Fetch products on mount and when filters/search change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, stockFilter, pagination.page]);

  // Fetch orders on mount and tab change
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      if (stockFilter !== "all") {
        params.inStock = stockFilter !== "low";
      }

      const response = await getProducts(params);
      const productsData = Array.isArray(response) ? response
        : response.data ? response.data
        : response.products ? response.products
        : [];
      setProducts(productsData);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const response = await getOrders();
      const ordersData = Array.isArray(response) ? response
        : response.data ? response.data
        : response.orders ? response.orders
        : [];
      setOrders(ordersData);
    } catch (err) {
      setOrdersError("Failed to fetch orders. Please try again.");
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getProductCategories();
      const categories = Array.isArray(response) ? response
        : response.data ? response.data
        : response.categories ? response.categories
        : [];
      setCategories(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Fallback to default categories
      setCategories(["Crystals", "Tarot", "Meditation", "Books", "Aromatherapy", "Decor"]);
    }
  };

  // Filtered products (client-side filtering after API fetch)
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
  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: [formData.image || "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&h=400&fit=crop"],
        status: "active",
        sku: formData.sku || "",
      });

      setShowAddModal(false);
      resetForm();
      showSuccess(`"${formData.name}" has been added successfully!`);
      fetchProducts();
    } catch (err) {
      alert("Failed to add product. Please try again.");
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editProduct) return;

    setLoading(true);
    try {
      await updateProduct(editProduct.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: [formData.image],
        status: "active",
        sku: formData.sku || "",
      });

      setEditProduct(null);
      resetForm();
      showSuccess(`"${formData.name}" has been updated successfully!`);
      fetchProducts();
    } catch (err) {
      alert("Failed to update product. Please try again.");
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    setLoading(true);
    try {
      await deleteProduct(deleteProduct.id);
      setDeleteProduct(null);
      showSuccess(`"${deleteProduct.name}" has been deleted successfully!`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product. Please try again.");
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
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
      sku: product.sku || "",
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
      sku: "",
    });
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const totalOrders = products.reduce((sum, p) => sum + p.orders, 0);
  const lowStockCount = products.filter((p) => p.stock < 30).length;

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
              <p className="mt-2 text-3xl font-semibold text-[#090838]">
                {loading ? "-" : products.length}
              </p>
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
                {loading ? "-" : totalOrders}
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
              <p className="mt-2 text-3xl font-semibold text-green-600">
                ${(products.reduce((sum, p) => sum + parseFloat(p.price.replace("$", "")), 0) * totalOrders).toFixed(2)}
              </p>
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
                {loading ? "-" : lowStockCount}
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
          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
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
                    setPagination({ ...pagination, page: 1 });
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
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setPagination({ ...pagination, page: 1 });
                    }}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Stock Level</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => {
                      setStockFilter(e.target.value);
                      setPagination({ ...pagination, page: 1 });
                    }}
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-[#f5f6fa]">
                  <div className="size-6 animate-spin rounded-full border-2 border-[#e1e1e7] border-t-[#0048ff]"></div>
                </div>
                <p className="text-sm text-[#6b6b88]">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="mx-auto mb-4 size-12 text-[#e1e1e7]" />
                <p className="text-sm text-[#6b6b88]">No products found</p>
              </div>
            </div>
          ) : (
            <>
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
        </>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="rounded-xl border border-[#e1e1e7] bg-white shadow-sm">
          {ordersError && (
            <div className="border-b border-[#e1e1e7] p-6">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{ordersError}</p>
              </div>
            </div>
          )}

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-[#f5f6fa]">
                  <div className="size-6 animate-spin rounded-full border-2 border-[#e1e1e7] border-t-[#0048ff]"></div>
                </div>
                <p className="text-sm text-[#6b6b88]">Loading orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-4 size-12 text-[#e1e1e7]" />
                <p className="text-sm text-[#6b6b88]">No orders found</p>
              </div>
            </div>
          ) : (
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
                  {orders.map((order) => (
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
          )}
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
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
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
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., SKU123"
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
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Product"}
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
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
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
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
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
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
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
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Product"}
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
