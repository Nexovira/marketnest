/**
 * @file src/components/seller/ProductImageManager.tsx
 * Production-ready multiple-image manager for MarketNest sellers.
 * Supports public HTTPS URLs (Cloudinary, CDNs), live load validation, reordering,
 * primary cover selection, duplicate prevention, and the Cloudinary guidance modal.
 */

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CloudinaryHelpModal } from './CloudinaryHelpModal';
import { ProductStatus } from '../../types';

export const CURATED_STUDIO_SAMPLES = [
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

export interface ProductImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  status?: ProductStatus;
  className?: string;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  onChange,
  maxImages = 8,
  disabled = false,
  status = 'active',
  className = ''
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const isAtLimit = images.length >= maxImages;
  const isCloudinaryUrl = (url: string) => url.toLowerCase().includes('res.cloudinary.com');

  /**
   * Validates and sanitizes a candidate URL
   */
  const validateUrl = (rawUrl: string): { valid: boolean; error?: string; cleanUrl?: string } => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return { valid: false, error: 'Please enter an image URL.' };
    }

    // Allow relative asset paths used by the marketplace prototype
    if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
      return { valid: true, cleanUrl: trimmed };
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:') {
        return {
          valid: false,
          error: 'Secure HTTPS is required for external images (e.g. https://res.cloudinary.com/...)'
        };
      }
      return { valid: true, cleanUrl: parsed.toString() };
    } catch {
      return {
        valid: false,
        error: 'Please enter a valid complete URL starting with https://'
      };
    }
  };

  /**
   * Adds an image to the gallery
   */
  const handleAddImage = (candidateUrl?: string) => {
    if (disabled || isAtLimit) return;
    setInputError(null);

    const target = candidateUrl || urlInput;
    const { valid, error, cleanUrl } = validateUrl(target);

    if (!valid || !cleanUrl) {
      setInputError(error || 'Invalid URL');
      return;
    }

    // Check duplicate
    if (images.includes(cleanUrl)) {
      setInputError('This image URL has already been added to your gallery.');
      return;
    }

    onChange([...images, cleanUrl]);
    if (!candidateUrl) {
      setUrlInput('');
    }
  };

  /**
   * Removes an image at a specific index
   */
  const handleRemoveImage = (indexToRemove: number) => {
    if (disabled) return;
    const removedUrl = images[indexToRemove];
    const nextImages = images.filter((_, i) => i !== indexToRemove);
    onChange(nextImages);

    // Clean up failed state tracker
    if (removedUrl && failedImages[removedUrl]) {
      setFailedImages((prev) => {
        const copy = { ...prev };
        delete copy[removedUrl];
        return copy;
      });
    }
  };

  /**
   * Reorders an image by moving it up / earlier in array
   */
  const handleMoveLeft = (index: number) => {
    if (disabled || index <= 0) return;
    const next = [...images];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  /**
   * Reorders an image by moving it down / later in array
   */
  const handleMoveRight = (index: number) => {
    if (disabled || index >= images.length - 1) return;
    const next = [...images];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  /**
   * Designates a specific photo as the primary product cover
   */
  const handleMakePrimary = (index: number) => {
    if (disabled || index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
  };

  /**
   * Marks image as failed when <img> onError fires
   */
  const handleImageError = (url: string) => {
    setFailedImages((prev) => ({ ...prev, [url]: true }));
  };

  /**
   * Marks image as successfully loaded
   */
  const handleImageLoad = (url: string) => {
    if (failedImages[url]) {
      setFailedImages((prev) => {
        const copy = { ...prev };
        delete copy[url];
        return copy;
      });
    }
  };

  return (
    <div className={`bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5 ${className}`}>
      {/* 1. Header with Title & Help Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7E5] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#101413] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#0E8F5A]" />
              <span>Product images</span>
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAtLimit
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-[#F7F5F0] text-[#6B726E] border border-[#E4E7E5]'
              }`}
            >
              {images.length} of {maxImages} images
            </span>
          </div>
          <p className="text-xs text-[#6B726E] mt-1">
            Add up to {maxImages} images. The first image is shown as your main product photo.
          </p>
        </div>

        {/* Cloudinary Guide Action */}
        <button
          type="button"
          onClick={() => setIsHelpModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E8F5A] hover:text-[#0B7549] hover:underline self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How do I get my product image URL?</span>
        </button>
      </div>

      {/* 2. Image Gallery Previews Grid */}
      {images.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {images.map((imgUrl, idx) => {
              const isPrimary = idx === 0;
              const hasError = Boolean(failedImages[imgUrl]);
              const isCloudinary = isCloudinaryUrl(imgUrl);

              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all flex flex-col bg-[#F7F5F0] ${
                    isPrimary
                      ? 'border-[#0E8F5A] ring-2 ring-[#0E8F5A]/20 shadow-xs'
                      : hasError
                      ? 'border-rose-300'
                      : 'border-[#E4E7E5] hover:border-[#101413]/40'
                  }`}
                >
                  {/* Aspect Ratio Square Image Area */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#101413]/5">
                    <img
                      src={imgUrl}
                      alt={`Product view ${idx + 1}`}
                      onError={() => handleImageError(imgUrl)}
                      onLoad={() => handleImageLoad(imgUrl)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-[#0E8F5A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Cover Photo</span>
                      </span>
                    )}

                    {/* Order index indicator */}
                    {!isPrimary && (
                      <span className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}

                    {/* Cloudinary CDN indicator badge */}
                    {isCloudinary && (
                      <span className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        Cloudinary CDN
                      </span>
                    )}

                    {/* Quick Delete overlay button */}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove image"
                      aria-label={`Remove image ${idx + 1}`}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-90 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Broken / Inaccessible Image Warning Overlay */}
                    {hasError && (
                      <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xs p-3 flex flex-col items-center justify-center text-center text-white">
                        <AlertCircle className="w-6 h-6 text-rose-400 mb-1" />
                        <p className="text-[11px] font-bold text-rose-200">Failed to load preview</p>
                        <p className="text-[9px] text-white/80 mt-0.5">Check if URL is public HTTPS</p>
                      </div>
                    )}
                  </div>

                  {/* Controls Toolbar Below Preview */}
                  <div className="p-2 bg-white border-t border-[#E4E7E5] flex items-center justify-between gap-1 text-xs">
                    {/* Make primary action */}
                    {!isPrimary ? (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleMakePrimary(idx)}
                        className="text-[11px] font-semibold text-[#0E8F5A] hover:underline cursor-pointer truncate"
                      >
                        Make Primary
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-[#6B726E] uppercase tracking-wider">
                        Main
                      </span>
                    )}

                    {/* Reordering arrows */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={disabled || idx === 0}
                        onClick={() => handleMoveLeft(idx)}
                        title="Move earlier"
                        aria-label="Move photo earlier"
                        className="p-1 rounded text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={disabled || idx === images.length - 1}
                        onClick={() => handleMoveRight(idx)}
                        title="Move later"
                        aria-label="Move photo later"
                        className="p-1 rounded text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-[#E4E7E5] bg-[#F7F5F0]/60 space-y-2">
          <ImageIcon className="w-8 h-8 text-[#6B726E] mx-auto opacity-60" />
          <p className="text-xs font-bold text-[#101413]">No product images added yet</p>
          <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
            {status === 'active'
              ? 'Published products require at least one clear product photo to appear in the marketplace.'
              : 'Draft products can be saved without images and completed later.'}
          </p>
        </div>
      )}

      {/* 3. Input for adding another image */}
      <div className="space-y-2 pt-2">
        <label htmlFor="product-image-url-input" className="block text-xs font-semibold text-[#101413]">
          {images.length === 0 ? 'Add first product image URL' : 'Add another image URL'}
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id="product-image-url-input"
              type="url"
              value={urlInput}
              disabled={disabled || isAtLimit}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
              placeholder={
                isAtLimit
                  ? `Maximum limit of ${maxImages} images reached`
                  : 'Paste image URL (e.g. https://res.cloudinary.com/...)'
              }
              className={`w-full bg-[#F7F5F0] border rounded-md px-3 py-2 text-xs text-[#101413] placeholder:text-[#6B726E]/70 focus:outline-none focus:bg-white transition-colors disabled:opacity-50 ${
                inputError ? 'border-rose-400 focus:border-rose-500' : 'border-[#E4E7E5] focus:border-[#0E8F5A]'
              }`}
            />
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={disabled || isAtLimit || !urlInput.trim()}
            onClick={() => handleAddImage()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {images.length === 0 ? 'Add Image' : 'Add another image'}
          </Button>
        </div>

        {/* Validation / Format Error Banner */}
        {inputError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* 4. Quick Studio Samples for effortless prototyping */}
      <div className="pt-2 border-t border-[#E4E7E5]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#6B726E] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#0E8F5A]" />
            <span>Or quick-select studio photograph:</span>
          </span>
          <span className="text-[10px] text-[#6B726E]">MarketNest curated assets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CURATED_STUDIO_SAMPLES.map((sample, i) => {
            const isAlreadyAdded = images.includes(sample.url);
            return (
              <button
                key={i}
                type="button"
                disabled={disabled || isAtLimit || isAlreadyAdded}
                onClick={() => handleAddImage(sample.url)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] border transition-colors cursor-pointer ${
                  isAlreadyAdded
                    ? 'bg-[#E8F5EF] border-[#A7E2C9] text-[#0E8F5A] opacity-60 cursor-default'
                    : 'bg-[#F7F5F0] hover:bg-[#E8F5EF] border-[#E4E7E5] text-[#101413]'
                }`}
              >
                <img src={sample.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span>{sample.name}</span>
                {isAlreadyAdded && <CheckCircle2 className="w-3 h-3 text-[#0E8F5A]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Cloudinary Help Modal */}
      <CloudinaryHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
