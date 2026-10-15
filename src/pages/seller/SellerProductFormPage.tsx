/**
 * @file src/pages/seller/SellerProductFormPage.tsx
 * Add / Edit Product page for MarketNest sellers.
 * Includes multi-image selector, pricing in ₦ Naira, specs builder, inventory levels, and publishing states.
 */

import React, { useState, useEffect } from 'react';
import { useSeller } from '../../context/SellerContext';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { CategoryId, Product, ProductSpecification, ProductStatus } from '../../types';
import { slugify } from '../../lib/sellerFirestore';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Package,
  Layers,
  Truck
} from 'lucide-react';
import { SellerAiAssistantModal } from '../../components/seller/SellerAiAssistantModal';

const CURATED_SAMPLE_IMAGES = [
  {
    name: 'Artisanal Leather',
    url: '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg'
  },
  {
    name: 'Lifestyle Loft',
    url: '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg'
  },
  {
    name: 'Tech & Audio',
    url: '/src/assets/images/editorial_everyday_tech_1791134164769.jpg'
  },
  {
    name: 'Botanical Skincare',
    url: '/src/assets/images/editorial_beauty_glow_1791134175992.jpg'
  }
];

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'bags', label: 'Bags & Leathercraft' },
  { id: 'electronics', label: 'Electronics & Audio' },
  { id: 'phones', label: 'Phones & Gadgets' },
  { id: 'beauty', label: 'Beauty & Skincare' },
  { id: 'home', label: 'Home & Living' },
  { id: 'shoes', label: 'Shoes & Footwear' },
  { id: 'food', label: 'Food & Gourmet' }
];

interface SellerProductFormPageProps {
  mode: 'new' | 'edit';
  initialOpenAiAssistant?: boolean;
}

export const SellerProductFormPage: React.FC<SellerProductFormPageProps> = ({ mode, initialOpenAiAssistant }) => {
  const {
    sellerProfile,
    sellerProducts,
    activeEditProductId,
    addNewProduct,
    editProduct,
    setActiveDashboardTab
  } = useSeller();
  const { firebaseUser } = useAuth();
  const { navigateTo, showToast } = useMarket();

  // Find product if editing
  const existingProduct = mode === 'edit'
    ? sellerProducts.find((p) => p.id === activeEditProductId)
    : null;

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<CategoryId>('fashion');
  const [price, setPrice] = useState<number>(25000);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [stockCount, setStockCount] = useState<number>(10);
  const [status, setStatus] = useState<ProductStatus>('active');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [deliverySpeed, setDeliverySpeed] = useState<'lagos_sameday' | 'lagos_24h' | 'express_48h' | 'standard'>('lagos_24h');
  const [isMadeInNigeria, setIsMadeInNigeria] = useState(true);
  const [images, setImages] = useState<string[]>([CURATED_SAMPLE_IMAGES[0].url]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([
    { label: 'Origin', value: 'Handmade in Lagos, Nigeria' },
    { label: 'Material', value: 'Premium Grade Leather' }
  ]);
  const [tags, setTags] = useState<string>('luxury, handcrafted, nigerian, authentic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(Boolean(initialOpenAiAssistant));

  const handleApplyAi = (content: {
    title?: string;
    category?: CategoryId;
    shortDescription?: string;
    description?: string;
    specifications?: { label: string; value: string }[];
    tags?: string;
  }) => {
    if (content.title) {
      setTitle(content.title);
      if (mode === 'new') setSlug(slugify(content.title));
    }
    if (content.category) setCategory(content.category);
    if (content.shortDescription) setShortDescription(content.shortDescription);
    if (content.description) setDescription(content.description);
    if (content.specifications && content.specifications.length > 0) {
      setSpecifications(content.specifications);
    }
    if (content.tags) setTags(content.tags);
    showToast('AI Suggestions Applied', 'Review and edit any fields before saving.', 'success');
  };

  // Initialize values when editing
  useEffect(() => {
    if (mode === 'edit' && existingProduct) {
      setTitle(existingProduct.title || existingProduct.name || '');
      setSlug(existingProduct.slug || '');
      setCategory(existingProduct.category);
      setPrice(existingProduct.price || 0);
      setOriginalPrice(existingProduct.originalPrice || existingProduct.compareAtPrice || 0);
      setStockCount(existingProduct.stockCount || existingProduct.stock || 0);
      setStatus(existingProduct.status || 'active');
      setShortDescription(existingProduct.shortDescription || '');
      setDescription(existingProduct.description || '');
      setDeliverySpeed(existingProduct.deliverySpeed || 'lagos_24h');
      setIsMadeInNigeria(existingProduct.isMadeInNigeria !== false);
      setImages(existingProduct.images?.length ? existingProduct.images : [CURATED_SAMPLE_IMAGES[0].url]);
      setSpecifications(
        existingProduct.specifications?.length
          ? existingProduct.specifications
          : [{ label: 'Origin', value: 'Nigeria' }]
      );
      setTags(existingProduct.tags?.join(', ') || '');
    }
  }, [mode, existingProduct]);

  // Auto slugify when title changes in new mode
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (mode === 'new') {
      setSlug(slugify(val));
    }
  };

  const handleAddImage = (urlToAdd: string) => {
    if (!urlToAdd.trim()) return;
    if (images.includes(urlToAdd.trim())) return;
    setImages((prev) => [...prev, urlToAdd.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      showToast('Minimum Images', 'At least one product image is required.', 'warning');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', value: string) => {
    setSpecifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Validation Error', 'Please enter a product title.', 'warning');
      return;
    }

    if (!price || price <= 0) {
      showToast('Validation Error', 'Please provide a valid price in Naira.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const cleanedSpecs = specifications.filter((s) => s.label.trim() && s.value.trim());

      const productPayload: Product = {
        id: mode === 'edit' && existingProduct ? existingProduct.id : `prod_${Date.now()}`,
        title: title.trim(),
        name: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim() || shortDescription.trim(),
        shortDescription: shortDescription.trim() || title.trim(),
        price: Number(price),
        originalPrice: originalPrice > 0 ? Number(originalPrice) : undefined,
        compareAtPrice: originalPrice > 0 ? Number(originalPrice) : undefined,
        category,
        images,
        rating: existingProduct?.rating || 5.0,
        reviewCount: existingProduct?.reviewCount || 0,
        inStock: stockCount > 0,
        stockCount: Number(stockCount),
        stock: Number(stockCount),
        status,
        sellerId: firebaseUser?.uid || 'seller_id',
        seller: {
          id: sellerProfile?.id || 'store_id',
          sellerId: firebaseUser?.uid || 'seller_id',
          name: sellerProfile?.storeName || 'My Store',
          slug: sellerProfile?.storeSlug || 'my-store',
          bio: sellerProfile?.description || '',
          logoUrl: sellerProfile?.logoUrl || CURATED_SAMPLE_IMAGES[0].url,
          bannerUrl: sellerProfile?.bannerUrl,
          verified: true,
          city: sellerProfile?.city || 'Lagos',
          state: sellerProfile?.state || 'Lagos',
          rating: sellerProfile?.rating || 5.0,
          reviewCount: sellerProfile?.reviewCount || 0,
          productCount: sellerProducts.length + (mode === 'new' ? 1 : 0),
          joinedYear: 2026,
          responseRatePercent: 99,
          shipsWithinHours: sellerProfile?.shipsWithinHours || 24,
          specialties: [category]
        },
        isMadeInNigeria,
        isEditorialPick: false,
        isTrending: true,
        deliverySpeed,
        specifications: cleanedSpecs,
        tags: parsedTags,
        createdAt: existingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (mode === 'new') {
        await addNewProduct(productPayload);
        showToast('Product Created', `${title} is now saved to your store.`, 'success');
      } else {
        await editProduct(productPayload.id, productPayload);
        showToast('Product Updated', `${title} has been updated.`, 'success');
      }

      setActiveDashboardTab('products');
      navigateTo('seller-dashboard');
    } catch (err) {
      console.error('Error saving product:', err);
      showToast('Error', 'Unable to save product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setActiveDashboardTab('products');
            navigateTo('seller-dashboard');
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B726E] hover:text-[#101413] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </button>

        <span className="text-xs text-[#6B726E]">
          Store: <strong className="text-[#101413]">{sellerProfile?.storeName || 'My Store'}</strong>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7E5] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#101413] tracking-tight">
              {mode === 'new' ? 'Add New Product' : `Edit "${existingProduct?.title || 'Product'}"`}
            </h1>
            <p className="text-xs text-[#6B726E] mt-1">
              Provide comprehensive details, images, and pricing in Naira to showcase your item in the marketplace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              className="bg-emerald-50 text-[#0E8F5A] border-[#A7E2C9] hover:bg-[#E8F5EF]"
              leftIcon={<Sparkles className="w-4 h-4 text-[#0E8F5A]" />}
            >
              AI Listing Assistant
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveDashboardTab('products');
                navigateTo('seller-dashboard');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSubmitting ? 'Saving...' : mode === 'new' ? 'Publish Product' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Basic Info */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#101413] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0E8F5A]" />
                <span>General Information</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#101413] block mb-1.5">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Kano Tanned Full-Grain Leather Briefcase"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#101413] block mb-1.5">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. kano-tanned-leather-briefcase"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] font-mono focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1.5">
                      Department Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CategoryId)}
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#101413] block mb-1.5">
                    Short Summary (One-liner)
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="e.g. Handcrafted in northern Nigeria with solid brass hardware."
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#101413] block mb-1.5">
                    Full Editorial Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe craftsmanship, materials, dimensions, and styling notes..."
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Media / Photography */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#101413] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0E8F5A]" />
                <span>Product Photography</span>
              </h3>

              {/* Current Images */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#E4E7E5] aspect-square bg-[#F7F5F0]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-[#101413] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Image URL */}
              <div className="flex gap-2 text-xs">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="flex-1 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddImage(imageUrlInput)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Image
                </Button>
              </div>

              {/* Quick sample pickers */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-[#6B726E] block mb-2">
                  Or pick high-resolution studio photograph:
                </span>
                <div className="flex flex-wrap gap-2">
                  {CURATED_SAMPLE_IMAGES.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddImage(sample.url)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-[#F7F5F0] hover:bg-[#E8F5EF] border border-[#E4E7E5] text-[#101413] cursor-pointer"
                    >
                      <img src={sample.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>{sample.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Specifications */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#101413] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0E8F5A]" />
                  <span>Product Specifications</span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSpec}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Spec
                </Button>
              </div>

              <div className="space-y-2">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                      placeholder="e.g. Dimensions / Material / Weight"
                      className="w-1/3 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      placeholder="e.g. 42cm x 30cm x 12cm"
                      className="flex-1 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-2 text-[#6B726E] hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Status & Visibility */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B726E]">
                Listing Status
              </h3>

              <div className="space-y-2 text-xs">
                <label className="font-semibold text-[#101413] block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs font-semibold text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                >
                  <option value="active">Active (Visible in Shop)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="outOfStock">Out of Stock</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Made in Nigeria Badge Toggle */}
              <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#101413] block">Made in Nigeria</span>
                  <span className="text-[11px] text-[#6B726E]">Display local artisan badge</span>
                </div>
                <input
                  type="checkbox"
                  checked={isMadeInNigeria}
                  onChange={(e) => setIsMadeInNigeria(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Pricing in Naira */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B726E]">
                Pricing (NGN ₦)
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#101413] block mb-1">
                    Selling Price (₦) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#6B726E]">
                      ₦
                    </span>
                    <input
                      type="number"
                      required
                      min="100"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-8 pr-3 py-2 text-xs font-bold tabular-nums text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#101413] block mb-1">
                    Compare-at / Original Price (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#6B726E]">
                      ₦
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      placeholder="Optional strikethrough price"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-8 pr-3 py-2 text-xs tabular-nums text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Inventory Stock Level */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B726E]">
                Inventory Units
              </h3>

              <div className="text-xs">
                <label className="font-semibold text-[#101413] block mb-1">
                  Quantity in Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockCount}
                  onChange={(e) => setStockCount(Number(e.target.value))}
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs font-bold tabular-nums text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
                <p className="text-[11px] text-[#6B726E] mt-1">
                  Items with 5 or fewer units trigger low-stock alerts.
                </p>
              </div>
            </div>

            {/* 4. Delivery Speed */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B726E] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery Speed Commitment</span>
              </h3>

              <div className="text-xs space-y-2">
                <select
                  value={deliverySpeed}
                  onChange={(e) => setDeliverySpeed(e.target.value as any)}
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs font-medium text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                >
                  <option value="lagos_sameday">Lagos Same-Day Delivery</option>
                  <option value="lagos_24h">Lagos 24h Express Delivery</option>
                  <option value="express_48h">Nationwide Express (48h)</option>
                  <option value="standard">Standard Dispatch</option>
                </select>
              </div>
            </div>

            {/* 5. Search Tags */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-[#101413]">Search Keywords / Tags</h3>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated (e.g. adire, silk, handmade)"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
            </div>
          </div>
        </div>
      </form>

      {/* AI Assistant Modal */}
      <SellerAiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentTitle={title}
        currentCategory={category}
        currentDescription={description}
        onApply={handleApplyAi}
      />
    </div>
  );
};
