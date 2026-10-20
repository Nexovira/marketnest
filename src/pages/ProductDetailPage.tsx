/**
 * @file src/pages/ProductDetailPage.tsx
 * High-touch luxury Product Detail Page (PDP) with:
 * - Rating distributions & verified customer reviews
 * - Seller review responses & helpful vote toggles
 * - Customer review flow with verified buyer verification
 * - Product Questions & Answers (Q&A) with verified merchant responses
 * - Product comparison trigger
 * - Deterministic recommendations & recently viewed tracking
 * - Affiliate partner referral link generation
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { useSeller } from '../context/SellerContext';
import { getAffiliateProfile } from '../services/affiliate/affiliateService';
import { reviewService } from '../services/reviewService';
import { qaService } from '../services/qaService';
import { recommendationService } from '../services/recommendationService';
import {
  AffiliateProfile,
  ProductReview,
  ProductQuestion,
  RatingDistribution,
  ReviewRating,
  Product
} from '../types';
import { productService } from '../services/productService';
import { formatCurrency } from '../services/currencyService';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { RatingStars } from '../components/ui/RatingStars';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ProductCard';
import {
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Minus,
  Plus,
  Share2,
  Lock,
  Sparkles,
  Copy,
  ExternalLink,
  Layers,
  Star,
  ThumbsUp,
  MessageSquare,
  HelpCircle,
  X,
  Camera,
  Check,
  Flag,
  ZoomIn,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ReportProductModal } from '../components/ReportProductModal';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProductId,
    navigateTo,
    addToCart,
    toggleWishlist,
    isWishlisted,
    addToCompare,
    isComparing,
    setIsCartOpen,
    showToast
  } = useMarket();
  const { firebaseUser, profile, isAuthenticated } = useAuth();

  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile | null>(null);
  const { sellerProducts } = useSeller();

  const [product, setProduct] = useState<Product | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchCurrentProduct = async () => {
      if (!selectedProductId) {
        setProductLoading(false);
        return;
      }
      setProductLoading(true);
      setProductError(null);

      try {
        // If the logged in seller has this product in their catalog
        const fromSeller = sellerProducts?.find((p) => p.id === selectedProductId);
        if (fromSeller) {
          if (active) setProduct(fromSeller);
          return;
        }

        const [fetched, allProds] = await Promise.all([
          productService.getProductById(selectedProductId),
          productService.getPublicProducts()
        ]);

        if (active) {
          setCatalogProducts(allProds);
          if (fetched) {
            setProduct(fetched);
          } else {
            setProductError('This product does not exist, has been unpublished, or is pending administrator approval.');
          }
        }
      } catch (err: any) {
        if (active) setProductError('Unable to load product listing from database.');
      } finally {
        if (active) setProductLoading(false);
      }
    };

    fetchCurrentProduct();
    return () => {
      active = false;
    };
  }, [selectedProductId, sellerProducts]);

  // Normalized product gallery supporting both multiple images and legacy single imageUrl
  const productGallery: string[] = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    if ((product as any)?.imageUrl) {
      return [(product as any).imageUrl];
    }
    return ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];
  }, [product?.images, (product as any)?.imageUrl]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product?.variants?.[0]?.id
  );
  const [activeTab, setActiveTab] = useState<'specs' | 'delivery' | 'escrow' | 'reviews' | 'qa'>('specs');

  // Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState<ReviewRating>(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImageUrl, setReviewImageUrl] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Q&A State
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Recommendations State
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([]);
  const [fromThisSeller, setFromThisSeller] = useState<Product[]>([]);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Conversion & UX States (Phase 15)
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<
    'lagos_island' | 'lagos_mainland' | 'abuja' | 'port_harcourt' | 'other'
  >('lagos_island');
  const buySectionRef = useRef<HTMLDivElement>(null);

  // Scroll listener for Mobile Sticky Buy Bar
  useEffect(() => {
    const handleScroll = () => {
      if (buySectionRef.current) {
        const rect = buySectionRef.current.getBoundingClientRect();
        setIsStickyBarVisible(rect.bottom < 80);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Nigerian Delivery Estimator Constants
  const deliveryEstimates = useMemo(
    () => ({
      lagos_island: {
        label: 'Lagos Island (Lekki / Ikoyi / VI)',
        fee: 1500,
        time: 'Tomorrow by 2:00 PM',
        dispatch: 'Same-day available if ordered before 12:00 PM'
      },
      lagos_mainland: {
        label: 'Lagos Mainland (Ikeja / Surulere / Yaba)',
        fee: 1800,
        time: 'Tomorrow by 5:00 PM',
        dispatch: 'Same-day dispatch available'
      },
      abuja: {
        label: 'Abuja FCT',
        fee: 3500,
        time: '2 business days',
        dispatch: 'Air express courier'
      },
      port_harcourt: {
        label: 'Port Harcourt (Rivers)',
        fee: 3500,
        time: '2 business days',
        dispatch: 'Air express courier'
      },
      other: {
        label: 'Other Nigerian States',
        fee: 4500,
        time: '3 - 5 business days',
        dispatch: 'Nationwide tracked dispatch'
      }
    }),
    []
  );

  // Check affiliate partner status
  useEffect(() => {
    if (!firebaseUser) {
      setAffiliateProfile(null);
      return;
    }
    getAffiliateProfile(firebaseUser.uid).then((prof) => {
      if (prof && prof.status === 'active') {
        setAffiliateProfile(prof);
      }
    });
  }, [firebaseUser]);

  // Track recently viewed & load reviews/Q&A/recommendations on product change
  useEffect(() => {
    if (!product?.id) return;

    // Track in recently viewed
    recommendationService.trackRecentlyViewed(product.id);

    // Load reviews
    reviewService.getProductReviews(product.id).then((revs) => {
      setReviews(revs);
    });

    // Load Q&A
    qaService.getProductQuestions(product.id).then((qs) => {
      setQuestions(qs);
    });

    // Load recommendations from real database catalog
    setFrequentlyBought(recommendationService.getFrequentlyBoughtTogether(product, catalogProducts));
    setFromThisSeller(recommendationService.getFromThisSeller(product.sellerId, product.id, catalogProducts));
    setYouMayAlsoLike(recommendationService.getYouMayAlsoLike(product, catalogProducts));
    setRecentlyViewed(recommendationService.getRecentlyViewedProducts(catalogProducts).filter((p) => p.id !== product.id));

    // Reset selection state
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedVariantId(product.variants?.[0]?.id);
  }, [product?.id, catalogProducts]);

  const isSaved = product ? isWishlisted(product.id) : false;
  const isCompared = product ? isComparing(product.id) : false;
  const currentVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const activePrice = currentVariant ? currentVariant.price : (product?.price || 0);

  // Rating Distribution
  const ratingDist: RatingDistribution = useMemo(() => {
    return reviewService.calculateDistribution(reviews);
  }, [reviews]);

  // Filtered reviews by star filter
  const displayedReviews = useMemo(() => {
    if (selectedStarFilter === null) return reviews;
    return reviews.filter((r) => r.rating === selectedStarFilter);
  }, [reviews, selectedStarFilter]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, currentVariant);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, currentVariant);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (!product) return;
    let shareUrl = `${window.location.origin}/product/${product.id}`;
    if (affiliateProfile?.code) {
      shareUrl += `?ref=${affiliateProfile.code}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        showToast(
          'Affiliate Link Copied!',
          `Tracked referral link with code "${affiliateProfile.code}" copied to clipboard.`,
          'success'
        );
        return;
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast('Link Copied', 'Product link copied to your clipboard.', 'info');
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Sign In Required', 'Please sign in to leave a verified customer review.', 'warning');
      navigateTo('login');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Review Required', 'Please provide a review title and comment.', 'warning');
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (!product) return;
      const newRev = await reviewService.submitReview({
        productId: product.id,
        customerId: firebaseUser!.uid,
        customerName: profile?.name || firebaseUser?.displayName || 'Verified Buyer',
        sellerId: product.sellerId,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        images: reviewImageUrl ? [reviewImageUrl] : []
      });

      setReviews((prev) => [newRev, ...prev]);
      setShowReviewModal(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewImageUrl('');
      showToast('Review Published', 'Thank you! Your verified review has been published.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Could not submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Submit Question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Sign In Required', 'Please sign in to ask a question.', 'warning');
      navigateTo('login');
      return;
    }
    if (!questionText.trim()) return;

    setIsSubmittingQuestion(true);
    try {
      if (!product) return;
      const newQ = await qaService.askQuestion({
        productId: product.id,
        customerId: firebaseUser!.uid,
        customerName: profile?.name || firebaseUser?.displayName || 'Shopper',
        question: questionText
      });

      setQuestions((prev) => [newQ, ...prev]);
      setShowQuestionModal(false);
      setQuestionText('');
      showToast('Question Submitted', 'Your question was sent to the merchant.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Could not submit question', 'error');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Upvote helpful review
  const handleToggleHelpful = async (reviewId: string) => {
    const updatedCount = await reviewService.toggleHelpful(reviewId, firebaseUser?.uid || 'guest');
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: updatedCount } : r))
    );
  };

  // Bundle Add
  const handleAddBundle = (complementaryProduct: Product) => {
    if (!product) return;
    addToCart(product, 1);
    addToCart(complementaryProduct, 1);
    setIsCartOpen(true);
    showToast('Bundle Added to Bag', 'Both items added with combined checkout.', 'success');
  };

  if (productLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-xs text-[#6B726E]">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Verifying product listing from marketplace database...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto">
          <Package className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#101413]">Product Not Available</h2>
        <p className="text-xs text-[#6B726E] leading-relaxed">
          {productError || 'This product listing cannot be found, has been removed, or is currently pending administrator moderation.'}
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={() => navigateTo('shop')}>
            Explore Available Marketplace Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => navigateTo('home') },
          { label: 'Shop', onClick: () => navigateTo('shop') },
          {
            label: product.category.toUpperCase(),
            onClick: () => navigateTo('shop', { category: product.category })
          },
          { label: product.title, isCurrent: true }
        ]}
      />

      {/* Primary 2-Column Product Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Multi-Angle Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-square w-full bg-[#F7F5F0] rounded-xl overflow-hidden border border-[#E4E7E5] shadow-2xs group cursor-zoom-in">
            <img
              src={productGallery[activeImageIndex] || productGallery[0]}
              alt={product.title}
              onClick={() => setIsImageZoomOpen(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 bg-[#101413] text-white text-[11px] font-bold px-2.5 py-1 rounded tracking-wider uppercase">
                Curated Selection
              </span>
            )}

            {/* Previous / Next navigation overlay for multi-image products */}
            {productGallery.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 pointer-events-none">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productGallery.length - 1));
                  }}
                  className="p-2 rounded-full bg-white/90 text-[#101413] hover:text-[#0E8F5A] hover:bg-white shadow-md pointer-events-auto transition-all cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
                  aria-label="Previous product image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < productGallery.length - 1 ? prev + 1 : 0));
                  }}
                  className="p-2 rounded-full bg-white/90 text-[#101413] hover:text-[#0E8F5A] hover:bg-white shadow-md pointer-events-auto transition-all cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
                  aria-label="Next product image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImageZoomOpen(true)}
                className="p-2 bg-white/90 backdrop-blur-xs text-[#101413] hover:text-[#0E8F5A] rounded-full shadow-sm hover:scale-105 transition-all cursor-pointer"
                title="Zoom image preview"
                aria-label="Zoom image preview"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-xs text-[#101413] hover:text-[#0E8F5A] rounded-full shadow-sm hover:scale-105 transition-all cursor-pointer"
                title="Share listing"
                aria-label="Share listing"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {productGallery.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#6B726E]">
                <span>Product angles & details ({productGallery.length} photos)</span>
                <span>Photo {activeImageIndex + 1} of {productGallery.length}</span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {productGallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#0E8F5A] ring-2 ring-[#0E8F5A]/20 scale-102'
                        : 'border-[#E4E7E5] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-[#101413]/90 text-white text-[8px] font-bold px-1 py-0.2 rounded uppercase">
                        Main
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase & Merchant Module */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Title & Department */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0E8F5A] tracking-wider uppercase">
                {product.category}
              </span>
              <div
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-bold text-xs ml-1 text-[#101413]">
                    {ratingDist.averageRating}
                  </span>
                </div>
                <span className="text-xs text-[#6B726E]">
                  ({ratingDist.totalReviews} reviews)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif text-[#101413] tracking-tight">
              {product.title}
            </h1>
          </div>

          {/* Verified Merchant Banner */}
          <div className="p-3.5 bg-[#FBFBFA] border border-[#E4E7E5] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#0E8F5A] font-bold flex items-center justify-center text-sm border border-[#A7E2C9]">
                {product.storeName?.[0] || 'M'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-[#101413]">{product.storeName}</h4>
                  <VerifiedBadge size="sm" />
                </div>
                <p className="text-[11px] text-[#6B726E] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>Verified Merchant • Lagos Fulfilled</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('storefront', { storeId: product.sellerId })}
              className="text-xs font-semibold text-[#0E8F5A] hover:underline cursor-pointer"
            >
              Visit Store
            </button>
          </div>

          {/* Pricing Display */}
          <div className="pt-2 border-t border-[#E4E7E5]">
            <PriceDisplay
              price={activePrice}
              compareAtPrice={product.compareAtPrice}
              size="lg"
            />
            <p className="text-xs text-[#6B726E] mt-1">
              Includes 7-day escrow inspection guarantee & nationwide logistics transit insurance.
            </p>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#101413] uppercase tracking-wider block">
                Select Option / Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3 py-2 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                      selectedVariantId === v.id
                        ? 'border-[#0E8F5A] bg-[#E8F5EF] text-[#0E8F5A] shadow-xs'
                        : 'border-[#E4E7E5] bg-white text-[#101413] hover:border-[#101413]'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.price !== product.price && (
                      <span className="ml-1.5 opacity-75 tabular-nums">
                        ({formatCurrency(v.price)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {(() => {
            const availableStock =
              product.stockCount !== undefined
                ? product.stockCount
                : product.stock !== undefined
                ? product.stock
                : 10;
            const isOutOfStock =
              availableStock <= 0 || product.status === 'outOfStock' || product.inStock === false;

            return (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#101413] uppercase tracking-wider">Quantity</span>
                  <span
                    className={`font-medium ${
                      isOutOfStock ? 'text-rose-600' : availableStock < 5 ? 'text-amber-600' : 'text-[#6B726E]'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : `${availableStock} units remaining`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#E4E7E5] rounded-md bg-white">
                    <button
                      type="button"
                      disabled={quantity <= 1 || isOutOfStock}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 text-[#6B726E] hover:text-[#101413] disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-[#101413] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= availableStock || isOutOfStock}
                      onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                      className="p-2.5 text-[#6B726E] hover:text-[#101413] disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Primary Action Buttons: Add to Bag, Wishlist, Compare */}
          <div ref={buySectionRef} className="space-y-4 pt-2">
            {(() => {
              const availableStock =
                product.stockCount !== undefined
                  ? product.stockCount
                  : product.stock !== undefined
                  ? product.stock
                  : 10;
              const isOutOfStock =
                availableStock <= 0 || product.status === 'outOfStock' || product.inStock === false;

              return (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                    >
                      {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                    </Button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-12 h-12 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isSaved
                          ? 'border-rose-300 bg-rose-50 text-rose-600'
                          : 'border-[#E4E7E5] text-[#101413] hover:bg-[#F7F5F0]'
                      }`}
                      aria-label="Save to Wishlist"
                      title={isSaved ? 'In saved items' : 'Save to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-600' : ''}`} />
                    </button>

                    {/* Product Comparison Button */}
                    <button
                      type="button"
                      onClick={() => addToCompare(product.id)}
                      className={`w-12 h-12 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompared
                          ? 'border-[#0E8F5A] bg-[#E8F5EF] text-[#0E8F5A]'
                          : 'border-[#E4E7E5] text-[#101413] hover:bg-[#F7F5F0]'
                      }`}
                      aria-label="Add to comparison"
                      title={isCompared ? 'Already in comparison tray' : 'Compare product'}
                    >
                      <Layers className="w-5 h-5" />
                    </button>
                  </div>

                  {!isOutOfStock && (
                    <Button
                      variant="dark"
                      size="lg"
                      fullWidth
                      onClick={handleBuyNow}
                    >
                      Buy with Escrow Protection
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* Nigerian Delivery & Dispatch Estimator */}
            <div className="p-4 bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#101413] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#0E8F5A]" />
                  <span>Delivery & Dispatch Estimator</span>
                </span>
                <span className="text-[10px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                  Verified Transit
                </span>
              </div>

              <div className="space-y-1">
                <label htmlFor="delivery-dest-select" className="text-[11px] font-medium text-[#6B726E] block">
                  Delivery Destination:
                </label>
                <select
                  id="delivery-dest-select"
                  value={deliveryLocation}
                  onChange={(e) =>
                    setDeliveryLocation(
                      e.target.value as 'lagos_island' | 'lagos_mainland' | 'abuja' | 'port_harcourt' | 'other'
                    )
                  }
                  className="w-full text-xs font-semibold bg-white border border-[#E4E7E5] rounded-md px-3 py-2 text-[#101413] focus:outline-none focus:ring-1 focus:ring-[#0E8F5A] cursor-pointer"
                >
                  <option value="lagos_island">Lagos Island (Lekki / Victoria Island / Ikoyi)</option>
                  <option value="lagos_mainland">Lagos Mainland (Ikeja / Surulere / Yaba)</option>
                  <option value="abuja">Abuja FCT</option>
                  <option value="port_harcourt">Port Harcourt (Rivers)</option>
                  <option value="other">Other Nigerian States</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#E4E7E5] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B726E]">Estimated Delivery:</span>
                  <span className="font-bold text-[#101413]">
                    {deliveryEstimates[deliveryLocation].time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B726E]">Shipping Fee:</span>
                  <span className="font-bold text-[#0E8F5A] tabular-nums">
                    {activePrice >= 50000 && deliveryLocation.startsWith('lagos')
                      ? 'FREE (Lagos Express)'
                      : formatCurrency(deliveryEstimates[deliveryLocation].fee)}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B726E] mt-1 pt-1 border-t border-[#E4E7E5]/50 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0E8F5A]" />
                  <span>{deliveryEstimates[deliveryLocation].dispatch}</span>
                </p>
              </div>
            </div>

            {/* Trust Guarantees */}
            <div className="space-y-2 text-xs text-[#6B726E]">
              <div className="flex items-center gap-2 text-[#101413]">
                <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0" />
                <span>Full buyer protection: Pay only when satisfied</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#6B726E] shrink-0" />
                <span>Encrypted checkout via verified Nigerian banking rails</span>
              </div>
            </div>
          </div>

          {/* Affiliate Partner Promotion Module */}
          <div className="pt-3 border-t border-[#E4E7E5]">
            {affiliateProfile ? (
              <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-lg p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0E8F5A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Partner Referral Active ({affiliateProfile.code})</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#101413]">
                    Earn ~{formatCurrency(Math.round(product.price * (affiliateProfile.commissionRate || 0.05)))}
                  </span>
                </div>
                <p className="text-[11px] text-[#2C5E47]">
                  Share this product to earn {((affiliateProfile.commissionRate || 0.05) * 100).toFixed(0)}% commission on confirmed customer orders.
                </p>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#0E8F5A] hover:bg-[#0B7348] text-white font-bold rounded text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy My Affiliate Link</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-[#6B726E] pt-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0E8F5A]" />
                  <span>Earn up to 8% promoting MarketNest</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigateTo('affiliate')}
                  className="font-bold text-[#0E8F5A] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Become an Affiliate</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Trust, Safety & Report Listing */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-[#A0A5A3]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" />
              Verified Authentic Listing
            </span>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="text-[#6B726E] hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Flag className="w-3 h-3" />
              <span>Report this item</span>
            </button>
          </div>
        </div>
      </section>

      {/* TABS: Specifications, Delivery, Escrow, Reviews, and Q&A */}
      <section className="bg-[#FFFFFF] border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        {/* Tab Headers */}
        <div
          role="tablist"
          aria-label="Product information sections"
          className="flex items-center border-b border-[#E4E7E5] overflow-x-auto bg-[#F7F5F0]"
        >
          <button
            type="button"
            role="tab"
            id="tab-specs"
            aria-selected={activeTab === 'specs'}
            aria-controls="panel-specs"
            onClick={() => setActiveTab('specs')}
            className={`py-3.5 px-6 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-[#0E8F5A] text-[#101413] bg-white'
                : 'border-transparent text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            Specifications & Details
          </button>

          <button
            type="button"
            role="tab"
            id="tab-delivery"
            aria-selected={activeTab === 'delivery'}
            aria-controls="panel-delivery"
            onClick={() => setActiveTab('delivery')}
            className={`py-3.5 px-6 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'border-[#0E8F5A] text-[#101413] bg-white'
                : 'border-transparent text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            Shipping & Lagos 24h
          </button>

          <button
            type="button"
            role="tab"
            id="tab-escrow"
            aria-selected={activeTab === 'escrow'}
            aria-controls="panel-escrow"
            onClick={() => setActiveTab('escrow')}
            className={`py-3.5 px-6 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'escrow'
                ? 'border-[#0E8F5A] text-[#101413] bg-white'
                : 'border-transparent text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            Escrow & Returns Policy
          </button>

          <button
            type="button"
            role="tab"
            id="tab-reviews"
            aria-selected={activeTab === 'reviews'}
            aria-controls="panel-reviews"
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 px-6 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#0E8F5A] text-[#101413] bg-white'
                : 'border-transparent text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            <span>Customer Reviews</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#E8F5EF] text-[#0E8F5A] text-[11px] font-bold">
              {ratingDist.totalReviews}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-qa"
            aria-selected={activeTab === 'qa'}
            aria-controls="panel-qa"
            onClick={() => setActiveTab('qa')}
            className={`py-3.5 px-6 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'border-[#0E8F5A] text-[#101413] bg-white'
                : 'border-transparent text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            <span>Questions & Answers</span>
            <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-bold">
              {questions.length}
            </span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 sm:p-8">
          {/* Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <p className="text-sm text-[#101413] leading-relaxed max-w-3xl">
                {product.description}
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#101413] mb-3">
                  Technical Specifications
                </h4>
                <div className="max-w-2xl border border-[#E4E7E5] rounded-lg divide-y divide-[#E4E7E5] text-xs">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-3">
                      <span className="font-semibold text-[#6B726E]">{spec.label}</span>
                      <span className="col-span-2 text-[#101413] font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Delivery & Shipping */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 max-w-2xl text-xs sm:text-sm text-[#101413]">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#E8F5EF] text-[#0E8F5A]">
                <Truck className="w-5 h-5 shrink-0" />
                <div>
                  <h5 className="font-bold">Guaranteed Lagos Dispatch</h5>
                  <p className="text-xs text-[#101413] mt-1 leading-relaxed">
                    Orders received before 12:00 PM for Victoria Island, Ikoyi, Lekki, Ikeja, and Yaba qualify for same-day delivery. All other Lagos locations dispatched within 24 hours.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-[#101413]">Nationwide Express Timelines:</h5>
                <ul className="space-y-1.5 text-xs text-[#6B726E]">
                  <li>• <strong>Abuja FCT & Port Harcourt:</strong> 24–48 hours via premium air courier.</li>
                  <li>• <strong>Ibadan, Benin City, Enugu, Kano:</strong> 48–72 hours tracked ground dispatch.</li>
                  <li>• <strong>SMS & WhatsApp Tracking:</strong> Real-time rider updates provided upon departure.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Escrow & Returns */}
          {activeTab === 'escrow' && (
            <div className="space-y-4 max-w-2xl text-xs sm:text-sm text-[#101413]">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5]">
                <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0" />
                <div>
                  <h5 className="font-bold">7-Day Inspection Escrow Window</h5>
                  <p className="text-xs text-[#6B726E] mt-1 leading-relaxed">
                    When you order on MarketNest, your payment is held safely in escrow. The seller does not receive disbursement until you receive, inspect, and confirm the item meets quality standards.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold">Hassle-Free Returns</h5>
                <p className="text-xs text-[#6B726E] leading-relaxed">
                  If your package arrives damaged, incomplete, or different from specifications, our Lagos resolution desk arranges free return pick-up and instant 100% refund.
                </p>
              </div>
            </div>
          )}

          {/* Reviews & Ratings */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating Summary & Distribution Header */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#FBFBFA] border border-[#E4E7E5] rounded-xl p-6">
                {/* Average Score */}
                <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-[#E4E7E5] pb-6 md:pb-0 md:pr-6">
                  <div className="text-4xl sm:text-5xl font-serif font-bold text-[#101413]">
                    {ratingDist.averageRating}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(ratingDist.averageRating)
                            ? 'fill-amber-500'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#6B726E]">
                    Based on {ratingDist.totalReviews} verified customer {ratingDist.totalReviews === 1 ? 'review' : 'reviews'}
                  </p>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowReviewModal(true)}
                    >
                      Rate This Product
                    </Button>
                  </div>
                </div>

                {/* Star Distribution Bars */}
                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDist.counts[star as ReviewRating] || 0;
                    const pct = ratingDist.percentages[star as ReviewRating] || 0;
                    const isSelected = selectedStarFilter === star;

                    return (
                      <button
                        key={star}
                        onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                        className={`w-full flex items-center gap-3 text-xs p-1 rounded-md transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#E8F5EF] font-bold text-[#0E8F5A]' : 'text-[#6B726E] hover:bg-neutral-100'
                        }`}
                      >
                        <span className="w-8 flex items-center gap-0.5 justify-end">
                          <span>{star}</span>
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        </span>
                        <div className="flex-1 h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right tabular-nums">{pct}%</span>
                        <span className="w-8 text-neutral-400 text-right tabular-nums">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B726E]">Filter:</span>
                  <button
                    onClick={() => setSelectedStarFilter(null)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      selectedStarFilter === null
                        ? 'bg-[#101413] text-white'
                        : 'bg-[#F7F5F0] text-[#101413] hover:bg-neutral-200'
                    }`}
                  >
                    All ({reviews.length})
                  </button>
                  {[5, 4, 3].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedStarFilter(selectedStarFilter === star ? null : star)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        selectedStarFilter === star
                          ? 'bg-[#0E8F5A] text-white'
                          : 'bg-[#F7F5F0] text-[#101413] hover:bg-neutral-200'
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews Feed */}
              {displayedReviews.length > 0 ? (
                <div className="space-y-4">
                  {displayedReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 border border-[#E4E7E5] rounded-xl space-y-3 bg-white hover:border-[#101413] transition-colors"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E8F5EF] text-[#0E8F5A] font-bold flex items-center justify-center text-xs overflow-hidden">
                            {rev.customerAvatar ? (
                              <img src={rev.customerAvatar} alt={rev.customerName} className="w-full h-full object-cover" />
                            ) : (
                              rev.customerName?.[0] || 'C'
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#101413]">{rev.customerName}</span>
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5EF] text-[#0E8F5A]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verified Buyer</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#6B726E] mt-0.5">
                              <div className="flex items-center text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-500' : 'text-neutral-300'}`}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Helpful Button */}
                        <button
                          onClick={() => handleToggleHelpful(rev.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 border border-[#E4E7E5] rounded-md text-xs text-[#6B726E] hover:text-[#0E8F5A] hover:border-[#0E8F5A] transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="tabular-nums font-medium">Helpful ({rev.helpfulCount || 0})</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div>
                        {rev.title && <h5 className="font-bold text-sm text-[#101413] mb-1">{rev.title}</h5>}
                        <p className="text-xs text-[#101413] leading-relaxed">{rev.comment}</p>
                      </div>

                      {/* Review Photos */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Customer attachment"
                              className="w-16 h-16 object-cover rounded-lg border border-[#E4E7E5]"
                            />
                          ))}
                        </div>
                      )}

                      {/* Seller Official Response */}
                      {rev.response && (
                        <div className="bg-[#F7F5F0] border-l-2 border-[#0E8F5A] p-3.5 rounded-r-lg space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#101413] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#0E8F5A]" />
                              <span>{rev.response.sellerName || 'Merchant Response'}</span>
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(rev.response.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[#6B726E] leading-relaxed">{rev.response.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#6B726E] space-y-2">
                  <p>No customer reviews match this star filter.</p>
                  <button
                    onClick={() => setSelectedStarFilter(null)}
                    className="text-[#0E8F5A] font-semibold underline cursor-pointer"
                  >
                    View all reviews
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Questions & Answers (Q&A) */}
          {activeTab === 'qa' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7E5]">
                <div>
                  <h4 className="font-bold text-sm text-[#101413]">Customer Inquiries & Answers</h4>
                  <p className="text-xs text-[#6B726E]">
                    Have a question regarding dimensions, fabric, or compatibility? Ask the merchant directly.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowQuestionModal(true)}
                  icon={<HelpCircle className="w-4 h-4" />}
                >
                  Ask a Question
                </Button>
              </div>

              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="p-4 border border-[#E4E7E5] rounded-xl space-y-3 bg-white">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-neutral-100 text-[#101413] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          Q
                        </span>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-[#101413]">{q.question}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            Asked by {q.customerName || 'Shopper'} on {new Date(q.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Answers */}
                      {q.answers && q.answers.length > 0 ? (
                        <div className="pl-7 space-y-2">
                          {q.answers.map((a) => (
                            <div key={a.id} className="p-3 bg-[#FBFBFA] border border-[#E4E7E5] rounded-lg space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#101413]">{a.answererName}</span>
                                {a.answererType === 'seller' && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#E8F5EF] text-[#0E8F5A] font-bold text-[10px]">
                                    Seller Answer
                                  </span>
                                )}
                                <span className="text-[10px] text-neutral-400">
                                  {new Date(a.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-[#101413] leading-relaxed">{a.answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-7 text-xs text-neutral-400 italic">
                          Awaiting official merchant response.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#6B726E]">
                  <p>No questions have been asked about this listing yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FREQUENTLY BOUGHT TOGETHER BUNDLE */}
      {frequentlyBought.length > 0 && (
        <section className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0E8F5A]" />
            <h3 className="font-bold text-lg text-[#101413]">Frequently Bought Together</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 flex flex-wrap items-center gap-4">
              {/* Product 1 */}
              <div className="flex items-center gap-3 bg-white border border-[#E4E7E5] rounded-lg p-2.5 max-w-xs">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                  alt={product.title}
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#101413] truncate">{product.title}</p>
                  <p className="text-xs text-[#0E8F5A] font-semibold tabular-nums">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <span className="text-xl font-bold text-neutral-400">+</span>

              {/* Product 2 */}
              <div className="flex items-center gap-3 bg-white border border-[#E4E7E5] rounded-lg p-2.5 max-w-xs">
                <img
                  src={frequentlyBought[0].images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                  alt={frequentlyBought[0].title}
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#101413] truncate">{frequentlyBought[0].title}</p>
                  <p className="text-xs text-[#0E8F5A] font-semibold tabular-nums">
                    {formatCurrency(frequentlyBought[0].price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bundle Action */}
            <div className="md:col-span-4 bg-white border border-[#E4E7E5] rounded-xl p-4 text-center md:text-left space-y-2">
              <p className="text-xs text-[#6B726E]">Combined Bundle Total:</p>
              <p className="text-xl font-bold text-[#101413] tabular-nums">
                {formatCurrency(product.price + frequentlyBought[0].price)}
              </p>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => handleAddBundle(frequentlyBought[0])}
              >
                Add Both to Bag
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* MORE FROM THIS SELLER */}
      {fromThisSeller.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif text-[#101413]">
              More from {product.storeName || 'This Merchant'}
            </h3>
            <button
              onClick={() => navigateTo('storefront', { storeId: product.sellerId })}
              className="text-xs font-semibold text-[#0E8F5A] hover:underline cursor-pointer"
            >
              View Storefront
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {fromThisSeller.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* YOU MAY ALSO LIKE */}
      {youMayAlsoLike.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif text-[#101413]">You May Also Like</h3>
            <button
              onClick={() => navigateTo('shop', { category: product.category })}
              className="text-xs font-semibold text-[#0E8F5A] hover:underline cursor-pointer"
            >
              Browse Department
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {youMayAlsoLike.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED PRODUCTS */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-[#E4E7E5]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif text-[#101413]">Recently Viewed by You</h3>
            <button
              onClick={() => {
                recommendationService.clearRecentlyViewed();
                setRecentlyViewed([]);
              }}
              className="text-xs text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {recentlyViewed.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => navigateTo('product', { productId: p.id })}
                className="bg-white border border-[#E4E7E5] rounded-lg p-2 hover:border-[#101413] transition-colors cursor-pointer group space-y-1.5"
              >
                <div className="aspect-square rounded bg-[#F7F5F0] overflow-hidden">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-[11px] font-bold text-[#101413] truncate">{p.title}</p>
                <p className="text-[10px] text-[#0E8F5A] font-semibold tabular-nums">{formatCurrency(p.price)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL: Rate Product / Submit Review */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7E5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
              <h3 className="font-bold text-base text-[#101413] flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Write a Verified Customer Review</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Picker */}
              <div>
                <label className="font-bold text-[#101413] block mb-1">Your Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s as ReviewRating)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= reviewRating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-sm text-[#101413] ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold text-[#101413] block mb-1">Review Headline *</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g., Exquisite stitching, arrived next day in Lagos"
                  className="w-full px-3 py-2 border border-[#E4E7E5] rounded-lg text-xs focus:ring-1 focus:ring-[#0E8F5A] focus:outline-none"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="font-bold text-[#101413] block mb-1">Detailed Feedback *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the product fit, artisan finish, courier packaging, or experience..."
                  className="w-full px-3 py-2 border border-[#E4E7E5] rounded-lg text-xs focus:ring-1 focus:ring-[#0E8F5A] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Image URL optional */}
              <div>
                <label className="font-bold text-[#101413] block mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Photo Attachment URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={reviewImageUrl}
                  onChange={(e) => setReviewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-[#E4E7E5] rounded-lg text-xs focus:ring-1 focus:ring-[#0E8F5A] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#E8F5EF] border border-[#A7E2C9] rounded-lg text-[11px] text-[#2C5E47] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0" />
                <span>
                  All reviews undergo authenticity verification against confirmed orders before granting the Verified Buyer badge.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={isSubmittingReview}
                >
                  Publish Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ask Product Question */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7E5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
              <h3 className="font-bold text-base text-[#101413] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0E8F5A]" />
                <span>Ask the Merchant a Question</span>
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#101413] block mb-1">Your Question *</label>
                <textarea
                  required
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g., Can this item be produced in custom chest dimensions? Is dry-cleaning required?"
                  className="w-full px-3 py-2 border border-[#E4E7E5] rounded-lg text-xs focus:ring-1 focus:ring-[#0E8F5A] focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-[#6B726E]">
                The merchant receives this inquiry directly and answers are published to assist all buyers.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={isSubmittingQuestion}
                >
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: High-Resolution Image Zoom Lightbox */}
      {isImageZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High resolution image preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsImageZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageZoomOpen(false)}
            className="absolute top-4 right-4 p-2.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
            aria-label="Close image zoom"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-black flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={productGallery[activeImageIndex] || productGallery[0]}
              alt={product.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />

            {productGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productGallery.length - 1))}
                  className="absolute left-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev < productGallery.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Report Listing Modal */}
      <ReportProductModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        productId={product.id}
        productTitle={product.title}
      />

      {/* MOBILE STICKY BOTTOM BUY BAR (Phase 15 Conversion Booster) */}
      {isStickyBarVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E7E5] p-3 sm:hidden shadow-lg animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <img
              src={productGallery[0]}
              alt=""
              aria-hidden="true"
              className="w-11 h-11 object-cover rounded bg-[#F7F5F0] border border-[#E4E7E5] shrink-0"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-[#101413] truncate">{product.title}</p>
              <p className="text-sm font-bold text-[#0E8F5A] tabular-nums">
                {formatCurrency(activePrice)}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              className="shrink-0 font-bold"
            >
              Add to Bag
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
