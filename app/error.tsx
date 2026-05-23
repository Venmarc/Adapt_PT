'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#ef4444]/10 rounded-full blur-2xl w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
        <div className="relative w-16 h-16 bg-[#18181b] border border-[#ef4444]/30 rounded-2xl flex items-center justify-center shadow-lg text-[#ef4444]">
          <AlertTriangle className="w-8 h-8" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-[#a1a1aa] max-w-md mb-8">
        We encountered an unexpected error. Don't worry, your logged records and progress are safe.
      </p>

      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-[#ef4444]/15 hover:shadow-[#ef4444]/25 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
