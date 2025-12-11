'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    status: 'A',
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      const response = await api.get('/brands');
      
      // Get the full brand list (not just names)
      const brandList = response.data.brandList || [];
      setBrands(brandList);
    } catch (err: any) {
      console.error('Failed to load brands:', err);
      setError(err.response?.data?.error || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      setLoading(true);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/dashboard/brands/page.tsx:handleSubmit',message:'Submitting brand',data:{isEditing:!!editingBrand,formData},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
      // #endregion

      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, formData);
        setSuccess('Brand updated successfully');
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/dashboard/brands/page.tsx:handleSubmit_before_post',message:'Before POST request',data:{formData},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
        // #endregion
        await api.post('/brands', formData);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/dashboard/brands/page.tsx:handleSubmit_post_success',message:'POST request succeeded',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
        // #endregion
        setSuccess('Brand created successfully');
      }
      resetForm();
      loadBrands();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to save brand:', err);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6bf3b9a1-8e8b-47de-9d0f-0d16374a01db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/app/dashboard/brands/page.tsx:handleSubmit_error',message:'Failed to save brand',data:{error:err.message,responseError:err.response?.data?.error,status:err.response?.status,responseData:err.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'BRANDS_SAVE'})}).catch(()=>{});
      // #endregion
      setError(err.response?.data?.error || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      status: brand.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.delete(`/brands/${id}`);
      setSuccess(response.data.message || 'Brand deleted successfully');
      loadBrands();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete brand');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      status: 'A',
    });
    setEditingBrand(null);
    setShowForm(false);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brands</h1>
          <p className="text-sm text-gray-500">Manage product brands</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-primary-500 hover:bg-primary-600"
        >
          + New Brand
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md">
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBrand ? 'Edit Brand' : 'Create New Brand'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="A">Active</option>
                  <option value="I">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary-500 hover:bg-primary-600">
                  {loading ? 'Saving...' : editingBrand ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Brands ({filteredBrands.length})</CardTitle>
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && !brands.length ? (
            <div className="text-center py-12">Loading brands...</div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No brands found matching your search.' : 'No brands found. Create one to get started.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created At</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{brand.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          brand.status === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {brand.status === 'A' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(brand.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(brand)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(brand.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

