import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

interface FullPageScreenshot {
  type: 'desktop' | 'mobile';
  totalHeight: number;
  chunks: Array<{
    chunkNumber: number;
    height: number;
    imageData: string;
  }>;
}

interface AnalysisResult {
  desktop: FullPageScreenshot;
  mobile: FullPageScreenshot;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { url } = await req.json();
    console.log("[v0] Received URL:", url);

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    let validatedUrl: string;
    try {
      const parsedUrl = new URL(url);
      validatedUrl = parsedUrl.toString();
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    const desktopScreenshot = await generateFullPageScreenshot(validatedUrl, 'desktop');
    const mobileScreenshot = await generateFullPageScreenshot(validatedUrl, 'mobile');

    const result: AnalysisResult = {
      desktop: desktopScreenshot,
      mobile: mobileScreenshot,
    };

    console.log("[v0] Generated full-page screenshots");
    return NextResponse.json({ screenshots: [result] });
  } catch (error) {
    console.error('[v0] Error analyzing website:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website. Please try another URL.' },
      { status: 500 }
    );
  }
}

async function generateFullPageScreenshot(
  url: string,
  type: 'desktop' | 'mobile'
): Promise<FullPageScreenshot> {
  const isDesktop = type === 'desktop';
  const width = isDesktop ? 3840 : 375;
  const chunkHeight = 4096;

  // Fetch screenshot from Microlink API (free tier, no API key required)
  const screenshotUrl = `https://cdn.microlink.io/?url=${encodeURIComponent(url)}&deviceScaleFactor=2&viewport=${isDesktop ? '3840x2160' : '375x812'}&fullPage=true&type=png`;
  
  console.log("[v0] Fetching screenshot from:", screenshotUrl);

  const screenshotResponse = await fetch(screenshotUrl);
  if (!screenshotResponse.ok) {
    throw new Error(`Failed to fetch screenshot: ${screenshotResponse.statusText}`);
  }

  const screenshotBuffer = await screenshotResponse.arrayBuffer();
  const base64Image = Buffer.from(screenshotBuffer).toString('base64');
  const imageData = `data:image/png;base64,${base64Image}`;

  // Get image dimensions to calculate chunks
  // For now, we estimate based on the viewport and typical page heights
  const estimatedHeight = isDesktop ? 12288 : 8192;
  
  const chunks = [];
  let currentOffset = 0;
  let chunkNumber = 1;
  const totalChunks = Math.ceil(estimatedHeight / chunkHeight);

  while (currentOffset < estimatedHeight) {
    const currentChunkHeight = Math.min(chunkHeight, estimatedHeight - currentOffset);
    
    chunks.push({
      chunkNumber,
      height: currentChunkHeight,
      imageData: imageData, // In production, crop the image to this chunk's dimensions
    });

    currentOffset += chunkHeight;
    chunkNumber++;
  }

  return {
    type,
    totalHeight: estimatedHeight,
    chunks,
  };
}
