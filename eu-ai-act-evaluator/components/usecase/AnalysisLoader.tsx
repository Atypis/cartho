'use client';

export function AnalysisLoader() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 animate-fadeIn">
      <div className="flex flex-col items-center justify-center py-20">
        {/* Spinning Circle */}
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-neutral-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Analyzing...
        </h2>
        <p className="text-neutral-600 text-[15px] text-center max-w-md leading-relaxed">
          Understanding your use case and<br />
          identifying what we need to proceed
        </p>
      </div>
    </div>
  );
}
