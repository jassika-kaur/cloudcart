import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No items found',
  description = 'Looks like there is nothing to display here right now.',
  actionText = 'Start Shopping',
  actionLink = '/products',
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>
      {actionLink ? (
        <Link
          to={actionLink}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          {actionText}
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;
