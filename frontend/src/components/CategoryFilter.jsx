import React from 'react';

const CATEGORY_EMOJIS = {
  All: '🌐',
  Electronics: '⚡',
  Books: '📚',
  Fashion: '👗',
  Sports: '🏀',
  Home: '🏠',
  Beauty: '✨',
  Toys: '🎮',
};

export default function CategoryFilter({ selectedCategory, onCategoryChange, categories }) {
  
  const allOptions = [
    { label: 'All', value: '' },
    ...categories.map((cat) => ({ label: cat, value: cat })),
  ];

  return (
    <div className="w-full">
      {/* Section label */}
      <p className="text-slate-400 text-sm font-medium mb-3 tracking-wide uppercase">
        Filter by Category
      </p>

      {/* Pills row — flex-wrap so they wrap on mobile */}
      <div className="flex flex-wrap gap-2">
        {allOptions.map(({ label, value }) => {
          // Determine if this pill is the active one
          const isActive = selectedCategory === value;

          // Look up the emoji, fallback to a generic icon
          const emoji = CATEGORY_EMOJIS[label] || '📦';

          return (
            <button
              key={label}
              onClick={() => onCategoryChange(value)}
              className={`
                inline-flex items-center gap-1.5
                px-4 py-2 rounded-full
                text-sm font-medium
                transition-all duration-200 ease-out
                cursor-pointer
                ${
                  isActive
                    ?
                      'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                    : 
                      'glass text-slate-300 hover:text-white hover:border-indigo-500/30 hover:bg-slate-800/60'
                }
              `}
              aria-pressed={isActive}
              aria-label={`Filter by ${label}`}
            >
          
              <span className="text-base">{emoji}</span>

              {/* Category label */}
              <span>{label}</span>

              {/* Active indicator dot — tiny pulsing dot on the active pill */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
