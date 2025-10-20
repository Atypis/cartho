'use client';

/**
 * Breadcrumb Navigation Component
 *
 * Provides hierarchical navigation: Use Cases / [Use Case Name] / [Evaluation]
 */

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
