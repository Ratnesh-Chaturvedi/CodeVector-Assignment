

import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from "dotenv";
import dns from 'dns';
 dns.setServers(["1.1.1.1", "8.8.8.8"]);

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

console.log(process.env.MONGODB_URI);
// Categories for our products
const CATEGORIES = ['Electronics', 'Books', 'Fashion', 'Sports', 'Home', 'Beauty', 'Toys'];

// Sample product name prefixes and suffixes for realistic names
const PREFIXES = [
  'Premium', 'Deluxe', 'Essential', 'Pro', 'Ultra', 'Classic', 'Modern',
  'Smart', 'Eco', 'Compact', 'Advanced', 'Basic', 'Elite', 'Super', 'Mini',
  'Max', 'Mega', 'Nano', 'Turbo', 'Flex'
];

const PRODUCT_NAMES = {
  Electronics: ['Headphones', 'Speaker', 'Charger', 'Cable', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'Microphone', 'Hub', 'Adapter', 'Earbuds', 'Tablet', 'Smartwatch', 'Router'],
  Books: ['Novel', 'Guide', 'Cookbook', 'Textbook', 'Journal', 'Planner', 'Workbook', 'Manual', 'Encyclopedia', 'Anthology', 'Memoir', 'Biography', 'Almanac', 'Atlas', 'Dictionary'],
  Fashion: ['T-Shirt', 'Jacket', 'Sneakers', 'Hat', 'Scarf', 'Belt', 'Sunglasses', 'Watch', 'Backpack', 'Wallet', 'Hoodie', 'Jeans', 'Dress', 'Boots', 'Gloves'],
  Sports: ['Ball', 'Racket', 'Gloves', 'Mat', 'Dumbbells', 'Jump Rope', 'Resistance Band', 'Water Bottle', 'Helmet', 'Shin Guards', 'Goggles', 'Knee Pad', 'Grip Tape', 'Whistle', 'Stopwatch'],
  Home: ['Lamp', 'Cushion', 'Vase', 'Candle', 'Frame', 'Rug', 'Clock', 'Mirror', 'Shelf', 'Curtain', 'Blanket', 'Towel Set', 'Organizer', 'Plant Pot', 'Coaster Set'],
  Beauty: ['Moisturizer', 'Serum', 'Lipstick', 'Foundation', 'Brush Set', 'Perfume', 'Face Mask', 'Nail Polish', 'Eye Cream', 'Cleanser', 'Toner', 'Sunscreen', 'Hair Oil', 'Body Wash', 'Hand Cream'],
  Toys: ['Puzzle', 'Building Blocks', 'Action Figure', 'Board Game', 'Stuffed Animal', 'RC Car', 'Doll', 'Card Game', 'Yo-Yo', 'Frisbee', 'Kite', 'Bubble Kit', 'Play-Doh Set', 'Toy Train', 'Rubik Cube'],
};

/**
 * Generate a single random product
 */



function generateProduct(index) {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const names = PRODUCT_NAMES[category];
  const productName = names[Math.floor(Math.random() * names.length)];

  // Random price between $1.99 and $999.99
  const price = parseFloat((Math.random() * 998 + 1.99).toFixed(2));

  // Spread timestamps across the past 365 days for realistic data
  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const randomTimestamp = new Date(oneYearAgo + Math.random() * (now - oneYearAgo));

  return {
    name: `${prefix} ${productName} ${index + 1}`,
    category,
    price,
    createdAt: randomTimestamp,
    updatedAt: randomTimestamp,
  };
}


async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log('Connected to DB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const TOTAL_PRODUCTS = 200000;
    const BATCH_SIZE = 5000;
    const totalBatches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);

    console.log(`Seeding ${TOTAL_PRODUCTS.toLocaleString()} products in ${totalBatches} batches of ${BATCH_SIZE.toLocaleString()}...`);
    console.log('');

    const startTime = Date.now();

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchStart = batch * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_PRODUCTS);
      const batchSize = batchEnd - batchStart;

      // Generate batch of products
      const products = [];
      for (let i = batchStart; i < batchEnd; i++) {
        products.push(generateProduct(i));
      }

      // Insert batch using insertMany() — much faster than individual inserts
      await Product.insertMany(products);

      // Progress logging
      const progress = ((batchEnd / TOTAL_PRODUCTS) * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `  Batch ${batch + 1}/${totalBatches} | ` +
        `${batchEnd.toLocaleString()}/${TOTAL_PRODUCTS.toLocaleString()} products | ` +
        `${progress}% | ${elapsed}s elapsed`
      );
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('');
    console.log(`Seeding complete! ${TOTAL_PRODUCTS.toLocaleString()} products inserted in ${totalTime}s`);

    // Verify count
    const count = await Product.countDocuments();
    console.log(`Verification: ${count.toLocaleString()} products in database`);

    // Show category distribution
    console.log('');
    console.log('Category distribution:');
    for (const cat of CATEGORIES) {
      const catCount = await Product.countDocuments({ category: cat });
      console.log(`  ${cat}: ${catCount.toLocaleString()}`);
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('');
    console.log('Disconnected from MongoDB');
  }
}

seedProducts();
