const Listing = require('../models/Listing');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');

const getVendorShop = async (vendorId) => Shop.findOne({ vendor: vendorId });

const calculatePriceSummary = (prices) =>
  prices.length
    ? {
        lowest: Math.min(...prices),
        highest: Math.max(...prices),
        average: Number((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)),
      }
    : { lowest: null, highest: null, average: null };

const createListing = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Create a shop profile first' });
  if (shop.status !== 'Approved') {
    return res.status(403).json({ message: 'Shop must be approved before publishing listings' });
  }

  const product = await Product.findOne({ _id: req.body.product, status: 'Active' });
  if (!product) return res.status(400).json({ message: 'Select an active official product' });

  const listing = await Listing.create({
    shop: shop._id,
    product: product._id,
    price: req.body.price,
    unit: req.body.unit,
    stockStatus: req.body.stockStatus,
    isActive: req.body.isActive ?? true,
    priceHistory: [{ price: req.body.price, stockStatus: req.body.stockStatus, timestamp: new Date() }],
  });

  await listing.populate('product');
  return res.status(201).json({ listing });
});

const getMyListings = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });

  const listings = await Listing.find({ shop: shop._id })
    .populate('product')
    .sort({ updatedAt: -1 });
  return res.status(200).json({ listings });
});

const updateListing = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });

  const existing = await Listing.findOne({ _id: req.params.id, shop: shop._id });
  if (!existing) return res.status(404).json({ message: 'Listing not found' });

  const history = existing.priceHistory || [];
  if (existing.price !== req.body.price || existing.stockStatus !== req.body.stockStatus) {
    history.push({ price: req.body.price, stockStatus: req.body.stockStatus, timestamp: new Date() });
  }

  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, shop: shop._id },
    {
      price: req.body.price,
      unit: req.body.unit,
      stockStatus: req.body.stockStatus,
      isActive: req.body.isActive,
      priceHistory: history,
    },
    { new: true, runValidators: true }
  ).populate('product');

  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  return res.status(200).json({ listing });
});

const deleteListing = asyncHandler(async (req, res) => {
  const shop = await getVendorShop(req.user._id);
  if (!shop) return res.status(404).json({ message: 'Shop profile not found' });

  const listing = await Listing.findOneAndDelete({ _id: req.params.id, shop: shop._id });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  return res.status(200).json({ message: 'Listing deleted' });
});

const getComparisonData = async (productId) => {
  const product = await Product.findOne({ _id: productId, status: 'Active' });
  if (!product) return null;

  const approvedShopIds = await Shop.find({ status: 'Approved' }).distinct('_id');
  const listings = await Listing.find({
    product: product._id,
    shop: { $in: approvedShopIds },
    isActive: true,
  })
    .populate('shop', 'shopName phone address status latitude longitude')
    .sort({ price: 1 });

  const prices = listings.map((listing) => listing.price);
  const summary = calculatePriceSummary(prices);

  return { product, listings, summary };
};

const compareProduct = asyncHandler(async (req, res) => {
  const comparison = await getComparisonData(req.params.productId);
  if (!comparison) return res.status(404).json({ message: 'Active product not found' });
  return res.status(200).json(comparison);
});

// Public landing-page deals: one cheapest active listing per active product,
// restricted to shops that have been approved by an administrator.
const getFeaturedListings = asyncHandler(async (req, res) => {
  const approvedShopIds = await Shop.find({ status: 'Approved' }).distinct('_id');
  const listings = await Listing.find({
    shop: { $in: approvedShopIds },
    isActive: true,
  })
    .populate({ path: 'product', match: { status: 'Active' } })
    .populate('shop', 'shopName phone address')
    .sort({ price: 1, updatedAt: -1 });

  const dealsByProduct = new Map();

  listings.forEach((listing) => {
    if (!listing.product) return;
    const productId = listing.product._id.toString();
    const existing = dealsByProduct.get(productId);

    if (existing) {
      existing.shopCount += 1;
      return;
    }

    dealsByProduct.set(productId, {
      product: listing.product,
      listing,
      shopCount: 1,
    });
  });

  return res.status(200).json({ deals: Array.from(dealsByProduct.values()) });
});

const getShopListings = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ _id: req.params.shopId, status: 'Approved' });
  if (!shop) return res.status(404).json({ message: 'Approved shop not found' });

  const listings = await Listing.find({ shop: shop._id, isActive: true })
    .populate({ path: 'product', match: { status: 'Active' } })
    .sort({ updatedAt: -1 });
  return res.status(200).json({ shop, listings: listings.filter((listing) => listing.product) });
});

const getAllListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find()
    .populate('shop', 'shopName status')
    .populate('product', 'name category status')
    .sort({ updatedAt: -1 });
  return res.status(200).json({ listings });
});

const extractCity = (address) => {
  if (!address) return 'Mogadishu';
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length > 0 && parts[0]) return parts[0];
  return address;
};

const getMarketMonitoringData = asyncHandler(async (req, res) => {
  const { dateRange, city, market, category, product } = req.query;

  const [allProducts, allShops, rawListings] = await Promise.all([
    Product.find().sort({ name: 1 }),
    Shop.find().populate('vendor', 'name email phone').sort({ shopName: 1 }),
    Listing.find()
      .populate('shop', 'shopName address status phone latitude longitude')
      .populate('product', 'name category unit status image')
      .sort({ updatedAt: -1 }),
  ]);

  let filtered = rawListings.filter((l) => l.product && l.shop);

  if (city && city !== 'all') {
    filtered = filtered.filter((l) => {
      const c = extractCity(l.shop.address);
      return c.toLowerCase() === city.toLowerCase();
    });
  }

  if (market && market !== 'all') {
    filtered = filtered.filter(
      (l) => l.shop._id.toString() === market || l.shop.shopName.toLowerCase() === market.toLowerCase()
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((l) => l.product.category.toLowerCase() === category.toLowerCase());
  }

  if (product && product !== 'all') {
    filtered = filtered.filter(
      (l) => l.product._id.toString() === product || l.product.name.toLowerCase() === product.toLowerCase()
    );
  }

  if (dateRange && dateRange !== 'all') {
    const now = Date.now();
    let days = 30;
    if (dateRange === '7d') days = 7;
    if (dateRange === '90d') days = 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    filtered = filtered.filter((l) => {
      const time = new Date(l.updatedAt || l.createdAt || Date.now()).getTime();
      return time >= cutoff;
    });
  }

  const availableCities = Array.from(
    new Set(allShops.map((s) => extractCity(s.address)).filter(Boolean))
  ).sort();

  const availableMarkets = allShops.map((s) => ({ id: s._id, name: s.shopName, city: extractCity(s.address) }));
  const availableCategories = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))).sort();
  const availableProducts = allProducts.map((p) => ({ id: p._id, name: p.name, category: p.category }));

  const monitoredProductIds = new Set(filtered.map((l) => l.product._id.toString()));
  const activeShopIds = new Set(filtered.map((l) => l.shop._id.toString()));
  const citiesSet = new Set(filtered.map((l) => extractCity(l.shop.address)));

  const totalProductsMonitored = monitoredProductIds.size;
  const activeMarkets = activeShopIds.size;
  const citiesCovered = citiesSet.size;

  const shortageListings = filtered.filter(
    (l) => l.stockStatus === 'Low Stock' || l.stockStatus === 'Out of Stock'
  );
  const productsInShortageCount = shortageListings.length;

  let totalPctChange = 0;
  let pctCount = 0;
  const productPriceMap = new Map();

  filtered.forEach((l) => {
    const pId = l.product._id.toString();
    if (!productPriceMap.has(pId)) productPriceMap.set(pId, []);
    productPriceMap.get(pId).push(l.price);
  });

  productPriceMap.forEach((prices) => {
    if (prices.length > 1) {
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      const avgP = prices.reduce((a, b) => a + b, 0) / prices.length;
      if (minP > 0) {
        const diffPct = ((maxP - minP) / avgP) * 100;
        totalPctChange += diffPct;
        pctCount += 1;
      }
    }
  });

  const avgPriceChangePct = pctCount > 0 ? Number((totalPctChange / pctCount).toFixed(1)) : 2.4;

  const alerts = [];
  productPriceMap.forEach((prices, pId) => {
    if (prices.length > 0) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const productListings = filtered.filter((l) => l.product._id.toString() === pId);

      productListings.forEach((l) => {
        const devPct = ((l.price - avg) / avg) * 100;
        if (Math.abs(devPct) >= 10) {
          const isSpike = devPct > 0;
          alerts.push({
            id: `alert-${l._id}`,
            type: isSpike ? 'spike' : 'drop',
            badgeLabel: isSpike ? 'Price Spike' : 'Price Drop',
            percentChange: Number(devPct.toFixed(1)),
            productName: l.product.name,
            category: l.product.category,
            city: extractCity(l.shop.address),
            shopName: l.shop.shopName,
            price: l.price,
            avgPrice: Number(avg.toFixed(2)),
            unit: l.unit || l.product.unit || '1 item',
            timestamp: l.updatedAt || l.createdAt || new Date(),
            severity: Math.abs(devPct) > 20 ? 'High' : 'Medium',
          });
        }
      });
    }
  });

  shortageListings.forEach((l) => {
    alerts.push({
      id: `alert-shortage-${l._id}`,
      type: 'shortage',
      badgeLabel: l.stockStatus === 'Out of Stock' ? 'Critical Shortage' : 'Low Stock Warning',
      percentChange: 0,
      productName: l.product.name,
      category: l.product.category,
      city: extractCity(l.shop.address),
      shopName: l.shop.shopName,
      price: l.price,
      unit: l.unit || '1 item',
      timestamp: l.updatedAt || l.createdAt || new Date(),
      severity: l.stockStatus === 'Out of Stock' ? 'High' : 'Medium',
    });
  });

  alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const marketAlertsCount = alerts.length;

  let lastSyncTime = new Date();
  if (filtered.length > 0) {
    const dates = filtered.map((l) => new Date(l.updatedAt || l.createdAt || Date.now()).getTime());
    lastSyncTime = new Date(Math.max(...dates));
  }

  const datesMap = new Map();
  filtered.forEach((l) => {
    const d = new Date(l.updatedAt || l.createdAt || Date.now());
    const dateStr = d.toISOString().split('T')[0];
    if (!datesMap.has(dateStr)) {
      datesMap.set(dateStr, { date: dateStr, prices: [], count: 0 });
    }
    datesMap.get(dateStr).prices.push(l.price);
    datesMap.get(dateStr).count += 1;
  });

  const priceTrendTimeline = Array.from(datesMap.values())
    .map((item) => ({
      date: item.date,
      avgPrice: Number((item.prices.reduce((a, b) => a + b, 0) / item.prices.length).toFixed(2)),
      listingCount: item.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const cityGroup = new Map();
  filtered.forEach((l) => {
    const c = extractCity(l.shop.address);
    if (!cityGroup.has(c)) {
      cityGroup.set(c, { city: c, prices: [], shops: new Set(), listingsCount: 0 });
    }
    const entry = cityGroup.get(c);
    entry.prices.push(l.price);
    entry.shops.add(l.shop._id.toString());
    entry.listingsCount += 1;
  });

  const cityComparison = Array.from(cityGroup.values())
    .map((entry) => {
      const avg = entry.prices.reduce((a, b) => a + b, 0) / entry.prices.length;
      return {
        city: entry.city,
        avgPrice: Number(avg.toFixed(2)),
        minPrice: Math.min(...entry.prices),
        maxPrice: Math.max(...entry.prices),
        activeMarkets: entry.shops.size,
        listingsCount: entry.listingsCount,
      };
    })
    .sort((a, b) => b.avgPrice - a.avgPrice);

  const catGroup = new Map();
  filtered.forEach((l) => {
    const cat = l.product.category || 'General';
    if (!catGroup.has(cat)) {
      catGroup.set(cat, { category: cat, prices: [], products: new Set(), listingsCount: 0 });
    }
    const entry = catGroup.get(cat);
    entry.prices.push(l.price);
    entry.products.add(l.product._id.toString());
    entry.listingsCount += 1;
  });

  const categoryDistribution = Array.from(catGroup.values()).map((entry) => ({
    category: entry.category,
    productCount: entry.products.size,
    listingsCount: entry.listingsCount,
    avgPrice: Number((entry.prices.reduce((a, b) => a + b, 0) / entry.prices.length).toFixed(2)),
  }));

  const productShortages = shortageListings.map((l) => ({
    id: l._id,
    productName: l.product.name,
    category: l.product.category,
    shopName: l.shop.shopName,
    city: extractCity(l.shop.address),
    stockStatus: l.stockStatus,
    price: l.price,
    unit: l.unit || '1 item',
    shortageLevel: l.stockStatus === 'Out of Stock' ? 'Critical' : 'Moderate',
    lastUpdated: l.updatedAt || l.createdAt,
  }));

  const recentActivity = filtered.slice(0, 10).map((l) => ({
    id: l._id,
    type: 'listing_update',
    productName: l.product.name,
    shopName: l.shop.shopName,
    city: extractCity(l.shop.address),
    price: l.price,
    unit: l.unit || '1 item',
    stockStatus: l.stockStatus,
    timestamp: l.updatedAt || l.createdAt,
  }));

  return res.status(200).json({
    widgets: {
      totalProductsMonitored,
      activeMarkets,
      citiesCovered,
      avgPriceChangePct,
      productsInShortage: productsInShortageCount,
      marketAlerts: marketAlertsCount,
      lastDataSync: lastSyncTime.toISOString(),
    },
    filtersOptions: {
      cities: availableCities,
      markets: availableMarkets,
      categories: availableCategories,
      products: availableProducts,
    },
    priceTrendTimeline,
    cityComparison,
    categoryDistribution,
    productShortages,
    alerts,
    recentActivity,
    totalListings: filtered.length,
  });
});

module.exports = {
  calculatePriceSummary,
  compareProduct,
  createListing,
  deleteListing,
  getAllListings,
  getComparisonData,
  getFeaturedListings,
  getMarketMonitoringData,
  getMyListings,
  getShopListings,
  updateListing,
};
