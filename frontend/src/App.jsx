import React from 'react';
import ProductList from './components/ProductList';


export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
     
      <header className="glass sticky top-0 z-50 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* {Title section} */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text tracking-tight">
                Product Browser
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-light">
                Lightning-fast cursor-based pagination · 200k+ products · Real-time filtering
              </p>
            </div>

            {/*  Live indicator badge */}
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full self-start sm:self-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 text-xs font-medium">Live</span>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        {/* Top-left purple orb */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        {/* Bottom-right violet orb */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-3xl" />
      </div>

      {/* MAIN CONTENT —*/}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <ProductList />
      </main>

     
    </div>
  );
}
