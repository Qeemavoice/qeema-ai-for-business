import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { BreadcrumbItem } from '../seo/seoConfig';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-slate-500 py-3 ${className}`} dir="rtl">
      <ol className="flex items-center flex-wrap gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.item + index} className="flex items-center gap-2">
              {isFirst && <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {isLast ? (
                <span className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.item}
                  className="hover:text-brand-text transition-colors font-medium text-slate-600"
                >
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0 rotate-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
