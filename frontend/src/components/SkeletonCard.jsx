import React from 'react';


export default function SkeletonCard() {
  return (
    <div
      className="
        glass rounded-xl p-5
        flex flex-col justify-between
        min-h-[180px]
      "
      aria-hidden="true"
      role="presentation"
    >
      {/*  Top section: Name & badge placeholders  */}
      <div>
        {/* Product name — two lines of varying width */}
        <div className="shimmer h-5 w-3/4 rounded-md mb-2" />
        <div className="shimmer h-5 w-1/2 rounded-md mb-4" />

        {/* Category badge placeholder */}
        <div className="shimmer h-6 w-24 rounded-full" />
      </div>

      {/*  Bottom section: Price & date placeholders  */}
      <div className="flex items-end justify-between mt-4">
        {/* Price placeholder */}
        <div className="shimmer h-7 w-28 rounded-md" />

        {/* Date placeholder */}
        <div className="shimmer h-4 w-16 rounded-md" />
      </div>
    </div>
  );
}
