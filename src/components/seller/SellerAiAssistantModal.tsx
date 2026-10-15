/**
 * @file src/components/seller/SellerAiAssistantModal.tsx
 * AI-Assisted Listing Generator & Categorization Assistant for MarketNest Sellers.
 * Generates titles, descriptions, SEO metadata, and category suggestions with full seller review.
 */

import React, { useState } from 'react';
import { aiService } from '../../services/aiService';
import { AIGeneratedProductContent, AICategorySuggestion, CategoryId } from '../../types';
import { Button } from '../ui/Button';
import {
  Sparkles,
  Check,
  X,
  AlertTriangle,
  Layers,
  FileText,
  Tag,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';

interface SellerAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentCategory: CategoryId;
  currentDescription: string;
  onApply: (content: {
    title?: string;
    category?: CategoryId;
    shortDescription?: string;
    description?: string;
    specifications?: { label: string; value: string }[];
    tags?: string;
  }) => void;
}

export const SellerAiAssistantModal: React.FC<SellerAiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  currentCategory,
  currentDescription,
  onApply
}) => {
  const [titleInput, setTitleInput] = useState(currentTitle || '');
  const [keyPointsInput, setKeyPointsInput] = useState('');
  const [tone, setTone] = useState<'refined' | 'energetic' | 'minimalist'>('refined');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<AIGeneratedProductContent | null>(null);
  const [categorySuggestion, setCategorySuggestion] = useState<AICategorySuggestion | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'category' | 'seo'>('content');

  // Editable fields before applying
  const [editedTitle, setEditedTitle] = useState('');
  const [editedShortDesc, setEditedShortDesc] = useState('');
  const [editedDetailedDesc, setEditedDetailedDesc] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!titleInput.trim()) return;
    setLoading(true);
    try {
      // 1. Run category suggestion
      const catSug = await aiService.suggestCategory(titleInput, currentDescription);
      setCategorySuggestion(catSug);

      // 2. Run description generator
      const descRes = await aiService.generateProductDescription({
        title: titleInput.trim(),
        category: catSug.categoryId || currentCategory,
        keyPoints: keyPointsInput ? keyPointsInput.split(',').map((s) => s.trim()) : undefined,
        tone: tone === 'refined' ? 'Refined luxury' : tone === 'energetic' ? 'Dynamic modern' : 'Minimalist clean'
      });

      setGenerated(descRes);
      setEditedTitle(descRes.title);
      setEditedShortDesc(descRes.shortDescription);
      setEditedDetailedDesc(descRes.detailedDescription);
    } catch (err: any) {
      console.warn('AI generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToForm = () => {
    if (!generated) return;

    const specsArray = generated.specifications
      ? Object.entries(generated.specifications).map(([label, value]) => ({ label, value }))
      : undefined;

    onApply({
      title: editedTitle || generated.title,
      category: categorySuggestion?.categoryId,
      shortDescription: editedShortDesc || generated.shortDescription,
      description: editedDetailedDesc || generated.detailedDescription,
      specifications: specsArray,
      tags: generated.searchKeywords?.join(', ')
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E4E7E5] bg-[#FBFBFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#101413]">AI Listing Assistant & Smart Categorization</h3>
              <p className="text-xs text-[#6B726E]">
                Generate high-converting titles, descriptions, Nigerian specs, and SEO keywords.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B726E] hover:text-[#101413] hover:bg-[#E4E7E5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Controls */}
          <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#101413] mb-1">
                  Product Core Concept / Rough Title
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Handmade Leather Loafers Size 43"
                  className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101413] mb-1">
                  Key Distinctive Points (Comma-separated)
                </label>
                <input
                  type="text"
                  value={keyPointsInput}
                  onChange={(e) => setKeyPointsInput(e.target.value)}
                  placeholder="e.g. Full-grain calfskin, brass buckle, rubber grip"
                  className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B726E] font-medium">Editorial Tone:</span>
                {(['refined', 'energetic', 'minimalist'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize cursor-pointer transition-colors ${
                      tone === t ? 'bg-[#101413] text-white' : 'bg-white text-[#6B726E] border border-[#E4E7E5]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                loading={loading}
                disabled={!titleInput.trim()}
                onClick={handleGenerate}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Generate Suggestions
              </Button>
            </div>
          </div>

          {/* Generated Result Container */}
          {generated && (
            <div className="space-y-4">
              {/* Category Suggestion Banner */}
              {categorySuggestion && (
                <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#0E8F5A] uppercase tracking-wider block">
                      Smart Category Recommendation ({(categorySuggestion.confidence * 100).toFixed(0)}% Match)
                    </span>
                    <h4 className="font-bold text-sm text-[#101413]">
                      {categorySuggestion.categoryName} <span className="font-mono text-xs text-[#2C5E47]">({categorySuggestion.categoryId})</span>
                    </h4>
                    <p className="text-xs text-[#2C5E47]">{categorySuggestion.reason}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#0E8F5A] text-white shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Suggested
                  </span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#E4E7E5]">
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`pb-2.5 px-3 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
                    activeTab === 'content'
                      ? 'border-[#0E8F5A] text-[#0E8F5A]'
                      : 'border-transparent text-[#6B726E] hover:text-[#101413]'
                  }`}
                >
                  Descriptions & Title
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('category')}
                  className={`pb-2.5 px-3 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
                    activeTab === 'category'
                      ? 'border-[#0E8F5A] text-[#0E8F5A]'
                      : 'border-transparent text-[#6B726E] hover:text-[#101413]'
                  }`}
                >
                  Specifications & Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seo')}
                  className={`pb-2.5 px-3 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
                    activeTab === 'seo'
                      ? 'border-[#0E8F5A] text-[#0E8F5A]'
                      : 'border-transparent text-[#6B726E] hover:text-[#101413]'
                  }`}
                >
                  Search & SEO Meta
                </button>
              </div>

              {/* Tab 1: Content */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#101413] mb-1">
                      Refined Marketplace Title
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101413] mb-1">
                      Short Summary (PDP Header Callout)
                    </label>
                    <textarea
                      rows={2}
                      value={editedShortDesc}
                      onChange={(e) => setEditedShortDesc(e.target.value)}
                      className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101413] mb-1">
                      Detailed Editorial Description
                    </label>
                    <textarea
                      rows={5}
                      value={editedDetailedDesc}
                      onChange={(e) => setEditedDetailedDesc(e.target.value)}
                      className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                    />
                  </div>

                  {/* Key Selling Points */}
                  <div className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-xl p-4 space-y-2">
                    <span className="text-xs font-bold text-[#101413] block">Extracted Selling Highlights:</span>
                    <ul className="space-y-1.5 text-xs text-[#6B726E]">
                      {generated.keySellingPoints?.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0E8F5A] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Specifications */}
              {activeTab === 'category' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 divide-y divide-[#E4E7E5]">
                    {generated.specifications &&
                      Object.entries(generated.specifications).map(([key, val], idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-bold text-[#101413]">{key}</span>
                          <span className="text-[#6B726E] text-right">{val}</span>
                        </div>
                      ))}
                  </div>

                  {/* Uncertain Fields Warning */}
                  {generated.uncertainFields && generated.uncertainFields.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Seller Verification Required</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        The AI did not invent claims for: {generated.uncertainFields.join(', ')}. Please confirm exact dimensions and specs manually.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#6B726E] uppercase block">Search Engine Title</span>
                      <p className="text-xs font-bold text-[#101413] mt-0.5">{generated.seoTitle}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#6B726E] uppercase block">Meta Description</span>
                      <p className="text-xs text-[#6B726E] mt-0.5">{generated.seoMetaDescription}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#6B726E] uppercase block">Suggested Image Alt Text</span>
                      <p className="text-xs text-[#6B726E] mt-0.5">{generated.imageAltText}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-[#101413] mb-1.5 block">Search Keywords</span>
                    <div className="flex flex-wrap gap-1.5">
                      {generated.searchKeywords?.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[#F7F5F0] border border-[#E4E7E5] text-[11px] text-[#101413]">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E4E7E5] bg-[#FBFBFA] flex items-center justify-between">
          <div className="text-[11px] text-[#6B726E] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
            <span>Changes are only saved when confirmed by the seller.</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!generated}
              onClick={handleApplyToForm}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Accept & Apply to Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
