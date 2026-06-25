import Product from '../models/Product.js';

const getProducts = async (req, res) => {
  try {
    // --- Step 1: Parse query parameters ---
    const { cursor, snapshotTime, category } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    // --- Step 2: Determine or reuse the snapshot timestamp ---
  
    let snapshot;
    if (snapshotTime) {
      snapshot = new Date(snapshotTime);
    } else {
      snapshot = new Date();
    }

    // --- Step 3: Build the query filter ---
    const filter = {
      
      updatedAt: { $lte: snapshot },
    };

   
    if (category) {
      filter.category = category;
    }

    // --- Step 4: Apply cursor for pagination ---
    if (cursor) {
      // Decode the cursor — it contains the last seen (updatedAt, _id) pair
      const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
      const cursorUpdatedAt = new Date(decoded.updatedAt);
      const cursorId = decoded._id;

     
      filter.$or = [
        { updatedAt: { $lt: cursorUpdatedAt } },
        {
          updatedAt: cursorUpdatedAt,
          _id: { $lt: cursorId },
        },
      ];

      // Also keep the snapshot filter on updatedAt
      // Since we already have updatedAt in $or conditions and both branches
      // ensure updatedAt <= cursorUpdatedAt <= snapshotTime, the snapshot
      // filter is inherently satisfied. But we keep it for safety.
      delete filter.updatedAt;
      filter.$and = [
        { updatedAt: { $lte: snapshot } },
        {
          $or: [
            { updatedAt: { $lt: cursorUpdatedAt } },
            {
              updatedAt: cursorUpdatedAt,
              _id: { $lt: cursorId },
            },
          ],
        },
      ];

      // Remove the $or we set above since it's now inside $and
      delete filter.$or;
    }

    // --- Step 5: Execute the query ---
    // We fetch limit + 1 to check if there are more pages
    const products = await Product.find(filter)
      .sort({ updatedAt: -1, _id: -1 }) // Newest first, _id as tiebreaker
      .limit(limit + 1)
      .lean(); // .lean() returns plain JS objects (faster, less memory)

    // --- Step 6: Determine if there are more products ---
    const hasMore = products.length > limit;

    // Remove the extra document if it exists
    if (hasMore) {
      products.pop();
    }

    // --- Step 7: Generate the next cursor ---
    let nextCursor = null;
    if (hasMore && products.length > 0) {
      const lastProduct = products[products.length - 1];
      // Encode the cursor as a Base64 string containing the last product's
      // sort values. The client will send this back for the next page.
      nextCursor = Buffer.from(
        JSON.stringify({
          updatedAt: lastProduct.updatedAt.toISOString(),
          _id: lastProduct._id,
        })
      ).toString('base64');
    }

    // --- Step 8: Send the response ---
    res.json({
      products,
      nextCursor,
      hasMore,
      // Always return the snapshotTime so the client can send it back
      snapshotTime: snapshot.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

export default getProducts;
