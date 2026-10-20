/**
 * @file src/components/seller/CloudinaryHelpModal.tsx
 * Accessible step-by-step guidance modal for MarketNest sellers uploading product images via Cloudinary.
 * Provides clear instructions on acquiring secure HTTPS delivery URLs without exposing API credentials.
 */

import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Camera,
  Copy,
  UploadCloud,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CloudinaryHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLOUDINARY_STEPS = [
  {
    number: 1,
    title: 'Create or Sign In to Cloudinary',
    description: 'Visit cloudinary.com and sign up for a free account or log in to your existing account.',
    icon: UploadCloud
  },
  {
    number: 2,
    title: 'Open the Media Library',
    description: 'From your Cloudinary console dashboard, click on "Media Library" in the primary navigation menu.',
    icon: Layers
  },
  {
    number: 3,
    title: 'Upload Your Product Photos',
    description: 'Click the "Upload" button and select high-resolution photos of your product from your computer or phone.',
    icon: Camera
  },
  {
    number: 4,
    title: 'Open the Uploaded Image',
    description: 'Locate and click on your newly uploaded product image inside the Media Library to open its details view.',
    icon: CheckCircle2
  },
  {
    number: 5,
    title: 'Copy the HTTPS Delivery URL',
    description: 'Click the "Copy URL" icon or copy the direct image link. It will look like: https://res.cloudinary.com/your-cloud-name/image/upload/v12345/product.jpg',
    icon: Copy
  },
  {
    number: 6,
    title: 'Paste into MarketNest',
    description: 'Return to your MarketNest product form and paste the copied URL into the "Image URL" field.',
    icon: UploadCloud
  },
  {
    number: 7,
    title: 'Verify Live Preview & Add More Angles',
    description: 'Check that the preview displays correctly. Click "Add another image" to include multiple angles, close-ups, and packaging shots (up to 8 images).',
    icon: Layers
  },
  {
    number: 8,
    title: 'Set Primary Image & Save',
    description: 'Ensure your best photo is in the first position (marked with the "Cover / Primary" badge). Use the "Make Primary" button or arrow buttons to reorder, then save your product.',
    icon: CheckCircle2
  }
];

export const CloudinaryHelpModal: React.FC<CloudinaryHelpModalProps> = ({ isOpen, onClose }) => {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloudinary-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E4E7E5] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E4E7E5] bg-[#F7F5F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] flex items-center justify-center text-[#0E8F5A]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cloudinary-guide-title" className="text-base font-bold text-[#101413]">
                How to Host & Get Product Image URLs
              </h2>
              <p className="text-xs text-[#6B726E]">
                Step-by-step guide to hosting images on Cloudinary for your MarketNest store.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="p-1.5 rounded-lg text-[#6B726E] hover:text-[#101413] hover:bg-[#E4E7E5]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-[#101413]">
          {/* Quick CTA to open Cloudinary */}
          <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[#101413] text-sm">Need a free, high-speed image host?</p>
              <p className="text-[#6B726E] text-xs mt-0.5">
                Cloudinary offers a generous free tier with fast global CDN delivery across Nigeria and worldwide.
              </p>
            </div>
            <a
              href="https://cloudinary.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0E8F5A] text-white hover:bg-[#0B7549] text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            >
              <span>Open Cloudinary</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 8-Step Walkthrough */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B726E]">
              8 Simple Steps to Add Photos
            </h3>
            <ol className="space-y-3 list-none p-0 m-0">
              {CLOUDINARY_STEPS.map((step) => {
                const IconComponent = step.icon;
                return (
                  <li
                    key={step.number}
                    className="flex items-start gap-3.5 p-3 rounded-lg border border-[#E4E7E5] bg-white hover:border-[#101413]/30 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#101413] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#101413] text-xs">{step.title}</span>
                      </div>
                      <p className="text-[#6B726E] text-xs mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Delivery URL vs Dashboard URL distinction */}
          <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-[#101413]">
              <AlertCircle className="w-4 h-4 text-[#0E8F5A]" />
              <span>Correct URL Format (Delivery URL vs Console Page URL)</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#6B726E]">
              <p>
                <strong className="text-[#0E8F5A]">✓ Correct (Delivery URL):</strong> Starts with{' '}
                <code className="bg-white px-1.5 py-0.5 rounded border border-[#E4E7E5] text-[#101413] font-mono">
                  https://res.cloudinary.com/...
                </code>
              </p>
              <p>
                <strong className="text-rose-600">✕ Incorrect (Console URL):</strong> Webpage URLs like{' '}
                <code className="bg-white px-1.5 py-0.5 rounded border border-[#E4E7E5] text-[#6B726E] font-mono">
                  https://console.cloudinary.com/...
                </code>{' '}
                are private dashboard links that shoppers cannot view.
              </p>
            </div>
          </div>

          {/* Crucial Security & Ownership Best Practices */}
          <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Security & Marketplace Guidelines</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside">
              <li>
                <strong>Keep credentials private:</strong> Never share your Cloudinary account password, API Secret, or private credentials. MarketNest only needs public image delivery URLs.
              </li>
              <li>
                <strong>Image ownership:</strong> Only use photos that you own or have explicit legal authorization to use for commercial sale.
              </li>
              <li>
                <strong>Photo clarity:</strong> Use well-lit, authentic photos against clean backgrounds. Accurate representation builds trust and reduces buyer return requests.
              </li>
              <li>
                <strong>Other image hosts:</strong> Any valid, publicly accessible HTTPS image link (such as Unsplash or your own secure server) is also fully supported.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E4E7E5] bg-[#F7F5F0]/60 flex items-center justify-between">
          <span className="text-[11px] text-[#6B726E]">
            Images can be added or rearranged at any time.
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got it, return to product
          </Button>
        </div>
      </div>
    </div>
  );
};
