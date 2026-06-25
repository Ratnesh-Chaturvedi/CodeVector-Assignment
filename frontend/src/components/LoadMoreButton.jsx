import React from 'react';


export default function LoadMoreButton({ onClick, loading, hasMore }) {
  // Don't render anything if there are no more products to load
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-10 mb-4">
      <button
        onClick={onClick}
        disabled={loading}
        className={`
          relative group
          px-10 py-4 rounded-2xl
          text-white font-semibold text-base
          bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600
          transition-all duration-300 ease-out
          cursor-pointer
          w-full sm:w-auto sm:min-w-[280px]
          ${
            loading
              ? //  Loading state: reduced opacity, no pointer events 
                'opacity-75 cursor-not-allowed'
              : //  Normal state: hover scale + glow 
                'hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]'
          }
        `}
        aria-busy={loading}
        aria-label={loading ? 'Loading more products' : 'Load more products'}
      >
        {/*  Subtle gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

        {/* Button content*/}
        <span className="relative flex items-center justify-center gap-3">
          {loading ? (
            <>
              {/* Spinning SVG loader icon */}
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Loading more products…</span>
            </>
          ) : (
            <>
              <span>Load More Products</span>
              <svg
                className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </>
          )}
        </span>
      </button>
    </div>
  );
}
