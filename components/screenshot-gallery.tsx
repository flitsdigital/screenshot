'use client';

import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Download, Monitor, Smartphone } from 'lucide-react';

interface Chunk {
  chunkNumber: number;
  height: number;
  imageData: string;
}

interface FullPageScreenshot {
  type: 'desktop' | 'mobile';
  totalHeight: number;
  chunks: Chunk[];
}

interface GalleryProps {
  desktop: FullPageScreenshot;
  mobile: FullPageScreenshot;
}

export default function ScreenshotGallery({
  desktop,
  mobile,
}: GalleryProps) {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [expandedType, setExpandedType] = useState<'desktop' | 'mobile' | null>(null);

  const downloadChunk = async (
    imageData: string,
    filename: string,
    format: 'png' | 'jpg'
  ) => {
    try {
      console.log('[v0] Starting chunk download:', filename);

      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas to blob in the requested format
          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const quality = format === 'jpg' ? 0.95 : 1.0;
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                saveBlob(blob, filename, format);
              }
            },
            mimeType,
            quality
          );
        }
      };
      
      img.onerror = () => {
        console.error('[v0] Failed to load image for conversion');
        alert('Failed to process image. Please try again.');
      };
      
      img.src = imageData;
    } catch (error) {
      console.error('[v0] Failed to download chunk:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const saveBlob = (blob: Blob, filename: string, format: 'png' | 'jpg') => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log('[v0] Download completed:', `${filename}.${format}`);
  };

  const downloadAllChunks = async (screenshot: FullPageScreenshot, format: 'png' | 'jpg') => {
    for (const chunk of screenshot.chunks) {
      const filename = `${screenshot.type}-chunk-${chunk.chunkNumber}`;
      await downloadChunk(chunk.imageData, filename, format);
      // Small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const renderScreenshot = (screenshot: FullPageScreenshot) => {
    const isExpanded = expandedType === screenshot.type;
    const isDesktop = screenshot.type === 'desktop';

    return (
      <Card
        key={screenshot.type}
        className="overflow-hidden border-purple-500/20 bg-slate-800/50 backdrop-blur-sm transition-all"
      >
        <button
          onClick={() =>
            setExpandedType(isExpanded ? null : screenshot.type)
          }
          className="w-full p-6 text-left transition-colors hover:bg-slate-700/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDesktop ? (
                <Monitor className="h-6 w-6 text-purple-400" />
              ) : (
                <Smartphone className="h-6 w-6 text-purple-400" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {isDesktop ? 'Desktop' : 'Mobile'} Screenshot
                </h3>
                <p className="mt-1 text-sm text-purple-300">
                  {screenshot.totalHeight}px height, {screenshot.chunks.length} chunks of {screenshot.chunks[0]?.height}px max
                </p>
              </div>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-purple-500/20 px-6 py-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-purple-200">Download Format:</span>
              <div className="flex gap-2">
                {['png', 'jpg'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setDownloadFormat(fmt as 'png' | 'jpg')}
                    className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                      downloadFormat === fmt
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-purple-200 hover:bg-slate-600'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => downloadAllChunks(screenshot, downloadFormat)}
                className="ml-auto flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
              >
                <Download className="h-4 w-4" />
                Download All {screenshot.chunks.length} Chunks
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {screenshot.chunks.map((chunk) => (
                <div
                  key={chunk.chunkNumber}
                  className="flex items-center justify-between gap-3 rounded-lg border border-purple-500/20 bg-slate-700/30 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">
                      Chunk {chunk.chunkNumber}: {chunk.height}px
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      downloadChunk(
                        chunk.imageData,
                        `${screenshot.type}-chunk-${chunk.chunkNumber}`,
                        downloadFormat
                      )
                    }
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-purple-700 whitespace-nowrap"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderScreenshot(desktop)}
      {renderScreenshot(mobile)}

      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-slate-800/50 backdrop-blur-sm">
        <div className="p-6">
          <h3 className="font-semibold text-white mb-2">Full-Page Screenshots Ready</h3>
          <p className="text-sm text-purple-300">
            Desktop and mobile full-page screenshots have been captured and split into {desktop.chunks.length} and {mobile.chunks.length} chunks respectively to bypass Figma's size limits.
          </p>
        </div>
      </Card>
    </div>
  );
}
