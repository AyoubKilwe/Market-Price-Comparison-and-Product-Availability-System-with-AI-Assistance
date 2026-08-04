const Product = require('../models/Product');
const { askGemini } = require('../services/geminiService');
const { getComparisonData } = require('./listingController');
const asyncHandler = require('../utils/asyncHandler');

const findProductForQuestion = async (question, productId) => {
  if (productId) return Product.findOne({ _id: productId, status: 'Active' });

  const products = await Product.find({ status: 'Active' }).limit(100);
  const normalizedQuestion = question.toLowerCase();
  return products.find((product) => {
    const nameAndUnit = `${product.name} ${product.unit}`.toLowerCase();
    return normalizedQuestion.includes(nameAndUnit) || normalizedQuestion.includes(product.name.toLowerCase());
  });
};

const ask = asyncHandler(async (req, res) => {
  const { question, productId } = req.body;
  const product = await findProductForQuestion(question, productId);

  if (!product) {
    return res.status(200).json({
      answer: 'MarketEye does not currently have matching product information for that question.',
    });
  }

  const comparison = await getComparisonData(product._id);
  if (!comparison) {
    return res.status(200).json({
      answer: 'MarketEye does not currently have active information for that product.',
    });
  }

  const marketEyeData = {
    product: comparison.product,
    priceSummary: comparison.summary,
    listings: comparison.listings.map((listing) => ({
      shop: listing.shop,
      price: listing.price,
      stockStatus: listing.stockStatus,
    })),
  };

  const answer = await askGemini({ question, marketEyeData });
  return res.status(200).json({ answer, data: marketEyeData });
});

module.exports = { ask };
