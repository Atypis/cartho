'use client';

import { ReactNode } from 'react';

interface SidebarProps {
  useCaseCount: number;
  onNavigateHome: () => void;
  onCreateNew: () => void;
  currentView: string;
}

export function Sidebar({ useCaseCount, onNavigateHome, onCreateNew, currentView }: SidebarProps) {
  const isHome = currentView === 'welcome';

  return (
    <div className="w-[260px] bg-neutral-900 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-6 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm">
            EU
          </div>
          <div>
            <div className="text-sm font-semibold">AI Act Evaluator</div>
            <div className="text-xs text-neutral-400">Compliance Tool</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Home / Use Cases */}
        <button
          onClick={onNavigateHome}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isHome
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>Use Cases</span>
          {useCaseCount > 0 && (
            <span className="ml-auto text-xs bg-neutral-700 px-2 py-0.5 rounded-full">
              {useCaseCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-px bg-neutral-800 my-3"></div>

        {/* New Use Case Button */}
        <button
          onClick={onCreateNew}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                   bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Use Case</span>
        </button>
      </nav>

      {/* Footer / Quick Stats */}
      <div className="px-6 py-4 border-t border-neutral-800">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Systems Documented</span>
            <span className="font-semibold text-white">{useCaseCount}</span>
          </div>
          {/* Could add more stats here */}
        </div>
      </div>
    </div>
  );
}
