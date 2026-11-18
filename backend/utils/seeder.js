const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'High-performance laptops, smartphones, smartwatches, and audio gear.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendsetting apparel, designer wear, jackets, and everyday comfort.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Home and Kitchen',
    slug: 'home-and-kitchen',
    description: 'Smart appliances, ergonomic cookware, and modern home essentials.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Organic skincare, revitalizing serums, fragrances, and wellness items.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Fitness equipment, athletic footwear, yoga mats, and outdoor gear.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Luxury watches, polarized sunglasses, leather bags, and daily carry items.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  }
];

const sampleProducts = [
  // 1. Electronics (6 products)
  {
    name: 'CloudPro UltraBook 15X',
    description: 'Next-gen 15.6" 4K OLED laptop powered by 16-core CPU, 32GB RAM, 1TB NVMe SSD, and 18-hour all-day battery life.',
    price: 1299.99,
    originalPrice: 1499.99,
    discount: 13,
    categoryName: 'Electronics',
    brand: 'CloudTech',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 24,
    rating: 4.9,
    numReviews: 48,
    isFeatured: true,
    isBestSeller: true,
    specifications: [
      { key: 'Screen', value: '15.6" 4K OLED' },
      { key: 'RAM', value: '32GB LPDDR5' },
      { key: 'Storage', value: '1TB NVMe SSD' },
      { key: 'Battery', value: 'Up to 18 Hours' }
    ]
  },
  {
    name: 'AcousticMax Active Noise-Cancelling Headphones',
    description: 'Immersive spatial audio headphones with 45dB hybrid ANC, 40-hour playback, multipoint Bluetooth 5.3, and ultra-soft memory foam cushions.',
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    categoryName: 'Electronics',
    brand: 'SonicCloud',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    rating: 4.8,
    numReviews: 112,
    isTrending: true,
    isBestSeller: true,
    specifications: [
      { key: 'Driver', value: '40mm Titanium' },
      { key: 'ANC', value: 'Hybrid 45dB' },
      { key: 'Battery', value: '40h with ANC on' }
    ]
  },
  {
    name: 'Veloce 5G Flagship Smartphone',
    description: '6.7-inch 120Hz AMOLED display, 200MP camera system with periscope optical zoom, Snapdragon 8 Gen 3, and 100W HyperCharge.',
    price: 899.99,
    originalPrice: 999.99,
    discount: 10,
    categoryName: 'Electronics',
    brand: 'Veloce Mobile',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    rating: 4.7,
    numReviews: 76,
    isFeatured: true,
    specifications: [
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'Camera', value: '200MP Triple Array' },
      { key: 'Charging', value: '100W TurboCharge' }
    ]
  },
  {
    name: 'PulseTrack Pro Smartwatch',
    description: 'Always-On Sapphire AMOLED display, ECG monitoring, SpO2 sensor, GPS route navigation, and 50m water resistance.',
    price: 179.99,
    originalPrice: 229.99,
    discount: 22,
    categoryName: 'Electronics',
    brand: 'FitSync',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    rating: 4.6,
    numReviews: 54,
    isNewArrival: true,
    specifications: [
      { key: 'Display', value: '1.43" AMOLED Sapphire' },
      { key: 'Sensors', value: 'ECG, PPG, SpO2, GPS' },
      { key: 'Waterproof', value: '5 ATM (50m)' }
    ]
  },
  {
    name: 'LumixView 4K Ultra Gaming Monitor 27"',
    description: '27-inch IPS UHD panel, 160Hz refresh rate, 1ms response time, HDR600, USB-C 90W PD, and AMD FreeSync Premium Pro.',
    price: 449.99,
    originalPrice: 529.99,
    discount: 15,
    categoryName: 'Electronics',
    brand: 'CloudTech',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    rating: 4.8,
    numReviews: 39,
    isFeatured: true,
    specifications: [
      { key: 'Resolution', value: '3840 x 2160 UHD' },
      { key: 'Refresh Rate', value: '160Hz' },
      { key: 'Color Gamut', value: '98% DCI-P3' }
    ]
  },
  {
    name: 'BassBlast Wireless Waterproof Speaker',
    description: '360-degree immersive sound with dual passive radiators, IPX7 waterproof rating, RGB lighting sync, and 24-hour party battery.',
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    categoryName: 'Electronics',
    brand: 'SonicCloud',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 55,
    rating: 4.5,
    numReviews: 88,
    isTrending: true,
    specifications: [
      { key: 'Output', value: '40W RMS' },
      { key: 'Battery', value: '24 Hours' },
      { key: 'Waterproof', value: 'IPX7 certified' }
    ]
  },

  // 2. Fashion (6 products)
  {
    name: 'Urban Luxe Wool Trench Coat',
    description: 'Tailored double-breasted coat made from 100% Australian Merino wool blend with water-repellent finish and premium horn buttons.',
    price: 189.99,
    originalPrice: 249.99,
    discount: 24,
    categoryName: 'Fashion',
    brand: 'Aura Tailored',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 22,
    rating: 4.7,
    numReviews: 42,
    isBestSeller: true,
    specifications: [
      { key: 'Material', value: 'Merino Wool Blend' },
      { key: 'Fit', value: 'Modern Tailored' },
      { key: 'Care', value: 'Dry Clean Only' }
    ]
  },
  {
    name: 'Nomad Heavyweight Oversized Hoodie',
    description: '500 GSM organic cotton brushed fleece hoodie with double-layered hood, hidden kangaroo pocket, and ribbed cuffs.',
    price: 69.99,
    originalPrice: 89.99,
    discount: 22,
    categoryName: 'Fashion',
    brand: 'Nomad Streetwear',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 60,
    rating: 4.9,
    numReviews: 95,
    isTrending: true,
    specifications: [
      { key: 'Fabric', value: '100% Organic Cotton 500 GSM' },
      { key: 'Fit', value: 'Relaxed Oversized' }
    ]
  },
  {
    name: 'AeroFlex Breathable Bomber Jacket',
    description: 'Lightweight windproof bomber jacket with ventilated mesh lining, utility sleeve pocket, and storm-resistant collar.',
    price: 99.99,
    originalPrice: 129.99,
    discount: 23,
    categoryName: 'Fashion',
    brand: 'Aura Tailored',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    rating: 4.6,
    numReviews: 31,
    isNewArrival: true,
    specifications: [
      { key: 'Material', value: 'Recycled Ripstop Nylon' },
      { key: 'Season', value: 'Spring / Autumn / Winter' }
    ]
  },
  {
    name: 'Elysian Silk Midi Wrap Dress',
    description: 'Flowing Mulberry silk wrap dress with hand-painted botanical prints, adjustable waist tie, and elegant flutter sleeves.',
    price: 139.99,
    originalPrice: 179.99,
    discount: 22,
    categoryName: 'Fashion',
    brand: 'Elysian Studio',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 19,
    rating: 4.8,
    numReviews: 29,
    isFeatured: true,
    specifications: [
      { key: 'Material', value: '100% Pure Mulberry Silk' },
      { key: 'Style', value: 'Midi Wrap' }
    ]
  },
  {
    name: 'Heritage Selvedge Denim Jeans',
    description: '14oz Japanese raw selvedge denim crafted on vintage shuttle looms. Features button fly, copper rivets, and leather brand patch.',
    price: 119.99,
    originalPrice: 149.99,
    discount: 20,
    categoryName: 'Fashion',
    brand: 'Nomad Streetwear',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    rating: 4.7,
    numReviews: 53,
    specifications: [
      { key: 'Denim', value: '14oz Japanese Selvedge' },
      { key: 'Cut', value: 'Slim Straight' }
    ]
  },
  {
    name: 'CloudPique Organic Cotton Polo',
    description: 'Silky pima cotton pique polo shirt with mother-of-pearl buttons and shape-retention collar band.',
    price: 44.99,
    originalPrice: 59.99,
    discount: 25,
    categoryName: 'Fashion',
    brand: 'Aura Tailored',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 75,
    rating: 4.5,
    numReviews: 40,
    specifications: [
      { key: 'Fabric', value: 'Peruvian Pima Cotton' },
      { key: 'Collar', value: 'Ribbed anti-curl' }
    ]
  },

  // 3. Home and Kitchen (5 products)
  {
    name: 'BaristaTouch Precision Espresso Maker',
    description: '15-bar Italian pump espresso machine with integrated conical burr grinder, micro-foam steam wand, and digital PID temperature control.',
    price: 499.99,
    originalPrice: 599.99,
    discount: 17,
    categoryName: 'Home and Kitchen',
    brand: 'CulinaryCraft',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 14,
    rating: 4.9,
    numReviews: 67,
    isFeatured: true,
    isBestSeller: true,
    specifications: [
      { key: 'Pressure', value: '15 Bar Italian Pump' },
      { key: 'Grinder', value: 'Conical Burr 30 Settings' },
      { key: 'Boiler', value: 'ThermoJet Fast Heat System' }
    ]
  },
  {
    name: 'AirCrisp Smart Digital Air Fryer 6L',
    description: '360° rapid cyclonic heat technology with 8 one-touch cooking presets, non-stick dishwasher-safe basket, and LED touchscreen.',
    price: 119.99,
    originalPrice: 149.99,
    discount: 20,
    categoryName: 'Home and Kitchen',
    brand: 'CulinaryCraft',
    images: [
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 28,
    rating: 4.8,
    numReviews: 120,
    isTrending: true,
    specifications: [
      { key: 'Capacity', value: '6 Liters (Family Size)' },
      { key: 'Power', value: '1800W' }
    ]
  },
  {
    name: 'Nordic Cast Iron Dutch Oven 5.5 Qt',
    description: 'Heavy enameled cast iron Dutch oven with self-basting lid spikes for moist, tender braises, stews, and sourdough bread baking.',
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    categoryName: 'Home and Kitchen',
    brand: 'CulinaryCraft',
    images: [
      'https://images.unsplash.com/photo-1584990347449-399a9a3ea3ec?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 32,
    rating: 4.8,
    numReviews: 45,
    specifications: [
      { key: 'Capacity', value: '5.5 Quarts' },
      { key: 'Heat Resistance', value: 'Oven-safe up to 500°F' }
    ]
  },
  {
    name: 'AromaZen Ultrasonic Essential Oil Diffuser',
    description: '500ml wood grain aroma diffuser with 7 ambient LED colors, silent ultrasonic misting, and auto shut-off safety.',
    price: 34.99,
    originalPrice: 49.99,
    discount: 30,
    categoryName: 'Home and Kitchen',
    brand: 'ZenLiving',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 65,
    rating: 4.6,
    numReviews: 78,
    isNewArrival: true,
    specifications: [
      { key: 'Tank Size', value: '500ml' },
      { key: 'Runtime', value: 'Up to 14 Hours' }
    ]
  },
  {
    name: 'PureGlow Minimalist Ceramic Table Lamp',
    description: 'Handcrafted ceramic base with natural textured linen drum shade, 3-way touch dimming, and warm 2700K vintage LED bulb.',
    price: 59.99,
    originalPrice: 79.99,
    discount: 25,
    categoryName: 'Home and Kitchen',
    brand: 'ZenLiving',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    rating: 4.7,
    numReviews: 34,
    specifications: [
      { key: 'Base', value: 'Handmade Matte Ceramic' },
      { key: 'Switch', value: '3-Way Touch Sensor' }
    ]
  },

  // 4. Beauty (5 products)
  {
    name: 'HydraGlow Hyaluronic Vitamin C Serum',
    description: 'Dermatologist-tested revitalizing facial serum with 15% pure Vitamin C, dual-weight Hyaluronic Acid, and Ferulic Acid for radiant glow.',
    price: 38.99,
    originalPrice: 48.99,
    discount: 20,
    categoryName: 'Beauty',
    brand: 'Botanica Luxe',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    rating: 4.9,
    numReviews: 134,
    isFeatured: true,
    isBestSeller: true,
    specifications: [
      { key: 'Size', value: '30ml / 1.0 fl oz' },
      { key: 'Key Actives', value: '15% Vitamin C + 2% HA + Ferulic Acid' }
    ]
  },
  {
    name: 'Midnight Recovery Botanical Facial Oil',
    description: 'Concentrated nighttime elixir with organic Rosehip, Jojoba, and Squalane to deeply nourish and restore cellular barrier overnight.',
    price: 45.99,
    originalPrice: 58.99,
    discount: 22,
    categoryName: 'Beauty',
    brand: 'Botanica Luxe',
    images: [
      'https://images.unsplash.com/photo-1608248597359-0a256a42a5a5?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    rating: 4.8,
    numReviews: 61,
    isTrending: true,
    specifications: [
      { key: 'Formula', value: 'Cold-pressed 100% Plant Oils' },
      { key: 'Skin Type', value: 'All skin types, non-comedogenic' }
    ]
  },
  {
    name: 'Velvet Rose Eau De Parfum 100ml',
    description: 'Sensual luxury fragrance blending Damask rose, smoked oud wood, spicy clove, and warm praline amber.',
    price: 89.99,
    originalPrice: 115.00,
    discount: 21,
    categoryName: 'Beauty',
    brand: 'Parfums De Cloud',
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 25,
    rating: 4.7,
    numReviews: 44,
    isFeatured: true,
    specifications: [
      { key: 'Concentration', value: 'Eau de Parfum (EDP)' },
      { key: 'Top Notes', value: 'Damask Rose, Mandarin' },
      { key: 'Base Notes', value: 'Oud, Amber, Praline' }
    ]
  },
  {
    name: 'Volumizing Peptide Collagen Hair Mask',
    description: 'Intense reconstructive hair treatment enriched with biomimetic keratin peptides, Argan oil, and Shea butter for silky strength.',
    price: 26.99,
    originalPrice: 34.99,
    discount: 23,
    categoryName: 'Beauty',
    brand: 'Botanica Luxe',
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 42,
    rating: 4.6,
    numReviews: 58,
    specifications: [
      { key: 'Size', value: '250ml' },
      { key: 'Benefit', value: 'Deep hydration & bond repair' }
    ]
  },
  {
    name: 'Rose Quartz Facial Roller & Gua Sha Set',
    description: 'Authentic 100% Brazilian rose quartz sculpting tools for facial lymphatic drainage, puffiness reduction, and skin tone contouring.',
    price: 21.99,
    originalPrice: 29.99,
    discount: 26,
    categoryName: 'Beauty',
    brand: 'Botanica Luxe',
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 60,
    rating: 4.7,
    numReviews: 89,
    isNewArrival: true,
    specifications: [
      { key: 'Stone', value: '100% Natural Rose Quartz' },
      { key: 'Includes', value: 'Dual-end Roller + Heart Gua Sha' }
    ]
  },

  // 5. Sports (5 products)
  {
    name: 'ApexPro Carbon Road Runner Shoes',
    description: 'Ultralight performance marathon running shoe with embedded full-length carbon fiber propulsion plate and super-critical foam midsole.',
    price: 159.99,
    originalPrice: 199.99,
    discount: 20,
    categoryName: 'Sports',
    brand: 'Apex Athletics',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    rating: 4.9,
    numReviews: 87,
    isFeatured: true,
    isBestSeller: true,
    specifications: [
      { key: 'Weight', value: '198 grams' },
      { key: 'Plate', value: 'Full Carbon Curve Plate' },
      { key: 'Drop', value: '8mm' }
    ]
  },
  {
    name: 'FlexCore Adjustable Dumbbell Set (5-52.5 lbs)',
    description: 'Space-saving rapid-dial adjustable dumbbells that replace 15 pairs of traditional weights with a turn of the ergonomic dial.',
    price: 299.99,
    originalPrice: 379.99,
    discount: 21,
    categoryName: 'Sports',
    brand: 'Apex Athletics',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 8,
    rating: 4.8,
    numReviews: 59,
    isTrending: true,
    specifications: [
      { key: 'Weight Range', value: '5 to 52.5 lbs each' },
      { key: 'Adjustment', value: 'Dial mechanism with safety lock' }
    ]
  },
  {
    name: 'Prana Non-Slip Eco Alignment Yoga Mat',
    description: '6mm premium natural tree rubber yoga mat with laser-etched body alignment guides and non-slip wet-grip polyurethane surface.',
    price: 49.99,
    originalPrice: 65.00,
    discount: 23,
    categoryName: 'Sports',
    brand: 'Prana Flow',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    rating: 4.8,
    numReviews: 73,
    isNewArrival: true,
    specifications: [
      { key: 'Material', value: 'Natural Tree Rubber + Eco PU' },
      { key: 'Thickness', value: '6mm Extra Cushion' }
    ]
  },
  {
    name: 'HydroShield Insulated Steel Sports Flask 1L',
    description: 'Double-wall vacuum insulated stainless steel water bottle with leakproof straw lid that keeps liquids cold for 36 hours.',
    price: 27.99,
    originalPrice: 35.99,
    discount: 22,
    categoryName: 'Sports',
    brand: 'Apex Athletics',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 85,
    rating: 4.7,
    numReviews: 110,
    specifications: [
      { key: 'Volume', value: '32oz / 1000ml' },
      { key: 'Insulation', value: '36h Cold / 18h Hot' }
    ]
  },
  {
    name: 'CrossFit Speed Jump Rope with Ball Bearings',
    description: 'Aircraft-grade 360-degree dual ball bearing jump rope with coated steel speed cable and knurled aluminum non-slip handles.',
    price: 18.99,
    originalPrice: 24.99,
    discount: 24,
    categoryName: 'Sports',
    brand: 'Apex Athletics',
    images: [
      'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 90,
    rating: 4.6,
    numReviews: 64,
    specifications: [
      { key: 'Bearings', value: 'High-speed 360° Steel' },
      { key: 'Cable', value: '3m Adjustable Steel Cable' }
    ]
  },

  // 6. Accessories (5 products)
  {
    name: 'Sovereign Automatic Sapphire Chronometer',
    description: 'Swiss-movement mechanical automatic timepiece featuring anti-reflective sapphire crystal, ceramic bezel, and 316L stainless steel bracelet.',
    price: 349.99,
    originalPrice: 449.99,
    discount: 22,
    categoryName: 'Accessories',
    brand: 'Chronos Heritage',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    rating: 4.9,
    numReviews: 48,
    isFeatured: true,
    isBestSeller: true,
    specifications: [
      { key: 'Movement', value: 'Automatic Self-Winding' },
      { key: 'Glass', value: 'Domed Sapphire Crystal' },
      { key: 'Water Resistance', value: '100m (10 ATM)' }
    ]
  },
  {
    name: 'AeroShade Polarized Titanium Aviators',
    description: 'Featherlight aerospace-grade titanium frame sunglasses with UV400 polarized mineral glass lenses and anti-scratch coating.',
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    categoryName: 'Accessories',
    brand: 'SolRay Eyewear',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    rating: 4.8,
    numReviews: 92,
    isTrending: true,
    specifications: [
      { key: 'Frame', value: 'Pure Beta-Titanium' },
      { key: 'Protection', value: '100% UV400 Polarized' }
    ]
  },
  {
    name: 'Artisan Full-Grain Leather Briefcase',
    description: 'Hand-stitched vegetable-tanned Italian leather commuter messenger with padded 16-inch laptop pocket, brass hardware, and shoulder strap.',
    price: 199.99,
    originalPrice: 259.99,
    discount: 23,
    categoryName: 'Accessories',
    brand: 'Artisan Craft',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    rating: 4.8,
    numReviews: 36,
    isFeatured: true,
    specifications: [
      { key: 'Leather', value: 'Full-Grain Italian Tuscan Cowhide' },
      { key: 'Fits', value: 'Laptops up to 16 inches' }
    ]
  },
  {
    name: 'Minimalist RFID Slim Carbon Wallet',
    description: 'RFID-blocking aviation aluminum and matte carbon fiber cardholder that holds 12 cards with integrated cash strap and quick card-fan ejector.',
    price: 32.99,
    originalPrice: 45.00,
    discount: 26,
    categoryName: 'Accessories',
    brand: 'Chronos Heritage',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 70,
    rating: 4.7,
    numReviews: 104,
    isNewArrival: true,
    specifications: [
      { key: 'Material', value: 'Real 3K Carbon Fiber' },
      { key: 'Protection', value: 'RFID / NFC Blocking' }
    ]
  },
  {
    name: 'Voyager Tech Organizer Travel Pouch',
    description: 'Weatherproof ballistic nylon cable and accessory dopp kit with elastic loops, mesh zipper pockets, and water-sealed YKK zippers.',
    price: 29.99,
    originalPrice: 39.99,
    discount: 25,
    categoryName: 'Accessories',
    brand: 'Artisan Craft',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 65,
    rating: 4.6,
    numReviews: 49,
    specifications: [
      { key: 'Fabric', value: '1680D Cordura Ballistic Nylon' },
      { key: 'Zippers', value: 'YKK Aquaguard' }
    ]
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing old records...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('[Seeder] Creating admin and customer users...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cloudcart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const customerEmail = process.env.DEMO_CUSTOMER_EMAIL || 'customer@cloudcart.com';
    const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || 'Customer@123';

    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'CloudCart Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '+1 (555) 019-2834',
      addresses: [
        {
          fullName: 'CloudCart Admin',
          phone: '+1 (555) 019-2834',
          street: '100 Silicon Way, Tech Park',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94105',
          country: 'United States',
          isDefault: true
        }
      ]
    });

    const demoCustomer = await User.create({
      name: 'Alex Johnson',
      email: customerEmail,
      password: customerPassword,
      role: 'customer',
      phone: '+1 (555) 345-6789',
      addresses: [
        {
          fullName: 'Alex Johnson',
          phone: '+1 (555) 345-6789',
          street: '42 Market Street, Apt 4B',
          city: 'New York',
          state: 'New York',
          postalCode: '10001',
          country: 'United States',
          isDefault: true
        }
      ]
    });

    console.log('[Seeder] Seeding categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('[Seeder] Seeding 32 realistic products...');
    const productDocs = sampleProducts.map(prod => ({
      ...prod,
      slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: categoryMap[prod.categoryName]
    }));

    const insertedProducts = await Product.insertMany(productDocs);

    // Initialize carts & wishlists for demo accounts
    await Cart.create({ user: adminUser._id, items: [] });
    await Cart.create({
      user: demoCustomer._id,
      items: [
        {
          product: insertedProducts[0]._id,
          quantity: 1,
          price: insertedProducts[0].price
        }
      ]
    });

    await Wishlist.create({ user: adminUser._id, products: [] });
    await Wishlist.create({
      user: demoCustomer._id,
      products: [insertedProducts[1]._id, insertedProducts[2]._id]
    });

    console.log('[Seeder] Creating sample customer reviews...');
    await Review.create({
      user: demoCustomer._id,
      userName: demoCustomer.name,
      product: insertedProducts[0]._id,
      rating: 5,
      comment: 'Absolutely blown away by the speed and screen quality. Battery life easily lasts my entire workday.'
    });

    await Review.create({
      user: demoCustomer._id,
      userName: demoCustomer.name,
      product: insertedProducts[1]._id,
      rating: 5,
      comment: 'Active noise cancellation blocks out all office hum. Very comfortable for long sessions.'
    });

    console.log('[Seeder] Creating realistic initial orders for analytics...');
    const initialOrders = [
      {
        user: demoCustomer._id,
        items: [
          {
            product: insertedProducts[0]._id,
            name: insertedProducts[0].name,
            image: insertedProducts[0].images[0],
            price: insertedProducts[0].price,
            quantity: 1
          }
        ],
        shippingAddress: demoCustomer.addresses[0],
        paymentMethod: 'Simulated Card',
        paymentStatus: 'Completed',
        orderStatus: 'Delivered',
        itemsPrice: insertedProducts[0].price,
        shippingPrice: 0,
        discountPrice: 0,
        totalAmount: insertedProducts[0].price,
        isPaid: true,
        paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        statusTimeline: [
          { status: 'Confirmed', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
          { status: 'Processing', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { status: 'Shipped', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
          { status: 'Delivered', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        user: demoCustomer._id,
        items: [
          {
            product: insertedProducts[1]._id,
            name: insertedProducts[1].name,
            image: insertedProducts[1].images[0],
            price: insertedProducts[1].price,
            quantity: 1
          },
          {
            product: insertedProducts[5]._id,
            name: insertedProducts[5].name,
            image: insertedProducts[5].images[0],
            price: insertedProducts[5].price,
            quantity: 2
          }
        ],
        shippingAddress: demoCustomer.addresses[0],
        paymentMethod: 'Simulated UPI',
        paymentStatus: 'Completed',
        orderStatus: 'Shipped',
        itemsPrice: insertedProducts[1].price + insertedProducts[5].price * 2,
        shippingPrice: 0,
        discountPrice: 0,
        totalAmount: insertedProducts[1].price + insertedProducts[5].price * 2,
        isPaid: true,
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        statusTimeline: [
          { status: 'Confirmed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'Processing', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'Shipped', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        user: demoCustomer._id,
        items: [
          {
            product: insertedProducts[3]._id,
            name: insertedProducts[3].name,
            image: insertedProducts[3].images[0],
            price: insertedProducts[3].price,
            quantity: 1
          }
        ],
        shippingAddress: demoCustomer.addresses[0],
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        itemsPrice: insertedProducts[3].price,
        shippingPrice: 0,
        discountPrice: 0,
        totalAmount: insertedProducts[3].price,
        statusTimeline: [
          { status: 'Pending', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          { status: 'Confirmed', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
          { status: 'Processing', timestamp: new Date() }
        ]
      }
    ];

    await Order.insertMany(initialOrders);

    console.log('----------------------------------------------------');
    console.log('✅ CloudCart Database successfully seeded!');
    console.log(`📁 Categories created: ${createdCategories.length}`);
    console.log(`📦 Products created:   ${insertedProducts.length}`);
    console.log('👤 Demo Accounts:');
    console.log('   Admin:    admin@cloudcart.com    / Admin@123');
    console.log('   Customer: customer@cloudcart.com / Customer@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Destroy data
  connectDB().then(async () => {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    console.log('Data destroyed!');
    process.exit(0);
  });
} else {
  seedData();
}
