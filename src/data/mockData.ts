/**
 * @file src/data/mockData.ts
 * Curated Nigerian marketplace data for MarketNest Phase 1.
 * Denominated in Nigerian Naira (₦) with verified local independent stores.
 */

import { Category, Product, Review, Store } from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg';
export const EDITORIAL_MADE_IN_NIGERIA = '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg';
export const EDITORIAL_EVERYDAY_TECH = '/src/assets/images/editorial_everyday_tech_1791134164769.jpg';
export const EDITORIAL_BEAUTY_GLOW = '/src/assets/images/editorial_beauty_glow_1791134175992.jpg';

export const MOCK_STORES: Store[] = [
  {
    id: 'store_urban_finds',
    sellerId: 'user_seller_01',
    name: 'Urban Finds',
    slug: 'urban-finds',
    tagline: 'Modern wardrobe & leathercraft for the conscious minimalist',
    bio: 'Based in Victoria Island, Urban Finds crafts modern leather goods, apparel, and lifestyle accessories designed for cosmopolitan Nigerian living.',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verified: true,
    city: 'Victoria Island',
    state: 'Lagos',
    rating: 4.88,
    reviewCount: 312,
    productCount: 142,
    joinedYear: 2023,
    responseRatePercent: 99,
    shipsWithinHours: 12,
    specialties: ['Full-Grain Leather', 'Contemporary Bags', 'Accessories']
  },
  {
    id: 'store_alara_heritage',
    sellerId: 'user_seller_02',
    name: 'Alara Studio Living',
    slug: 'alara-studio-living',
    tagline: 'Architectural home goods & handcrafted West African textiles',
    bio: 'Celebrating architectural form and African material culture. Every object is created in small batches in partnership with master weavers and wood turners.',
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    verified: true,
    city: 'Ikoyi',
    state: 'Lagos',
    rating: 4.95,
    reviewCount: 184,
    productCount: 68,
    joinedYear: 2022,
    responseRatePercent: 97,
    shipsWithinHours: 24,
    specialties: ['Iroko Woodwork', 'Handwoven Throws', 'Sculptural Ceramics']
  },
  {
    id: 'store_yaba_circuits',
    sellerId: 'user_seller_03',
    name: 'Yaba Circuit & Tech',
    slug: 'yaba-circuit-tech',
    tagline: 'Genuine flagship electronics & workspace audio equipment',
    bio: 'Vetted consumer tech specialists operating out of Yaba and Computer Village. All items are 100% authentic with factory warranties and same-day Lagos dispatch.',
    logoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    verified: true,
    city: 'Yaba',
    state: 'Lagos',
    rating: 4.82,
    reviewCount: 540,
    productCount: 215,
    joinedYear: 2021,
    responseRatePercent: 100,
    shipsWithinHours: 6,
    specialties: ['Premium Audio', 'Workstations', 'Flagship Gadgets']
  },
  {
    id: 'store_zaria_botanicals',
    sellerId: 'user_seller_04',
    name: 'Zaria Botanical Lab',
    slug: 'zaria-botanical-lab',
    tagline: 'Wild-harvested cold-pressed skincare & botanical perfumery',
    bio: 'Formulating high-potency skincare using cold-pressed northern Nigerian seed oils, unrefined shea, and scientifically verified active botanicals.',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    verified: true,
    city: 'Maitama',
    state: 'Abuja FCT',
    rating: 4.92,
    reviewCount: 228,
    productCount: 46,
    joinedYear: 2023,
    responseRatePercent: 98,
    shipsWithinHours: 24,
    specialties: ['Clean Skincare', 'Northern Botanical Oils', 'Luxury Balms']
  },
  {
    id: 'store_kano_atelier',
    sellerId: 'user_seller_05',
    name: 'Kano Leather Atelier',
    slug: 'kano-leather-atelier',
    tagline: 'Heritage tannery craftsmanship since 1988',
    bio: 'Centuries-old northern vegetable tanning traditions elevated into modern weekenders, everyday cardholders, and bespoke footwear.',
    logoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    verified: true,
    city: 'Kano & Lagos Island',
    state: 'Lagos',
    rating: 4.91,
    reviewCount: 165,
    productCount: 82,
    joinedYear: 2022,
    responseRatePercent: 96,
    shipsWithinHours: 24,
    specialties: ['Vegetable Tanned Leather', 'Handmade Footwear', 'Travel Bags']
  },
  {
    id: 'store_naija_gourmet',
    sellerId: 'user_seller_06',
    name: 'Naija Harvest Provisions',
    slug: 'naija-harvest-provisions',
    tagline: 'Single-estate artisanal coffees, forest honeys & spice blends',
    bio: 'Direct-trade pantry essentials sourced ethically from smallholder agrarian cooperatives across Plateau, Taraba, and Ondo states.',
    logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    verified: true,
    city: 'Lekki Phase 1',
    state: 'Lagos',
    rating: 4.86,
    reviewCount: 134,
    productCount: 52,
    joinedYear: 2024,
    responseRatePercent: 99,
    shipsWithinHours: 12,
    specialties: ['Artisanal Honey', 'Mambilla Coffee', 'Organic Seasoning']
  }
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Contemporary Nigerian tailoring, breathable linen agbadas, and everyday silhouettes.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    itemCount: 420,
    featuredPicksCount: 48
  },
  {
    id: 'bags',
    name: 'Bags & Leather',
    slug: 'bags',
    description: 'Full-grain vegetable-tanned crossbody bags, structured totes, and travel bags.',
    imageUrl: EDITORIAL_MADE_IN_NIGERIA,
    itemCount: 185,
    featuredPicksCount: 32
  },
  {
    id: 'electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'Active noise-canceling headphones, workspace monitors, and mechanical accessories.',
    imageUrl: EDITORIAL_EVERYDAY_TECH,
    itemCount: 310,
    featuredPicksCount: 40
  },
  {
    id: 'phones',
    name: 'Phones & Gadgets',
    slug: 'phones',
    description: 'Factory-sealed smartphones, MagSafe chargers, smartwatches, and cases.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    itemCount: 245,
    featuredPicksCount: 28
  },
  {
    id: 'beauty',
    name: 'Beauty & Skincare',
    slug: 'beauty',
    description: 'Clean botanicals, northern shea formulations, and clean facial treatments.',
    imageUrl: EDITORIAL_BEAUTY_GLOW,
    itemCount: 160,
    featuredPicksCount: 36
  },
  {
    id: 'home',
    name: 'Home & Living',
    slug: 'home',
    description: 'Hand-turned Iroko timber vessels, linen textiles, and architectural lamps.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    itemCount: 195,
    featuredPicksCount: 22
  },
  {
    id: 'shoes',
    name: 'Shoes & Footwear',
    slug: 'shoes',
    description: 'Bespoke calfskin monkstraps, handcrafted slides, and minimalist sneakers.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    itemCount: 130,
    featuredPicksCount: 19
  },
  {
    id: 'food',
    name: 'Food & Pantry',
    slug: 'food',
    description: 'Single-origin wild honeys, Mambilla highland coffee beans, and organic hibiscus.',
    imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
    itemCount: 88,
    featuredPicksCount: 15
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    title: 'Premium Leather Crossbody Bag',
    slug: 'premium-leather-crossbody-bag',
    shortDescription: 'Supple full-grain cowhide with brushed brass hardware and custom cotton lining.',
    description: 'Handcrafted in Victoria Island from select Nigerian full-grain pull-up leather. The bag develops a rich organic patina over time. Features an adjustable shoulder strap, dual magnetic front closure, and a dedicated zippered interior passport compartment.',
    price: 34500,
    originalPrice: 42000,
    category: 'bags',
    images: [
      EDITORIAL_MADE_IN_NIGERIA,
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.88,
    reviewCount: 124,
    inStock: true,
    stockCount: 18,
    sellerId: 'store_urban_finds',
    seller: MOCK_STORES[0],
    isMadeInNigeria: true,
    isEditorialPick: true,
    isTrending: true,
    deliverySpeed: 'lagos_sameday',
    specifications: [
      { label: 'Material', value: '100% Full-grain Nigerian leather' },
      { label: 'Hardware', value: 'Antiqued solid brass' },
      { label: 'Dimensions', value: '26cm x 19cm x 7cm' },
      { label: 'Origin', value: 'Handmade in Lagos, Nigeria' }
    ],
    variants: [
      { id: 'v1', name: 'Raw Cognac Brown', sku: 'UF-BAG-COG', price: 34500, stockCount: 10 },
      { id: 'v2', name: 'Midnight Obsidian', sku: 'UF-BAG-OBS', price: 34500, stockCount: 8 }
    ],
    tags: ['leather', 'handcrafted', 'bags', 'crossbody', 'accessories'],
    createdAt: '2026-02-10'
  },
  {
    id: 'prod_002',
    title: 'Studio Pro Wireless ANC Headphones',
    slug: 'studio-pro-wireless-anc-headphones',
    shortDescription: 'Audiophile 40mm beryllium drivers, 38-hour battery, and active ambient transparency.',
    description: 'Engineered for discerning listeners and remote professionals in Lagos and beyond. High-fidelity custom acoustic tuning, memory-foam protein leather ear cushions, and ultra-low latency multipoint Bluetooth 5.3 pairing. Includes premium protective travel case.',
    price: 135000,
    originalPrice: 155000,
    category: 'electronics',
    images: [
      EDITORIAL_EVERYDAY_TECH,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.91,
    reviewCount: 86,
    inStock: true,
    stockCount: 14,
    sellerId: 'store_yaba_circuits',
    seller: MOCK_STORES[2],
    isMadeInNigeria: false,
    isEditorialPick: true,
    isTrending: true,
    deliverySpeed: 'lagos_24h',
    specifications: [
      { label: 'Driver Size', value: '40mm Custom Tuned Beryllium' },
      { label: 'Battery Life', value: '38 hours (ANC Active)' },
      { label: 'Charging', value: 'USB-C Fast Charge (10m = 4h)' },
      { label: 'Warranty', value: '1 Year Full Replacement Guarantee' }
    ],
    tags: ['audio', 'electronics', 'anc', 'wireless', 'headphones'],
    createdAt: '2026-01-20'
  },
  {
    id: 'prod_003',
    title: 'Baobab & Niacinamide Radiance Serum',
    slug: 'baobab-niacinamide-radiance-serum',
    shortDescription: 'Potent cold-pressed baobab seed oil with 10% niacinamide for deep cellular glow.',
    description: 'An antioxidant-dense formulation designed specifically for tropical sun-exposed skin. Strengthens the moisture barrier, fades hyperpigmentation, and balances oil production without clogging pores. Made with wild-harvested northern Nigerian botanicals.',
    price: 21500,
    originalPrice: 26000,
    category: 'beauty',
    images: [
      EDITORIAL_BEAUTY_GLOW,
      'https://images.unsplash.com/photo-1608248597359-002d9c158145?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.94,
    reviewCount: 158,
    inStock: true,
    stockCount: 42,
    sellerId: 'store_zaria_botanicals',
    seller: MOCK_STORES[3],
    isMadeInNigeria: true,
    isEditorialPick: true,
    isTrending: true,
    deliverySpeed: 'lagos_24h',
    specifications: [
      { label: 'Volume', value: '30ml / 1.0 fl oz' },
      { label: 'Key Actives', value: 'Northern Baobab Seed Oil, 10% Niacinamide, Licorice Extract' },
      { label: 'Texture', value: 'Silky quick-absorbing fluid' },
      { label: 'Free From', value: 'Parabens, synthetic fragrance, sulfates' }
    ],
    tags: ['beauty', 'skincare', 'serum', 'baobab', 'glow'],
    createdAt: '2026-02-15'
  },
  {
    id: 'prod_004',
    title: 'Sculptural Solid Iroko Architectural Bowl',
    slug: 'sculptural-solid-iroko-architectural-bowl',
    shortDescription: 'Hand-turned from reclaimed sustainable Nigerian Iroko timber with food-safe wax finish.',
    description: 'Each centerpiece is turned by master woodworkers in Ikoyi using salvaged centuries-old Nigerian Iroko hardwood. Featuring subtle asymmetrical beveling, the vessel showcases deep natural wood rings and warm amber tones. Suitable as a decorative centerpiece or fruit bowl.',
    price: 48000,
    category: 'home',
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.87,
    reviewCount: 38,
    inStock: true,
    stockCount: 7,
    sellerId: 'store_alara_heritage',
    seller: MOCK_STORES[1],
    isMadeInNigeria: true,
    isEditorialPick: true,
    isTrending: false,
    deliverySpeed: 'lagos_sameday',
    specifications: [
      { label: 'Material', value: '100% Solid Reclaimed Nigerian Iroko' },
      { label: 'Diameter', value: '32cm' },
      { label: 'Depth', value: '9cm' },
      { label: 'Care', value: 'Wipe with damp cloth and mineral oil' }
    ],
    tags: ['home', 'decor', 'iroko', 'woodwork', 'artisan'],
    createdAt: '2026-01-12'
  },
  {
    id: 'prod_005',
    title: 'Tailored Linen Camp Collar Shirt',
    slug: 'tailored-linen-camp-collar-shirt',
    shortDescription: '100% European flax tailored in Lagos for effortless tropical elegance and breathability.',
    description: 'Cut with a relaxed silhouette and classic Cuban camp collar. Tailored from pre-washed 180gsm linen that softens with every wash while remaining crisp. Finished with natural mother-of-pearl buttons and discreet chest pocket.',
    price: 36000,
    originalPrice: 42000,
    category: 'fashion',
    images: [
      HERO_IMAGE,
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.84,
    reviewCount: 62,
    inStock: true,
    stockCount: 23,
    sellerId: 'store_urban_finds',
    seller: MOCK_STORES[0],
    isMadeInNigeria: true,
    isEditorialPick: false,
    isTrending: true,
    deliverySpeed: 'lagos_sameday',
    specifications: [
      { label: 'Fabric', value: '100% Breathable Washed Linen (180gsm)' },
      { label: 'Fit', value: 'Relaxed Tailored Fit' },
      { label: 'Buttons', value: 'Natural Mother-of-Pearl' },
      { label: 'Care', value: 'Gentle cold wash, air dry' }
    ],
    variants: [
      { id: 'v_s', name: 'Sand Khaki - Medium', sku: 'LCS-KHA-M', price: 36000, stockCount: 8 },
      { id: 'v_l', name: 'Sand Khaki - Large', sku: 'LCS-KHA-L', price: 36000, stockCount: 10 },
      { id: 'v_xl', name: 'Sand Khaki - XL', sku: 'LCS-KHA-XL', price: 36000, stockCount: 5 }
    ],
    tags: ['apparel', 'fashion', 'linen', 'shirt', 'lagos'],
    createdAt: '2026-02-02'
  },
  {
    id: 'prod_006',
    title: 'Handmade Calfskin Double Monkstrap Shoes',
    slug: 'handmade-calfskin-double-monkstrap-shoes',
    shortDescription: 'Goodyear welted northern calfskin with hand-buffed burnished toe cap and brass buckles.',
    description: 'Constructed by second-generation cobblers using veg-tanned northern Nigerian calf leather. Features a cork footbed that molds to your arch, channel-stitched leather outsole, and hand-stained edge dressings.',
    price: 88500,
    originalPrice: 105000,
    category: 'shoes',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.96,
    reviewCount: 47,
    inStock: true,
    stockCount: 9,
    sellerId: 'store_kano_atelier',
    seller: MOCK_STORES[4],
    isMadeInNigeria: true,
    isEditorialPick: true,
    isTrending: false,
    deliverySpeed: 'express_48h',
    specifications: [
      { label: 'Upper', value: 'Hand-buffed Full Grain Calfskin' },
      { label: 'Construction', value: 'Goodyear Welted with Channel Stitching' },
      { label: 'Sole', value: 'Double Vegetable-Tanned Leather Sole' },
      { label: 'Buckles', value: 'Solid Antiqued Brass' }
    ],
    variants: [
      { id: 'sz_41', name: 'Size EU 41', sku: 'MONK-BRN-41', price: 88500, stockCount: 3 },
      { id: 'sz_42', name: 'Size EU 42', sku: 'MONK-BRN-42', price: 88500, stockCount: 4 },
      { id: 'sz_43', name: 'Size EU 43', sku: 'MONK-BRN-43', price: 88500, stockCount: 2 }
    ],
    tags: ['shoes', 'footwear', 'monkstrap', 'leather', 'luxury'],
    createdAt: '2026-01-05'
  },
  {
    id: 'prod_007',
    title: 'Single-Origin Ondo Wild Forest Raw Honey (750g)',
    slug: 'ondo-wild-forest-raw-honey',
    shortDescription: 'Unpasteurized and raw, cold-extracted from ancient tropical secondary forests.',
    description: 'Harvested ethically from hollow-log hives in the forested highlands of Ondo State. Dark amber in hue with deep floral complexity, hints of citrus blossom, and gentle woody undertones. Never heated or ultra-filtered to preserve active pollen enzymes.',
    price: 14500,
    category: 'food',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.89,
    reviewCount: 79,
    inStock: true,
    stockCount: 35,
    sellerId: 'store_naija_gourmet',
    seller: MOCK_STORES[5],
    isMadeInNigeria: true,
    isEditorialPick: false,
    isTrending: false,
    deliverySpeed: 'lagos_sameday',
    specifications: [
      { label: 'Net Weight', value: '750g Glass Jar' },
      { label: 'Origin', value: 'Idanre Forest Reserve, Ondo State' },
      { label: 'Process', value: 'Cold centrifugal extraction, gravity settled' },
      { label: 'Shelf Life', value: 'Indefinite when sealed dry' }
    ],
    tags: ['food', 'pantry', 'honey', 'organic', 'gourmet'],
    createdAt: '2026-02-18'
  },
  {
    id: 'prod_008',
    title: 'Ultra-Slim Titanium MagSafe 10,000mAh Powerbank',
    slug: 'titanium-magsafe-powerbank',
    shortDescription: 'Aircraft-grade titanium exterior with 20W wired PD and 15W Qi2 wireless fast charging.',
    description: 'The definitive pocket companion for power stability across Lagos. Engineered with heat-dissipating titanium casing and safety smart sensors. Snaps firmly onto MagSafe-compatible iPhones and Samsung Galaxy devices.',
    price: 46000,
    originalPrice: 52000,
    category: 'phones',
    images: [
      EDITORIAL_EVERYDAY_TECH,
      'https://images.unsplash.com/photo-1609081219090-a6d8173087ec?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.85,
    reviewCount: 94,
    inStock: true,
    stockCount: 22,
    sellerId: 'store_yaba_circuits',
    seller: MOCK_STORES[2],
    isMadeInNigeria: false,
    isEditorialPick: false,
    isTrending: true,
    deliverySpeed: 'lagos_sameday',
    specifications: [
      { label: 'Capacity', value: '10,000mAh / 38.5Wh' },
      { label: 'Wireless Output', value: '15W Fast Wireless' },
      { label: 'USB-C Output', value: '20W Power Delivery 3.0' },
      { label: 'Weight', value: '185g' }
    ],
    tags: ['electronics', 'phones', 'charger', 'magsafe', 'powerbank'],
    createdAt: '2026-01-28'
  },
  {
    id: 'prod_009',
    title: 'Nilotica Whipped Organic Shea Body Butter',
    slug: 'nilotica-whipped-shea-body-butter',
    shortDescription: 'Ultra-soft cold-whipped shea with unrefined baobab and frankincense essential oil.',
    description: 'Unlike standard firm shea butter, our wild Nilotica harvest melts on skin contact like silk. Deeply replenishes arid skin, protects against harmattan weather, and restores suppleness without greasy residue.',
    price: 18500,
    category: 'beauty',
    images: [
      EDITORIAL_BEAUTY_GLOW,
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.97,
    reviewCount: 112,
    inStock: true,
    stockCount: 30,
    sellerId: 'store_zaria_botanicals',
    seller: MOCK_STORES[3],
    isMadeInNigeria: true,
    isEditorialPick: true,
    isTrending: false,
    deliverySpeed: 'lagos_24h',
    specifications: [
      { label: 'Net Weight', value: '250ml Amber Glass Jar' },
      { label: 'Skin Type', value: 'Dry, sensitive, tropical climate' },
      { label: 'Scent', value: 'Subtle sweet earth & frankincense' }
    ],
    tags: ['beauty', 'skincare', 'shea', 'bodybutter', 'natural'],
    createdAt: '2026-02-12'
  },
  {
    id: 'prod_010',
    title: 'Structured Weekend Duffle in Saddle Brown',
    slug: 'structured-weekend-duffle-saddle-brown',
    shortDescription: 'Reinforced ballistic cotton canvas trimmed with heavyweight vegetable-tanned steerhide.',
    description: 'Designed for short business flights between Lagos and Abuja or coastal weekend retreats. Features a dedicated ventilated shoe compartment, padded 16-inch laptop pocket, and solid brass YKK luggage zippers.',
    price: 68000,
    originalPrice: 79000,
    category: 'bags',
    images: [
      EDITORIAL_MADE_IN_NIGERIA,
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.92,
    reviewCount: 56,
    inStock: true,
    stockCount: 11,
    sellerId: 'store_kano_atelier',
    seller: MOCK_STORES[4],
    isMadeInNigeria: true,
    isEditorialPick: false,
    isTrending: true,
    deliverySpeed: 'lagos_24h',
    specifications: [
      { label: 'Capacity', value: '42 Liters' },
      { label: 'Exterior', value: '18oz Waxed Canvas & Northern Steerhide' },
      { label: 'Laptop Sleeve', value: 'Fits up to 16" MacBook Pro' },
      { label: 'Dimensions', value: '52cm x 28cm x 26cm' }
    ],
    tags: ['travel', 'duffle', 'bags', 'luggage', 'leather'],
    createdAt: '2026-01-15'
  },
  {
    id: 'prod_011',
    title: 'Minimalist Mechanical Desk Keyboard (Linear Ivory)',
    slug: 'minimalist-mechanical-desk-keyboard',
    shortDescription: 'Solid CNC aluminum chassis with factory-lubed custom switches and sound dampening silicone.',
    description: 'Built for programmers, writers, and modern workspaces. 75% compact layout with hot-swappable switch sockets, seamless Bluetooth tri-mode connectivity, and an acoustic sound profile calibrated for quiet office environments.',
    price: 92000,
    originalPrice: 108000,
    category: 'electronics',
    images: [
      EDITORIAL_EVERYDAY_TECH,
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.86,
    reviewCount: 41,
    inStock: true,
    stockCount: 15,
    sellerId: 'store_yaba_circuits',
    seller: MOCK_STORES[2],
    isMadeInNigeria: false,
    isEditorialPick: false,
    isTrending: false,
    deliverySpeed: 'lagos_24h',
    specifications: [
      { label: 'Layout', value: '75% Compact (82 Keys)' },
      { label: 'Chassis', value: '6063 Anodized CNC Aluminum' },
      { label: 'Connectivity', value: 'Bluetooth 5.2 / 2.4GHz / USB-C' },
      { label: 'Battery', value: '4000mAh (Up to 200 hours)' }
    ],
    tags: ['keyboard', 'electronics', 'tech', 'desk', 'workspace'],
    createdAt: '2026-02-08'
  },
  {
    id: 'prod_012',
    title: 'Modern Adire Silk-Linen Wrap Kimono',
    slug: 'modern-adire-silk-linen-wrap-kimono',
    shortDescription: 'Contemporary Abeokuta indigo wax-resist dye pattern on a lightweight fluid silk-linen blend.',
    description: 'A striking statement piece that bridges historic Yoruba Adire textile heritage with fluid contemporary lounge tailoring. Versatile wrap silhouette with a wide waist sash and hidden side seam pockets.',
    price: 49500,
    category: 'fashion',
    images: [
      HERO_IMAGE,
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.95,
    reviewCount: 39,
    inStock: true,
    stockCount: 8,
    sellerId: 'store_urban_finds',
    seller: MOCK_STORES[0],
    isMadeInNigeria: true,
    isEditorialPick: true,
    isTrending: true,
    deliverySpeed: 'lagos_sameday',
    specifications: [
      { label: 'Composition', value: '60% French Linen, 40% Raw Mulberry Silk' },
      { label: 'Dyeing Technique', value: 'Traditional Abeokuta Indigo Resist Dye' },
      { label: 'Fit', value: 'One size fits EU 36-44' },
      { label: 'Care', value: 'Dry clean recommended' }
    ],
    tags: ['fashion', 'adire', 'kimono', 'traditional', 'artisan'],
    createdAt: '2026-02-14'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_01',
    productId: 'prod_001',
    authorName: 'Chiamaka Nnamdi',
    authorLocation: 'Victoria Island, Lagos',
    rating: 5,
    title: 'Surpassed luxury international brands',
    comment: 'The leather aroma and thickness are extraordinary. Ordered it at 11 AM from Urban Finds and it arrived at my office by 3 PM via MarketNest express. Outstanding craftsmanship.',
    verifiedPurchase: true,
    createdAt: '3 days ago'
  },
  {
    id: 'rev_02',
    productId: 'prod_001',
    authorName: 'Babajide Adeleke',
    authorLocation: 'Maitama, Abuja',
    rating: 5,
    title: 'Solid brass hardware and real full-grain hide',
    comment: 'Most Nigerian leather brands use cheap chrome-tanned skins. This one is genuinely vegetable tanned. Has aged beautifully over the last month.',
    verifiedPurchase: true,
    createdAt: '1 week ago'
  },
  {
    id: 'rev_03',
    productId: 'prod_002',
    authorName: 'Tunde Olatunji',
    authorLocation: 'Yaba, Lagos',
    rating: 5,
    title: 'Noise canceling blocks Lagos generator hum completely',
    comment: 'Working from home in Lagos requires serious ANC. These headphones silence everything. Verified Yaba Circuits seller delivered in genuine sealed packaging with warranty card.',
    verifiedPurchase: true,
    createdAt: '2 weeks ago'
  },
  {
    id: 'rev_04',
    productId: 'prod_003',
    authorName: 'Fatima Sanusi',
    authorLocation: 'Wuse II, Abuja',
    rating: 5,
    title: 'Immediate difference in skin texture',
    comment: 'The baobab serum absorbs in seconds and gives a natural dewy highlight without feeling heavy in humidity. Proud to support a verified northern beauty lab.',
    verifiedPurchase: true,
    createdAt: '5 days ago'
  }
];

export const EDITORIAL_COLLECTIONS = [
  {
    id: 'col_made_in_ng',
    title: 'Made in Nigeria',
    kicker: 'Artisanal Excellence',
    description: 'Exceptional master craftsmen producing heritage leather goods, hand-carved Iroko timber, and botanical skincare across our vibrant states.',
    image: EDITORIAL_MADE_IN_NIGERIA,
    filterKey: 'madeInNigeriaOnly',
    itemCount: 48
  },
  {
    id: 'col_everyday_tech',
    title: 'Everyday Essentials',
    kicker: 'Curated Workspace',
    description: 'High-performance audio, authentic workstation devices, and reliable power gear with verified local warranties and rapid Lagos dispatch.',
    image: EDITORIAL_EVERYDAY_TECH,
    filterKey: 'category',
    filterValue: 'electronics',
    itemCount: 65
  },
  {
    id: 'col_under_50k',
    title: 'Under ₦50,000',
    kicker: 'Accessible Quality',
    description: 'Exceptional everyday luxury finds without unnecessary retail markups. From full-grain accessories to single-origin pantry provisions.',
    image: EDITORIAL_BEAUTY_GLOW,
    filterKey: 'maxPrice',
    filterValue: 50000,
    itemCount: 82
  }
];
