'use client';

import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import { useCreateProductMutation, useDeleteProductMutation, useGetProductsQuery, useGetUsersQuery, useUpdateProductMutation, useGetCategoriesQuery } from '@/lib/adminApi';

type Product = import('@/lib/adminApi').AdminProduct;

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    price: '',
    vendorId: '',
    status: 'active' as Product['status'],
    description: '',
    shippingRequired: true,
    freeShipping: false,
    shippingCost: '',
    shippingWeight: '',
    length: '',
    width: '',
    height: '',
    images: '',
  });

  const { data: products = [] } = useGetProductsQuery({ limit: 100 });
  const { data: users = [] } = useGetUsersQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const vendors = useMemo(() => users.map((user) => ({ id: user.id, name: user.name, email: user.email })), [users]);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({ title: '', category: '', price: '', vendorId: vendors[0]?.id || '', status: 'active', description: '', shippingRequired: true, freeShipping: false, shippingCost: '', shippingWeight: '', length: '', width: '', height: '', images: '' });
    setEditingProductId(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      title: product.title,
      category: product.category,
      price: String(product.price),
      vendorId: product.vendorId || vendors[0]?.id || '',
      status: product.status,
      description: '',
      shippingRequired: product.shippingRequired,
      freeShipping: product.freeShipping,
      shippingCost: String(product.shippingCost || ''),
      shippingWeight: String(product.shippingWeight || ''),
      length: String(product.dimensions?.length || ''),
      width: String(product.dimensions?.width || ''),
      height: String(product.dimensions?.height || ''),
      images: Array.isArray((product as any).images) ? (product as any).images.join(', ') : '',
    });
    setEditingProductId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.price || !form.vendorId) {
      alert('Title, category, price, and vendor are required.');
      return;
    }
    const images = form.images.split(',').map((image) => image.trim()).filter(Boolean);
    if (images.length < 4) { alert('At least four image URLs are required.'); return; }
    if (form.shippingRequired && (!form.shippingWeight || !form.length || !form.width || !form.height)) {
      alert('Enter shipping weight and all package dimensions.');
      return;
    }
    const shipping = {
      shippingRequired: form.shippingRequired,
      freeShipping: form.freeShipping,
      shippingCost: form.freeShipping ? 0 : Number(form.shippingCost || 0),
      shippingWeight: form.shippingRequired ? Number(form.shippingWeight) : undefined,
      dimensions: form.shippingRequired ? { length: Number(form.length), width: Number(form.width), height: Number(form.height) } : undefined,
    };
    try {
      const isEditing = Boolean(editingProductId);
      if (editingProductId) {
        await updateProduct({
          id: editingProductId,
          title: form.title.trim(),
          name: form.title.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          sellerId: form.vendorId,
          userId: form.vendorId,
          status: form.status,
          description: form.description.trim(),
          images,
          ...shipping,
        }).unwrap();
      } else {
        await createProduct({
          title: form.title.trim(),
          name: form.title.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          sellerId: form.vendorId,
          userId: form.vendorId,
          status: form.status,
          description: form.description.trim(),
          images,
          ...shipping,
        }).unwrap();
      }
      resetForm();
      alert(isEditing ? 'Product updated and catalogue visibility refreshed.' : 'Product created and published to the catalogue.');
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const message = typeof error === 'object' && error && 'data' in error
        && typeof (error as { data?: { message?: string } }).data?.message === 'string'
        ? (error as { data: { message: string } }).data.message
        : 'Product could not be saved. Please try again.';
      alert(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await deleteProduct(id).unwrap(); } catch (error) { console.error('Error deleting product:', error); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Products & Services</h1>
        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
            <button onClick={resetForm} className="admin-btn admin-btn-secondary">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="admin-input" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-input">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" className="admin-input" />
            <select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })} className="admin-input">
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name} ({vendor.email})</option>
              ))}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })} className="admin-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="admin-input" />
            <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="At least 4 image URLs (comma-separated)" className="admin-input md:col-span-2" />
          </div>
          <fieldset className="rounded border border-gray-200 p-3 space-y-3">
            <legend className="px-1 text-sm font-medium text-gray-700">Shiprocket package details</legend>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.shippingRequired} onChange={(e) => setForm({ ...form, shippingRequired: e.target.checked })} /> Requires shipping</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })} disabled={!form.shippingRequired} /> Free shipping</label>
            </div>
            {form.shippingRequired && <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={form.shippingWeight} onChange={(e) => setForm({ ...form, shippingWeight: e.target.value })} placeholder="Weight (kg) *" min="0.1" step="0.1" type="number" className="admin-input" />
              <input value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} placeholder="Length (cm) *" min="1" type="number" className="admin-input" />
              <input value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} placeholder="Width (cm) *" min="1" type="number" className="admin-input" />
              <input value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="Height (cm) *" min="1" type="number" className="admin-input" />
              {!form.freeShipping && <input value={form.shippingCost} onChange={(e) => setForm({ ...form, shippingCost: e.target.value })} placeholder="Shipping charge (₹)" min="0" type="number" className="admin-input md:col-span-2" />}
            </div>}
            <p className="text-xs text-gray-500">Weight and dimensions are required so Shiprocket can select an eligible courier and generate an AWB.</p>
          </fieldset>
          <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="admin-btn admin-btn-primary">
            {isCreating || isUpdating ? 'Saving...' : editingProductId ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      )}

      <div className="card mb-4">
        <div className="flex items-center">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm text-gray-700" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Vendor</th>
              <th>Rating</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="font-medium">{product.title}</td>
                <td>{product.category}</td>
                <td>₹{product.price.toLocaleString()}</td>
                <td>{product.vendor}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium">{product.rating || '—'}</span>
                    <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                  </div>
                </td>
                <td className="text-xs">{product.totalOrders}</td>
                <td>
                  <span className={`admin-badge ${product.status === 'active' ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(product)} className="admin-btn admin-btn-secondary"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(product.id)} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
