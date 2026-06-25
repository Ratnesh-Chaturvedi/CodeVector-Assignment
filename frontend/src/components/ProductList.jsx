import React, { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import LoadMoreButton from './LoadMoreButton';
import SkeletonCard from './SkeletonCard';



const CATEGORIES = ['Electronics', 'Books', 'Fashion', 'Sports', 'Home', 'Beauty', 'Toys'];

export default function ProductList() {
  //  State declarations 
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [snapshotTime, setSnapshotTime] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);

  
  const loadProducts = useCallback(
    async ({ isInitial = false, cursorVal = null, snapshot = null, category = '' } = {}) => {
      // Set the correct loading flag
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchProducts({
          cursor: cursorVal,
          snapshotTime: snapshot,
          category: category || undefined,
          limit: 20,
        });

        // On the very first request, store the snapshotTime.
        // All subsequent requests will send this value so the server
        // returns data frozen at this point in time.
        const newSnapshot = snapshot || data.snapshotTime;

        if (isInitial) {
          // First page — replace products entirely
          setProducts(data.products);
          setSnapshotTime(newSnapshot);
        } else {
          // Subsequent pages — APPEND to existing list
          setProducts((prev) => [...prev, ...data.products]);
        }

        // Update pagination state
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          'Something went wrong. Please try again.'
        );
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    },
    []
  );

  // ── Initial load on mount 
  useEffect(() => {
    loadProducts({ isInitial: true, category: selectedCategory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleCategoryChange = useCallback(
    (category) => {
      // Skip if already on this category
      if (category === selectedCategory) return;

      // Reset state
      setSelectedCategory(category);
      setProducts([]);
      setCursor(null);
      setSnapshotTime(null);
      setHasMore(true);

      // Fetch first page for the new category
      loadProducts({ isInitial: true, category });
    },
    [selectedCategory, loadProducts]
  );

  
  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore) return;

    loadProducts({
      isInitial: false,
      cursorVal: cursor,
      snapshot: snapshotTime,
      category: selectedCategory,
    });
  }, [loading, hasMore, cursor, snapshotTime, selectedCategory, loadProducts]);

  // ── RENDER: Error state 
  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        {/* Error icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 className="text-white text-lg font-semibold mb-2">Failed to Load Products</h3>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-md">{error}</p>

        {/* Retry button */}
        <button
          onClick={() => loadProducts({ isInitial: true, category: selectedCategory })}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:scale-105 transition-transform cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  //  RENDER: Main content 
  return (
    <div>
      {/*  Category Filter Bar  */}
      <div className="glass rounded-2xl p-5 mb-8">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={CATEGORIES}
        />
      </div>

      {/*  Product count & info bar  */}
      {!initialLoading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            {/* Loaded count badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                <span className="text-white font-semibold">{products.length}</span> products loaded
              </span>
            </span>

            {/* Active category indicator */}
            {selectedCategory && (
              <span className="px-3 py-1.5 glass rounded-full text-xs text-indigo-300 font-medium">
                Filtering: {selectedCategory}
              </span>
            )}
          </div>

          {/* Snapshot time indicator — shows that data is consistent */}
          {snapshotTime && (
            <span className="text-slate-600 text-xs font-mono">
              snapshot: {new Date(snapshotTime).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* ── Inline error banner (when products exist but fetch failed) ── */}
      {error && products.length > 0 && (
        <div className="glass rounded-xl p-4 mb-6 border-red-500/30 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-300 text-sm">{error}</span>
          <button
            onClick={handleLoadMore}
            className="ml-auto text-sm text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/*  Skeleton Grid (initial loading)  */}
      {initialLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/*  Product Grid  */}
      {!initialLoading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, index) => (
            <ProductCard
              key={product._id || product.id || index}
              product={product}
              index={index}
            />
          ))}
        </div>
      )}

      {/*  Empty state  */}
      {!initialLoading && products.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-white text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-slate-400 text-sm text-center max-w-md">
            {selectedCategory
              ? `No products found in the "${selectedCategory}" category. Try selecting a different category.`
              : 'No products available at the moment. Please try again later.'}
          </p>
        </div>
      )}

      {/*  Load More Button  */}
      {!initialLoading && products.length > 0 && (
        <LoadMoreButton
          onClick={handleLoadMore}
          loading={loading}
          hasMore={hasMore}
        />
      )}

      {/*  All loaded message  */}
      {!initialLoading && !hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm font-medium">
            ✅ All {products.length} products loaded
          </p>
        </div>
      )}
    </div>
  );
}
