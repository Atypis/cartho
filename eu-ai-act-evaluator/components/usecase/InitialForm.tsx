'use client';

import { useState } from 'react';
import type { UseCaseFormData } from '@/lib/usecase/types';

interface InitialFormProps {
  onSubmit: (data: UseCaseFormData) => void;
  onCancel: () => void;
}

export function InitialForm({ onSubmit, onCancel }: InitialFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      onSubmit({ title: title.trim(), description: description.trim() });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 animate-fadeIn">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-3 tracking-tight">
          Tell us about your AI system
        </h1>
        <p className="text-neutral-600 text-[15px] leading-relaxed">
          Describe what it does, how it works, and who will use it.<br />
          The more detail you provide, the better.
        </p>
      </div>

      <div className="space-y-6">
        {/* Title Field */}
        <div>
          <label className="block text-[13px] font-medium text-neutral-700 mb-2 uppercase tracking-wide">
            Use Case Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g., "AI-powered resume screening for job applications"'
            className="w-full px-4 py-3 rounded-lg border border-neutral-200
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                     focus:outline-none transition-all duration-200 text-[15px]
                     placeholder:text-neutral-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.querySelector('textarea')?.focus();
              }
            }}
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-[13px] font-medium text-neutral-700 mb-2 uppercase tracking-wide">
            Describe your system
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does it do? Who uses it? How does it work?"
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                     focus:outline-none transition-all duration-200 text-[15px]
                     resize-none placeholder:text-neutral-400 leading-relaxed"
          />
        </div>

        {/* Help Toggle */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          type="button"
          className="text-[13px] text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          {showHelp ? '− Hide guidance' : '+ Need help? Show me what to include'}
        </button>

        {/* Help Panel */}
        {showHelp && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 animate-slideDown">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl leading-none">💡</span>
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold text-blue-900 mb-3 uppercase tracking-wide">
                  What we need to know
                </h3>
                <p className="text-[15px] text-blue-800 mb-3">
                  Your description should cover:
                </p>
                <ul className="space-y-2 text-[14px] text-blue-800">
                  <li>• What your system does and its intended purpose</li>
                  <li>• How it works technically (models, algorithms, data)</li>
                  <li>• Who will use it and in what context</li>
                  <li>• Your role (are you developing, deploying, or using it?)</li>
                  <li>• Where it will be used geographically</li>
                </ul>
                <p className="text-[13px] text-blue-700 mt-3 italic">
                  Don't worry if you miss something—we'll ask follow-up questions if needed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-10">
        <button
          onClick={onCancel}
          type="button"
          className="px-6 py-2.5 text-[14px] font-medium text-neutral-600
                   hover:text-neutral-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          type="button"
          disabled={!title.trim() || !description.trim()}
          className="px-8 py-2.5 bg-neutral-900 text-white rounded-lg text-[14px]
                   font-medium hover:bg-neutral-800 disabled:opacity-50
                   disabled:cursor-not-allowed transition-all duration-200
                   hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
        >
          Analyze Use Case
        </button>
      </div>
    </div>
  );
}
