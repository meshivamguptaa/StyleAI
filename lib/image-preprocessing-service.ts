/**
 * Advanced Image Preprocessing Service for Virtual Try-On
 * Optimizes images before sending to PicaOS for better results
 */

export interface PreprocessingOptions {
  targetSize?: number;
  quality?: number;
  enhanceContrast?: boolean;
  removeBackground?: boolean;
  normalizeExposure?: boolean;
  sharpen?: boolean;
  optimizeColors?: boolean;
}

export interface PreprocessedImageResult {
  processedImageUrl: string;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  improvements: string[];
  processingTime: number;
}

export class ImagePreprocessingService {
  private static readonly DEFAULT_TARGET_SIZE = 1024;
  private static readonly DEFAULT_QUALITY = 0.95;

  /**
   * Preprocess image for optimal PicaOS compatibility
   */
  static async preprocessForPicaOS(
    imageUrl: string,
    imageType: 'user' | 'clothing',
    options: PreprocessingOptions = {}
  ): Promise<PreprocessedImageResult> {
    const startTime = Date.now();
    const improvements: string[] = [];

    const {
      targetSize = this.DEFAULT_TARGET_SIZE,
      quality = this.DEFAULT_QUALITY,
      enhanceContrast = true,
      removeBackground = imageType === 'clothing',
      normalizeExposure = true,
      sharpen = true,
      optimizeColors = true,
    } = options;

    try {
      console.log(`Preprocessing ${imageType} image for PicaOS...`);

      // Download the image
      const imageBlob = await this.downloadImage(imageUrl);
      improvements.push('Image downloaded successfully');

      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Load image
      const img = await this.loadImage(imageBlob);
      improvements.push('Image loaded for processing');

      // Set optimal canvas size
      const { width: canvasWidth, height: canvasHeight } = this.calculateOptimalSize(
        img.width, 
        img.height, 
        targetSize
      );
      
      canvas.width = Math.round(canvasWidth);
      canvas.height = Math.round(canvasHeight);

      // Configure high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill with appropriate background
      if (imageType === 'user') {
        // Neutral background for user photos
        ctx.fillStyle = '#F8F9FA';
      } else {
        // White background for clothing items
        ctx.fillStyle = '#FFFFFF';
      }
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate scaling and positioning
      const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
      const scaledWidth = Math.round(img.width * scale);
      const scaledHeight = Math.round(img.height * scale);
      const x = Math.round((canvasWidth - scaledWidth) / 2);
      const y = Math.round((canvasHeight - scaledHeight) / 2);

      // Draw the base image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      improvements.push('Image resized and positioned');

      // Apply preprocessing enhancements
      if (normalizeExposure) {
        this.normalizeExposure(ctx, canvasWidth, canvasHeight);
        improvements.push('Exposure normalized');
      }

      if (enhanceContrast) {
        this.enhanceContrast(ctx, canvasWidth, canvasHeight);
        improvements.push('Contrast enhanced');
      }

      if (sharpen) {
        this.sharpenImage(ctx, canvasWidth, canvasHeight);
        improvements.push('Image sharpened');
      }

      if (removeBackground && imageType === 'clothing') {
        this.removeClothingBackground(ctx, canvasWidth, canvasHeight);
        improvements.push('Background removed');
      }

      if (optimizeColors) {
        if (imageType === 'user') {
          this.enhanceSkinTones(ctx, canvasWidth, canvasHeight);
          improvements.push('Skin tones enhanced');
        } else {
          this.enhanceClothingColors(ctx, canvasWidth, canvasHeight);
          improvements.push('Clothing colors enhanced');
        }
      }

      // Apply final optimizations for PicaOS
      this.optimizeForPicaOS(ctx, canvasWidth, canvasHeight, imageType);
      improvements.push('Optimized for PicaOS');

      // Convert to high-quality data URL
      const processedImageUrl = canvas.toDataURL('image/png', quality);
      
      const processingTime = Date.now() - startTime;
      console.log(`Image preprocessing completed in ${processingTime}ms with improvements:`, improvements);

      return {
        processedImageUrl,
        originalSize: { width: img.width, height: img.height },
        processedSize: { width: canvasWidth, height: canvasHeight },
        improvements,
        processingTime,
      };
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw new Error(`Preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download image with proper error handling
   */
  private static async downloadImage(imageUrl: string): Promise<Blob> {
    try {
      // Handle data URLs directly
      if (imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl);
        return response.blob();
      }

      // Add cache-busting for regular URLs
      const cacheBustUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${Date.now()}` 
        : `${imageUrl}?t=${Date.now()}`;
      
      const response = await fetch(cacheBustUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      throw new Error(`Image download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load image from blob
   */
  private static async loadImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Calculate optimal canvas size
   */
  private static calculateOptimalSize(
    originalWidth: number, 
    originalHeight: number, 
    targetSize: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    // For user images, prefer portrait orientation
    if (aspectRatio < 1) {
      // Portrait
      return {
        width: Math.round(targetSize * aspectRatio),
        height: targetSize,
      };
    } else {
      // Landscape or square - make it portrait for better try-on
      return {
        width: Math.round(targetSize * 0.75),
        height: targetSize,
      };
    }
  }

  /**
   * Normalize image exposure
   */
  private static normalizeExposure(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Calculate histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[brightness]++;
    }

    // Calculate cumulative distribution
    const cdf = new Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    // Normalize
    const totalPixels = width * height;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      const normalized = Math.round((cdf[brightness] / totalPixels) * 255);
      const factor = normalized / Math.max(brightness, 1);

      data[i] = Math.min(255, Math.round(data[i] * factor));
      data[i + 1] = Math.min(255, Math.round(data[i + 1] * factor));
      data[i + 2] = Math.min(255, Math.round(data[i + 2] * factor));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Enhance image contrast
   */
  private static enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const factor = 1.2; // Contrast enhancement factor

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, Math.round((data[i] - 128) * factor + 128)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round((data[i + 1] - 128) * factor + 128)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round((data[i + 2] - 128) * factor + 128)));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Sharpen image
   */
  private static sharpenImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let kernelIdx = 0;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c;
              sum += data[neighborIdx] * kernel[kernelIdx];
              kernelIdx++;
            }
          }

          const idx = (y * width + x) * 4 + c;
          newData[idx] = Math.min(255, Math.max(0, Math.round(sum)));
        }
      }
    }

    const newImageData = new ImageData(newData, width, height);
    ctx.putImageData(newImageData, 0, 0);
  }

  /**
   * Remove background from clothing items
   */
  private static removeClothingBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Simple background removal based on edge detection and color similarity
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Check if pixel is likely background (light colors)
        const isLightBackground = r > 230 && g > 230 && b > 230;
        
        // Check if pixel is near the edge
        const isNearEdge = x < width * 0.1 || x > width * 0.9 || y < height * 0.1 || y > height * 0.9;
        
        if (isLightBackground && isNearEdge) {
          data[idx + 3] = 0; // Make transparent
        } else if (isLightBackground) {
          // Check neighbors to see if this is an isolated light pixel
          let surroundedByLight = true;
          
          // Check 4 adjacent pixels if possible
          if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            const neighbors = [
              ((y - 1) * width + x) * 4, // top
              ((y + 1) * width + x) * 4, // bottom
              (y * width + (x - 1)) * 4, // left
              (y * width + (x + 1)) * 4  // right
            ];
            
            for (const neighborIdx of neighbors) {
              const nr = data[neighborIdx];
              const ng = data[neighborIdx + 1];
              const nb = data[neighborIdx + 2];
              
              if (!(nr > 230 && ng > 230 && nb > 230)) {
                surroundedByLight = false;
                break;
              }
            }
            
            if (surroundedByLight) {
              data[idx + 3] = 0; // Make transparent
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Enhance skin tones for better person detection
   */
  private static enhanceSkinTones(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (this.isSkinTone(r, g, b)) {
        // Enhance skin tones for better detection
        data[i] = Math.min(255, Math.round(r * 1.1));     // Slightly enhance red
        data[i + 1] = Math.min(255, Math.round(g * 1.05)); // Slightly enhance green
        data[i + 2] = Math.min(255, Math.round(b * 0.95)); // Slightly reduce blue
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Enhance clothing colors for better detection
   */
  private static enhanceClothingColors(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Enhance color saturation for clothing
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;

      if (saturation > 0.1) { // Only enhance colorful areas
        const factor = 1.15;
        data[i] = Math.min(255, Math.round(r * factor));
        data[i + 1] = Math.min(255, Math.round(g * factor));
        data[i + 2] = Math.min(255, Math.round(b * factor));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply final optimizations for PicaOS
   */
  private static optimizeForPicaOS(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    imageType: 'user' | 'clothing'
  ): void {
    // Add subtle vignette effect to focus attention on the center
    const gradient = ctx.createRadialGradient(
      width/2, height/2, height * 0.4, 
      width/2, height/2, height * 0.8
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, width, height);
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Detect skin tone
   */
  private static isSkinTone(r: number, g: number, b: number): boolean {
    // Simple skin tone detection
    return (
      r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b
    );
  }

  /**
   * Validate image before preprocessing
   */
  static async validateImageForPreprocessing(imageUrl: string): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // For data URLs, do basic validation
      if (imageUrl.startsWith('data:')) {
        if (!imageUrl.startsWith('data:image/')) {
          issues.push('Data URL is not a valid image');
          recommendations.push('Use a valid image data URL');
        }
        
        // Rough size check based on string length
        const sizeEstimate = imageUrl.length * 0.75; // Approximate base64 to binary ratio
        if (sizeEstimate < 10 * 1024) {
          issues.push('Image appears to be very small');
          recommendations.push('Use a higher resolution image');
        }
        if (sizeEstimate > 10 * 1024 * 1024) {
          issues.push('Image appears to be very large');
          recommendations.push('Use a smaller image (under 10MB)');
        }
        
        return {
          isValid: issues.length === 0,
          issues,
          recommendations,
        };
      }

      // For regular URLs, fetch headers
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        issues.push('Image URL is not accessible');
        recommendations.push('Check if the image URL is correct and accessible');
        return { isValid: false, issues, recommendations };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        issues.push('File is not a valid image');
        recommendations.push('Use a PNG, JPEG, or WebP image file');
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        if (size < 50 * 1024) {
          issues.push('Image file size is very small');
          recommendations.push('Use a higher resolution image');
        }
        if (size > 10 * 1024 * 1024) {
          issues.push('Image file size is too large');
          recommendations.push('Use a smaller image file (under 10MB)');
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      issues.push('Could not validate image');
      recommendations.push('Check your internet connection and try again');
      return { isValid: false, issues, recommendations };
    }
  }
}