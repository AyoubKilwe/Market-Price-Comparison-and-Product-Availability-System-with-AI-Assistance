const Product = require('../models/Product');
const { askGemini } = require('../services/geminiService');
const { getComparisonData } = require('./listingController');
const asyncHandler = require('../utils/asyncHandler');

const productAliases = {
  bariis: 'rice',
  bariiska: 'rice',
  rice: 'bariis',
  sonkor: 'sugar',
  sonkorta: 'sugar',
  sugar: 'sonkor',
  caano: 'milk',
  milk: 'caano',
  bur: 'flour',
  burka: 'flour',
  flour: 'bur',
  saliid: 'oil',
  saliida: 'oil',
  oil: 'saliid',
  baasto: 'pasta',
  pasta: 'baasto',
  biyo: 'water',
  water: 'biyo',
  hilib: 'meat',
  meat: 'hilib',
  sharaab: 'sharaab',
  sharaabka: 'sharaab',
};

const findProductsForQuestion = async (question, productId) => {
  if (productId) {
    const product = await Product.findOne({ _id: productId, status: 'Active' });
    return product ? [product] : [];
  }

  const products = await Product.find({ status: 'Active' }).limit(100);
  const normalizedQuestion = question.toLowerCase();
  const ignoredWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'price', 'prices', 'compare', 'cheapest',
    'highest', 'shop', 'shops', 'find', 'show', 'me', 'of', 'for', 'in',
    'waa', 'imisa', 'meeqa', 'qiimo', 'qiimaha', 'immisa', 'ka', 'ku', 'ee',
  ]);
  const rawQuestionWords = normalizedQuestion
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !ignoredWords.has(word));
  const questionWords = [...new Set(
    rawQuestionWords.flatMap((word) => [word, productAliases[word]].filter(Boolean))
  )];

  return products
    .map((product) => {
      const baseSearchable = `${product.name} ${product.category}`.toLowerCase();
      const productWords = baseSearchable.split(/[^a-z0-9]+/).filter(Boolean);
      const searchable = [
        baseSearchable,
        ...productWords.map((word) => productAliases[word]).filter(Boolean),
      ].join(' ');
      const score = questionWords.reduce(
        (total, word) => total + (searchable.includes(word) ? 1 : 0),
        normalizedQuestion.includes(product.name.toLowerCase()) ? 10 : 0
      );
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, 5)
    .map((entry) => entry.product);
};

const createDatabaseAnswer = (marketEyeData) => {
  const { product, listings, priceSummary } = marketEyeData;
  if (!listings.length) {
    return `${product.name} is in the MarketEye catalog, but approved shops have not published an active price yet.`;
  }

  const cheapest = listings.reduce((best, listing) =>
    listing.price < best.price ? listing : best
  );
  const highest = priceSummary.highest;
  const otherCount = listings.length - 1;
  const quantity = cheapest.unit ? ` for ${cheapest.unit}` : '';
  const availability = cheapest.stockStatus ? ` (${cheapest.stockStatus})` : '';

  return `${cheapest.shop?.shopName || 'A registered shop'} has the cheapest ${product.name} at $${cheapest.price.toFixed(2)}${quantity}${availability}. `
    + `The highest listed price is $${highest.toFixed(2)} across ${listings.length} shop${listings.length === 1 ? '' : 's'}`
    + `${otherCount ? '; see the comparison below for the other prices.' : '.'}`;
};

const ask = asyncHandler(async (req, res) => {
  const { question, productId } = req.body;
  const products = await findProductsForQuestion(question, productId);

  if (!products.length) {
    return res.status(200).json({
      answer: 'Product-kan hadda MarketEye kama heli karo. Fadlan hubi magaca product-ka ama isku day product kale.',
    });
  }

  const comparisons = (await Promise.all(products.map((product) => getComparisonData(product._id))))
    .filter(Boolean);
  if (!comparisons.length) {
    return res.status(200).json({
      answer: 'Product-kan hadda qiimo active ah kama hayno. Fadlan mar kale dib u hubi ama isku day product kale.',
    });
  }

  const formatComparison = (comparison) => ({
    product: comparison.product,
    priceSummary: comparison.summary,
    listings: comparison.listings.map((listing) => ({
      shop: listing.shop,
      price: listing.price,
      unit: listing.unit,
      stockStatus: listing.stockStatus,
    })),
  });

  if (comparisons.length > 1) {
    const matchedProducts = comparisons.map(formatComparison);
    const answer = matchedProducts.map(({ product, priceSummary, listings }) => {
      if (!listings.length) return `${product.name}: no active shop price yet.`;
      const cheapest = listings.reduce((best, listing) => listing.price < best.price ? listing : best);
      return `${product.name}: $${priceSummary.lowest.toFixed(2)} at ${cheapest.shop?.shopName || 'a registered shop'}${cheapest.unit ? ` / ${cheapest.unit}` : ''}.`;
    }).join('\n');

    return res.status(200).json({
      answer: `I found ${matchedProducts.length} matching products:\n${answer}`,
      data: { products: matchedProducts },
    });
  }

  const comparison = comparisons[0];

  const marketEyeData = formatComparison(comparison);

  let answer;
  try {
    answer = await askGemini({ question, marketEyeData });
  } catch (error) {
    console.warn(`Gemini fallback used: ${error.message}`);
    answer = createDatabaseAnswer(marketEyeData);
  }
  return res.status(200).json({ answer, data: marketEyeData });
});

module.exports = { ask, createDatabaseAnswer, findProductsForQuestion };
