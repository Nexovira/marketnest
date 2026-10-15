# MarketNest — Luxury Nigerian Marketplace (Phase 1)

MarketNest is an editorial, high-trust multi-vendor commerce platform designed for Nigeria. Phase 1 delivers an exceptional customer-facing marketplace experience, featuring curated discovery, verified Nigerian sellers, responsive shopping catalog, product details with tabbed specifications, interactive cart & wishlist drawers, and a production-grade TypeScript architecture designed for clean integration with Firebase, Paystack, and vendor portals in subsequent phases.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices have been confirmed through Phase 1 requirements and user clarification:

*   **Confirmed Curation Focus**: Balanced multi-category editorial spotlight spanning contemporary Nigerian fashion, consumer tech & electronics, home & living, beauty & wellness, gourmet provisions, and artisanal leathercraft.
*   **Confirmed Trust & Speed Signal**: Prominent "Lagos Same-Day / 24h Delivery" and verified store badges (`Urban Finds ✓`, `Ikoyi Artisans ✓`, `Yaba Tech Hub ✓`) paired with transparent delivery timelines.
*   **Confirmed Shop Discovery Layout**: Adaptive 4-column luxury grid with collapsible multifaceted filters (categories, price range in ₦, ratings, seller verification, delivery speed) and seamless Quick View modal.
*   **Phase Boundary Enforced**: No premature Firebase DB or Paystack checkout API integrations in Phase 1 (as explicitly specified). Instead, full typed models (`User`, `Seller`, `Affiliate`, `Admin`, `Product`, `Order`, `Commission`, `Cart`, `Review`) and client-side reactive state will power the zero-latency customer UX while providing clean dependency injection points for Phase 2+.

***

## 1. Overview & Core Concept

*   **What It Does**: MarketNest connects discerning Nigerian shoppers with vetted independent stores and craftsmen across Lagos, Abuja, Port Harcourt, and beyond. Customers can browse editorial collections, filter thousands of curated items, inspect high-resolution product galleries, manage their wishlist and cart, view transparent seller trust metrics, and experience seamless navigation across mobile and desktop.
*   **Target Audience / Persona**:
    *   *Affluent and modern Nigerian consumers* seeking genuine, high-quality local and imported goods without navigating chaotic social commerce DMs or untrusted sellers.
    *   *Professional Nigerian brands and independent merchants* who require an elevated digital showcase reflecting craftsmanship and credibility.
*   **Key Value**: Replaces the fragmented, informal commerce experience with a unified, high-trust platform built on editorial presentation, verified seller identities, and transparent Nigerian logistics.

***

## 2. User Experience & Visual Design

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: MarketNest [Wordmark]   ──   Shop · Stores · Deals   ──   ♡ (2)  🛒 (1) │
├──────────────────────────────────────────────────────────────────────────────┤
│ HERO: "Discover products worth coming back for."                             │
│       Subtext: Shop quality products from trusted Nigerian sellers.          │
│       [ Start Shopping ]    [ Explore Stores ]                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ TRUST STRIP:  ✓ Verified Sellers   ·   🔒 Secure Escrow   ·   ⚡ Lagos 24h    │
├──────────────────────────────────────────────────────────────────────────────┤
│ EDITORIAL COLLECTIONS: "Made in Nigeria"  ·  "Everyday Luxury" · "Under ₦50k"│
├──────────────────────────────────────────────────────────────────────────────┤
│ TRENDING NOW (4-Col Luxury Grid with Quick View, Rating & Add-to-Cart)       │
├──────────────────────────────────────────────────────────────────────────────┤
│ FEATURED STORES: Urban Finds (Lagos) · Alara Studio · Lekki Tech Hub        │
├──────────────────────────────────────────────────────────────────────────────┤
│ WHY MARKETNEST  ──  SELLER CALLOUT ("Your products deserve more customers")   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
*   **Aesthetic Direction**: Editorial luxury, quiet confidence, spacious layout with anti-slop discipline (no cartoon badges, no garish neon gradients, no clunky pill sandwiches).
*   **Color Palette**:
    *   *Canvas & Backgrounds*: Deep Ink `#101413` (for dark accents & seller transition), Secondary Dark `#1B211F`, Pure Canvas `#FFFFFF`, and Warm Ivory `#F7F5F0` for structural editorial sections.
    *   *Brand Green*: Premium Green `#0E8F5A` (used strictly for primary CTAs, verification ticks, active filters, and subtle badges), Soft Green `#E8F5EF` for active hover accents.
    *   *Neutrals & Hairlines*: Muted Text `#6B726E`, Hairline Borders `#E4E7E5`.
*   **Typography**: Clean sans-serif hierarchy using tight display tracking (`-0.025em`) for headlines, 15–16px body prose with relaxed line-height (1.6), and `tabular-nums` for all Naira (₦) currency displays.
*   **Top Bar Contract**:
    *   *Zone 1 (Left)*: Single-element MarketNest wordmark with subtle geometric nest symbol.
    *   *Zone 2 (Center)*: Prominent search input ("Search products, brands and stores...") and clean text links (Shop, Categories, Stores, Deals).
    *   *Zone 3 (Right)*: "Sell on MarketNest" subtle action, Wishlist counter, Cart drawer trigger with live badge counter.

### Key Interactive Flows
1.  **Editorial Discovery & Homepage**: Engaging hero with high-fidelity imagery, trust indicators, high-contrast category tiles (Fashion, Electronics, Beauty, Home, Bags, Provisions), and curated seller profiles.
2.  **Shop Catalog (`/shop`)**: Multi-attribute filtering (category, price slider, rating, verified sellers only, in-stock), dynamic sorting (Recommended, Newest, Price: Low to High, Price: High to Low, Top Rated), and search query synchronization.
3.  **Product Detail Modal & View (`/product/:id`)**: Split-screen presentation with multi-angle gallery, seller card with location & rating, stock availability, quantity selector, specs accordion, and customer reviews.
4.  **Cart & Wishlist Drawers**: Slide-over drawer with line-item management, quantity adjustment, free delivery progress indicator (e.g. "Add ₦15,000 for complimentary Lagos express delivery"), and mock checkout flow preview.

***

## 3. Key Product Decisions & Trade-Offs

*   **Decision 1: Client-Side Reactive Store with LocalStorage Persistence**
    *   *Chosen Approach*: Built-in React Context + custom lightweight hook with `localStorage` synchronization for Cart, Wishlist, Filter preferences, and active views.
    *   *Why*: Delivers instantaneous, flicker-free UI transitions without server latency; preserves user cart across browser reloads.
    *   *Alternatives Considered*: Waiting for Firebase Auth/Firestore (deferred to Phase 2 per strict prompt requirements).
*   **Decision 2: Comprehensive Multi-Vendor Data Modeling Upfront**
    *   *Chosen Approach*: Define complete TypeScript contracts in `src/types/` representing full multi-vendor entities (`Store`, `Seller`, `Affiliate`, `AdminCommission`, `Order`, `PaymentBreakdown`).
    *   *Why*: Ensures zero architectural debt when Phase 2 (Auth) and Phase 3–5 (Seller/Paystack) are built later.
*   **Decision 3: Curated Nigerian Marketplace Context & Realistic Imagery**
    *   *Chosen Approach*: Authentic product listings denominated in Nigerian Naira (₦), realistic seller locations (Victoria Island, Ikeja, Lekki, Abuja Central, Port Harcourt), and high-resolution Unsplash/AI-crafted imagery with solid travertine/neutral backdrops.

***

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MarketNest App                                  │
│                                                                             │
│   ┌─────────────────────────── AppContext ──────────────────────────────┐   │
│   │  - Cart State (items, add/remove, quantity, subtotal)               │   │
│   │  - Wishlist State (ids, toggle)                                     │   │
│   │  - Active View Routing ('home' | 'shop' | 'product' | 'stores')     │   │
│   │  - Active Search & Category Filter State                            │   │
│   │  - QuickView Product Modal State                                    │   │
│   │  - Toast Notification Dispatcher                                    │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│         ┌────────────────────────────┼────────────────────────────┐         │
│         ▼                            ▼                            ▼         │
│   ┌─────────────┐             ┌─────────────┐             ┌─────────────┐   │
│   │   Navbar    │             │ Active View │             │ Cart Drawer │   │
│   │ & Searchbar │             │ Controller  │             │ & Wishlist  │   │
│   └─────────────┘             └──────┬──────┘             └─────────────┘   │
│                                      │                                      │
│              ┌───────────────────────┼───────────────────────┐              │
│              ▼                       ▼                       ▼              │
│       ┌──────────────┐        ┌──────────────┐        ┌──────────────┐      │
│       │   HomePage   │        │   ShopPage   │        │ ProductPage  │      │
│       │  - Hero      │        │  - FilterBar │        │  - Gallery   │      │
│       │  - Trust     │        │  - SortBar   │        │  - Buy Box   │      │
│       │  - Trending  │        │  - ProdGrid  │        │  - Seller    │      │
│       │  - Stores    │        │  - Paging    │        │  - Reviews   │      │
│       │  - Editorial │        └──────────────┘        └──────────────┘      │
│       └──────────────┘                                                      │
│                                      │                                      │
│                                      ▼                                      │
│                      ┌──────────────────────────────┐                       │
│                      │  Design System & UI Library  │                       │
│                      │  - Button, Badge, Rating     │                       │
│                      │  - ProductCard, StoreCard    │                       │
│                      │  - Modal, Drawer, Toast      │                       │
│                      │  - FilterChip, Breadcrumbs   │                       │
│                      └──────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### TypeScript Entities Roadmap (`src/types/index.ts`)
*   `Product`: ID, title, slug, price, originalPrice, currency ('NGN'), category, images, rating, reviewCount, inStock, stockCount, sellerId, seller (Store), tags, specifications, deliverySpeed.
*   `Store` / `Seller`: ID, name, slug, logo, banner, verified, location (City, State), rating, productCount, joinedDate, bio, badge.
*   `Customer` & `User`: ID, name, email, phone, role ('customer' | 'seller' | 'affiliate' | 'admin'), addresses.
*   `Cart` & `CartItem`: Items list, quantity, selectedVariant, unitPrice, lineTotal, estimatedDeliveryFee, subtotal, total.
*   `Order` & `OrderItem`: Order reference, customer, items, shippingAddress, paymentStatus, fulfillmentStatus, sellerPayouts.
*   `Affiliate`, `AffiliateCampaign`, `Commission`: Future schema stubs for seamless Phase 6 upgrade.

***

## 5. Execution Steps

1.  **Foundation & Metadata**: Update `metadata.json` and `index.html` with MarketNest brand name, description, and OpenGraph headers.
2.  **Type System & Data Store**: Create `src/types/index.ts` with all Phase 1 and future-compatible models. Create `src/data/mockData.ts` with comprehensive Nigerian marketplace products, verified stores, and curated categories.
3.  **State Management & Utilities**: Implement `src/context/MarketContext.tsx` handling cart, wishlist, routing/views, search filter, and toast feedback.
4.  **Atomic UI Design System**: Build reusable components in `src/components/ui/` (Button, Badge, VerifiedBadge, RatingStars, PriceDisplay, Modal, Drawer, Breadcrumb, Toast, Skeleton).
5.  **Marketplace Components**: Build `Navbar`, `Footer`, `ProductCard`, `StoreCard`, `CartDrawer`, `QuickViewModal`.
6.  **Page Views**:
    *   `src/pages/HomePage.tsx`: Hero, Trust Strip, Category Discovery, Trending Grid, Featured Stores, Editorial Spotlights, Why MarketNest, Seller Transition CTA, Newsletter.
    *   `src/pages/ShopPage.tsx`: Full filtering sidebar (price, category, rating, verified), sorting dropdown, responsive 4-column product grid, empty state.
    *   `src/pages/ProductDetailPage.tsx`: Detailed PDP layout with multi-image selector, seller credibility badge, specs tabs, customer reviews.
    *   `src/pages/StoresPage.tsx`: Browse all verified Nigerian seller boutiques.
7.  **Verification**: Test build integrity with `compile_applet`, verify responsive behavior across mobile (360px) and desktop (1440px), ensure zero console errors.
