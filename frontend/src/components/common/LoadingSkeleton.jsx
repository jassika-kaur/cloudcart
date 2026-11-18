import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse flex flex-col space-y-3">
      <div className="aspect-square bg-slate-200 rounded-xl w-full"></div>
      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-4/5"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="pt-2 flex items-center justify-between">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded-lg w-full"></div>
      ))}
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
      <div className="h-48 bg-slate-200 rounded-2xl w-full"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
