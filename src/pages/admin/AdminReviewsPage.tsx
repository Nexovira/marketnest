/**
 * @file src/pages/admin/AdminReviewsPage.tsx
 * Admin Review Moderation Queue for MarketNest.
 * Allows authorized admins to review, flag, hide abusive reviews, and restore legitimate reviews
 * with mandatory moderation reasons and append-only audit trail logging.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ProductReview, ReviewStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Star,
  ShieldCheck,
  ShieldAlert,
  EyeOff,
  Eye,
  Flag,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const { requestConfirm, adminProfile } = useAdmin();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerateStatus = (review: ProductReview, nextStatus: ReviewStatus) => {
    requestConfirm({
      title: `${nextStatus === 'hidden' ? 'Hide Review' : nextStatus === 'flagged' ? 'Flag Review' : 'Restore Review'}`,
      description: `You are changing the moderation state of review "${review.title}" to ${nextStatus}. Please provide an explicit reason.`,
      danger: nextStatus === 'hidden',
      requireReason: true,
      onConfirm: async (reason?: string) => {
        const res = await fetch(`/api/reviews/${review.id}/moderate`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            moderationReason: reason,
            moderatedBy: adminProfile.name
          })
        });
        if (!res.ok) {
          throw new Error('Failed to update review moderation status.');
        }
        await loadReviews();
      }
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (ratingFilter !== 'all' && r.rating !== parseInt(ratingFilter, 10)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchComment = r.comment?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchCustomer = r.customerName?.toLowerCase().includes(q);
      const matchProduct = r.productId?.toLowerCase().includes(q);
      if (!matchComment && !matchTitle && !matchCustomer && !matchProduct) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#101413]">Customer Review Moderation</h2>
          <p className="text-xs text-[#6B726E]">
            Monitor customer ratings, enforce trust & safety guidelines, and flag or hide abusive submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadReviews}>
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-[#E4E7E5] rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, title, comment, or product ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E4E7E5] rounded-lg focus:outline-none focus:border-[#0E8F5A]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6B726E]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-[#E4E7E5] rounded-lg px-2.5 py-2 bg-white text-[#101413] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="text-xs border border-[#E4E7E5] rounded-lg px-2.5 py-2 bg-white text-[#101413] focus:outline-none"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Review Cards / Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6B726E]">Loading reviews moderation queue...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E4E7E5] rounded-xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#0E8F5A] mx-auto" />
          <h3 className="text-sm font-bold text-[#101413]">No reviews match filter</h3>
          <p className="text-xs text-[#6B726E]">All customer reviews are in good standing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 bg-white border rounded-xl transition-all ${
                rev.status === 'hidden'
                  ? 'border-neutral-200 bg-neutral-50/70 opacity-75'
                  : rev.status === 'flagged'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-[#E4E7E5]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Stars */}
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-500' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="font-bold text-xs text-[#101413]">{rev.title}</span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        rev.status === 'published'
                          ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                          : rev.status === 'flagged'
                          ? 'bg-amber-100 text-amber-800'
                          : rev.status === 'hidden'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {rev.status}
                    </span>

                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Purchase</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#101413] leading-relaxed">{rev.comment}</p>

                  {/* Photos if any */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {rev.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Customer upload"
                          className="w-12 h-12 rounded object-cover border border-[#E4E7E5]"
                        />
                      ))}
                    </div>
                  )}

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6B726E] pt-1">
                    <span>
                      Customer: <strong>{rev.customerName || 'Customer'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Product ID: <code className="text-neutral-700">{rev.productId}</code>
                    </span>
                    <span>•</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString('en-GB')}</span>
                    {rev.helpfulCount !== undefined && rev.helpfulCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{rev.helpfulCount} people found helpful</span>
                      </>
                    )}
                  </div>

                  {/* Seller response if present */}
                  {rev.response && (
                    <div className="mt-3 p-3 bg-[#F7F5F0] rounded-lg border-l-2 border-[#0E8F5A] space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#101413]">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-[#0E8F5A]" />
                          <span>Seller Response ({rev.response.sellerName || 'Merchant'})</span>
                        </span>
                        <span className="text-[10px] text-[#6B726E]">
                          {new Date(rev.response.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B726E]">{rev.response.response}</p>
                    </div>
                  )}
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  {rev.status !== 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerateStatus(rev, 'published')}
                      className="w-full text-xs text-[#0E8F5A] border-[#0E8F5A]/30 hover:bg-[#E8F5EF]"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Publish / Restore
                    </Button>
                  )}

                  {rev.status !== 'flagged' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerateStatus(rev, 'flagged')}
                      className="w-full text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      <Flag className="w-3.5 h-3.5 mr-1" />
                      Flag for Review
                    </Button>
                  )}

                  {rev.status !== 'hidden' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleModerateStatus(rev, 'hidden')}
                      className="w-full text-xs"
                    >
                      <EyeOff className="w-3.5 h-3.5 mr-1" />
                      Hide Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
