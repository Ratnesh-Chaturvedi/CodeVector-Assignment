# Product Browsing System (MERN Stack)

A high-performance MERN Stack application demonstrating **cursor-based pagination** and **snapshot consistency** for browsing a database of 200,000+ products. 

Designed to show how database indexing, bulk data generation, and modern API pagination strategies solve real-world scale and consistency challenges.

---

## Technical Architecture Overview

At scale (thousands of requests/sec or millions of rows), traditional offset-based pagination (`skip/limit`) degrades database performance to O(N) and causes unstable UI experiences due to concurrent data writes. 

This project solves this using:
1. **Cursor-Based Pagination** using compound keys (`updatedAt` and `_id`) for O(1) performance.
2. **Snapshot-Based Time Locking** (`snapshotTime`) to ensure readers see consistent lists even as new products are added or updated in the background.
3. **Compound Indexes** to eliminate in-memory sorting and allow the database to query directly from memory-aligned B-trees.

---

## Setup & Running the Application

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* A MongoDB Atlas Database (or a local MongoDB instance running on port 27017)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Open the `.env` file:
   Modify the `MONGODB_URI` with your MongoDB connection string (e.g., MongoDB Atlas or local MongoDB instance):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/productDB?retryWrites=true&w=majority
   PORT=5000
   ```
4. Run the seed script to generate **200,000 products**:
   ```bash
   npm run seed
   ```
   *(This script uses batch insertion to seed the database in ~10–15 seconds.)*
5. Start the backend developer server:
   ```bash
   npm run dev
   ```
   The backend API will be running at `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local address (typically `http://localhost:3000`).

---

## Project Structure

```
.
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── config/
│   │   └── db.js                 # MongoDB connection & configurations
│   ├── models/
│   │   └── Product.js            # Mongoose Schema & Compound Indexes
│   ├── routes/
│   │   └── productRoutes.js      # Express Routes
│   ├── controllers/
│   │   └── productController.js  # Main logic: Cursor & Snapshot generation
│   ├── scripts/
│   │   └── seedProducts.js       # 200k Bulk Product Generator
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategoryFilter.jsx# Horizontal pill-based filter bar
│   │   │   ├── LoadMoreButton.jsx# Load more trigger with spinner
│   │   │   ├── ProductCard.jsx   # Beautiful glassmorphic product card
│   │   │   ├── ProductList.jsx   # Orchestrator handling page state/fetches
│   │   │   └── SkeletonCard.jsx  # Shimmer loading skeleton
│   │   ├── services/
│   │   │   └── api.js            # Axios client instance
│   │   ├── App.jsx               # Layout shell & Header
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind rules & customized glass UI
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Deep Dive: Key Concepts

### 1. Cursor-Based Pagination vs. Skip/Limit

#### Traditional Pagination (Offset-based)
```js
// Page 10,000 (20 items per page)
Product.find().skip(200000).limit(20)
```
* **How it works:** MongoDB must read all 200,020 documents from disk, walk through them, discard the first 200,000, and return the remaining 20.
* **Problem:** This leads to linear scale degradation **O(N)**. Later pages become extremely slow, leading to database timeouts.

#### Cursor Pagination
Instead of an integer offset, we use a **bookmark** (the cursor) based on the last document's sorting properties.
```js
// Seek directly to items older than our last seen product's timestamp & ID
Product.find({
  $or: [
    { updatedAt: { $lt: cursorUpdatedAt } },
    { updatedAt: cursorUpdatedAt, _id: { $lt: cursorId } }
  ]
})
.sort({ updatedAt: -1, _id: -1 })
.limit(20)
```
* **How it works:** Because the database has an index on `(updatedAt, _id)`, it can jump directly to the target position in **O(1)** time and read exactly 20 items. No scan-and-discard is needed.

---

### 2. Snapshot Consistency

#### The Problem: Pagination Drift
If a user is browsing pages and a write occurs (e.g. 50 new products are inserted/updated at the top):
* Without a snapshot, these new products shift existing items downward.
* When the user requests Page 2, items that were on Page 1 are now pushed into Page 2. The user sees **duplicate products**.
* If items are deleted, the user **misses products** entirely.

#### The Solution: Snapshot Time Lock
When the user makes the first page request, we capture the current server time as a `snapshotTime`:
```js
const snapshot = snapshotTime ? new Date(snapshotTime) : new Date();
```
For all subsequent page loads, we include `updatedAt: { $lte: snapshot }` in the query filter. This locks the reader's view to a frozen timestamp.
* **Result:** Any new products added or updated after the session started are invisible to the current browsing session. The pagination remains perfectly stable.
* When the user changes category, the `snapshotTime` resets to capture a fresh state.

---

### 3. Database Indexing Strategy

We define two compound indexes on our `Product` schema inside [Product.js](file:///c:/Users/chatu/OneDrive/Desktop/Internship%20assignment/backend/models/Product.js):

1. **`{ updatedAt: -1, _id: -1 }`**
   * **Why:** This covers the default pagination query. When querying products sorted by newest first, MongoDB can traverse the index tree in reverse order. This entirely prevents an in-memory "blocking sort" operation, returning results instantly.
2. **`{ category: 1, updatedAt: -1, _id: -1 }`**
   * **Why:** This covers category-filtered queries. MongoDB uses the equality match on `category` to narrow down to a subtree, and then reads the sorted products from the remaining indexed fields.

---

### 4. Bulk Seeding Strategy

Creating 200,000 documents by inserting them one-by-one requires 200,000 database network round-trips. With network latency, this would take hours.

Inside [seedProducts.js](file:///c:/Users/chatu/OneDrive/Desktop/Internship%20assignment/backend/scripts/seedProducts.js), we use **Bulk Insertion** via `insertMany()` in batches of **5,000 documents**:
```js
const BATCH_SIZE = 5000;
// Loop and run:
await Product.insertMany(productsBatch);
```
* **Why 5,000?** It maximizes insertion speed while avoiding MongoDB's 16MB single-operation BSON limit and preventing Node.js process out-of-memory errors. Seeding 200,000 records takes only 10–15 seconds!

---

## API Documentation

### Get Products
Returns a list of products using cursor-based pagination and a snapshot consistency token.

* **Endpoint:** `GET /api/products`
* **Query Parameters:**
  * `category` *(optional)*: Filter products by category (e.g. `Electronics`, `Books`, `Fashion`, `Sports`, `Home`, `Beauty`, `Toys`).
  * `cursor` *(optional)*: The base64-encoded pagination token returned in the previous request.
  * `snapshotTime` *(optional)*: The consistency timestamp returned in the previous request.
  * `limit` *(optional)*: Max number of products to return (default: `20`, max: `100`).

* **Example Response:**
  ```json
  {
    "products": [
      {
        "_id": "64bf6d0bfa8020a109a24bb0",
        "name": "Smart Headphones 49",
        "category": "Electronics",
        "price": 299.99,
        "createdAt": "2026-06-23T10:45:00.000Z",
        "updatedAt": "2026-06-23T10:45:00.000Z"
      }
    ],
    "nextCursor": "eyJ1cGRhdGVkQXQiOiIyMDI2LTA2LTIzVDEwOjQ1OjAwLjAwMFoiLCJfaWQiOiI2NGJmNmQwYmZhODAyMGExMDlhMjRiYjAifQ==",
    "hasMore": true,
    "snapshotTime": "2026-06-25T11:15:30.412Z"
  }
  ```
#   C o d e V e c t o r - A s s i g n m e n t  
 