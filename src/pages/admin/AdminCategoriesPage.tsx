/**
 * @file src/pages/admin/AdminCategoriesPage.tsx
 * Marketplace category & taxonomy management portal for MarketNest Administrators.
 * Create, edit, reorder, and configure SEO metadata with duplicate slug prevention.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { MarketplaceCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Search,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { adminProfile, hasPermission } = useAdmin();
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MarketplaceCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    sortOrder: 1,
    seoTitle: '',
    seoDescription: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (err) {
      console.warn('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
      sortOrder: categories.length + 1,
      seoTitle: '',
      seoDescription: ''
    });
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat: MarketplaceCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image || '',
      sortOrder: cat.sortOrder,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
      seoTitle: `${name} | MarketNest Nigeria`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    // Slug duplication check
    const existing = categories.find(
      (c) => c.slug === formData.slug && (!editingCategory || c.id !== editingCategory.id)
    );
    if (existing) {
      setError(`A category with slug "${formData.slug}" already exists.`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData, {
          id: adminProfile.id,
          name: adminProfile.name
        });
      } else {
        await adminService.createCategory(formData, {
          id: adminProfile.id,
          name: adminProfile.name
        });
      }
      setShowModal(false);
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Marketplace Categories & Taxonomy</h2>
          <p className="text-xs text-[#6B726E]">
            Organize departments, sort priorities, custom imagery, and search engine metadata.
          </p>
        </div>

        {hasPermission('settings.manage') && (
          <Button
            variant="primary"
            size="sm"
            onClick={openCreate}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Department
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Department & Image</th>
                <th className="py-3 px-4">Slug Key</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B726E]">
                    No categories registered. Click "Add Department" to create one.
                  </td>
                </tr>
              ) : (
                categories
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#6B726E] tabular-nums">
                        #{cat.sortOrder}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-9 h-9 rounded-lg object-cover border border-[#E4E7E5] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5] flex items-center justify-center text-[#6B726E]">
                              <Layers className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-bold text-[#101413]">{cat.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-[#101413]">
                        <span className="bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E4E7E5]">
                          /{cat.slug}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E] max-w-xs truncate">
                        {cat.description || 'No description entered'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-[#E8F5EF] text-[#0E8F5A] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {cat.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(cat)}
                        >
                          Configure
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#101413]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E4E7E5] rounded-xl max-w-lg w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#101413]">
                  {editingCategory ? `Configure: ${editingCategory.name}` : 'Create Department'}
                </h3>
                <p className="text-xs text-[#6B726E] mt-0.5">
                  Set marketplace display title, clean URL slug, and SEO metadata.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#6B726E] hover:text-[#101413] p-1 rounded hover:bg-[#F7F5F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#101413]">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Fine Jewelry"
                    className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#101413]">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="fine-jewelry"
                    className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#101413]">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary for category browse header..."
                  className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-[#101413]">Banner Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#101413]">Display Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 bg-[#FBFBFA] p-3 rounded-lg border border-[#E4E7E5]">
                <label className="font-bold text-[#101413] block">SEO Title Tag</label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="SEO Title..."
                  className="w-full p-2 rounded border border-[#E4E7E5] bg-white text-xs"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-200">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={saving}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
