'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import ScreenshotGallery from '@/components/screenshot-gallery';

export default function Page() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setScreenshots([]);

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate screenshots');
      }

      const data = await response.json();
      setScreenshots(data.screenshots);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600">
              <span className="font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Screenshot Pro</h1>
              <p className="text-xs text-purple-300">Website Analysis Tool</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-purple-200">
            Instantly capture and analyze the most important sections of any website in mobile and desktop formats
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Input Section */}
        <Card className="border-purple-500/30 bg-slate-800/50 backdrop-blur-sm">
          <div className="p-8">
            <h2 className="mb-2 text-xl font-semibold text-white">Analyze Website</h2>
            <p className="mb-6 text-sm text-purple-200">
              Enter a website URL to automatically generate high-quality screenshots of key sections
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="border-purple-500/30 bg-slate-700/50 text-white placeholder-purple-300/50"
                  aria-label="Website URL"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="whitespace-nowrap bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>

              {error && (
                <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>
        </Card>

        {/* Results Section */}
        {screenshots.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-8 text-2xl font-bold text-white">Full-Page Screenshots</h2>
            <ScreenshotGallery 
              desktop={screenshots[0]?.desktop || { type: 'desktop', totalHeight: 0, chunks: [] }}
              mobile={screenshots[0]?.mobile || { type: 'mobile', totalHeight: 0, chunks: [] }}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && screenshots.length === 0 && !error && (
          <div className="mt-16 text-center">
            <div className="mb-6 inline-block rounded-full bg-purple-500/10 p-6">
              <svg
                className="h-12 w-12 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">No screenshots yet</h3>
            <p className="mt-2 text-purple-300">
              Enter a website URL above to get started with instant screenshot analysis
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="inline-block">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Analyzing Website</h3>
              <p className="mt-2 text-sm text-purple-300">
                Taking screenshots and detecting important sections...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
