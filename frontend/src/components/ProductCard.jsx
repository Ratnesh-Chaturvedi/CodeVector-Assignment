import React from 'react';


const CATEGORY_STYLES = {
  Electronics: {
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
    emoji: '⚡',
  },
  Books: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    emoji: '📚',
  },
  Fashion: {
    bg: 'bg-pink-500/20',
    text: 'text-pink-300',
    border: 'border-pink-500/30',
    emoji: '👗',
  },
  Sports: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    emoji: '🏀',
  },
  Home: {
    bg: 'bg-sky-500/20',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    emoji: '🏠',
  },
  Beauty: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    emoji: '✨',
  },
  Toys: {
    bg: 'bg-violet-500/20',
    text: 'text-violet-300',
    border: 'border-violet-500/30',
    emoji: '🎮',
  },
};

// Fallback style for categories not in the mapping
const DEFAULT_STYLE = {
  bg: 'bg-slate-500/20',
  text: 'text-slate-300',
  border: 'border-slate-500/30',
  emoji: '📦',
};


function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  // For older dates, show a nicely formatted date string
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}


function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default function ProductCard({ product, index }) {
  // Look up the category-specific styling, fall back to default
  const style = CATEGORY_STYLES[product.category] || DEFAULT_STYLE;

  // Stagger delay: each card's fade-in is delayed by 50ms × its index.
  // Capped at 500ms so cards deep in the list don't wait too long.
  const animationDelay = `${Math.min(index * 50, 500)}ms`;

  return (
    <div
      className="
        glass card-glow fade-in-up
        rounded-xl p-5
        flex flex-col justify-between
        min-h-[180px]
      "
      style={{ animationDelay }}
    >
      {/*  Top section: Name + Category  */}
      <div>
        {/* Product Name */}
        <h3 className="text-white font-semibold text-lg leading-snug mb-3 line-clamp-2">
          {product.name}
        </h3>

        {/* Category Badge — pill-shaped with category-specific colors */}
        <span
          className={`
            inline-flex items-center gap-1.5
            px-3 py-1 rounded-full text-xs font-medium
            border
            ${style.bg} ${style.text} ${style.border}
          `}
        >
          <span>{style.emoji}</span>
          {product.category}
        </span>
      </div>

      {/*  Bottom section: Price + Date  */}
      <div className="flex items-end justify-between mt-4">
        {/* Price — large gradient text for visual prominence */}
        <span className="gradient-text text-2xl font-bold">
          {formatPrice(product.price)}
        </span>

        {/* Relative date — subtle muted text */}
        <span className="text-slate-500 text-xs font-medium">
          {formatRelativeDate(product.createdAt)}
        </span>
      </div>
    </div>
  );
}
