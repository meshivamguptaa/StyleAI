/**
 * Advanced Image Enhancement Service for Virtual Try-On
 * Handles image preprocessing, quality enhancement, and format optimization
 */

export interface ImageEnhancementOptions {
  targetSize?: number;
  quality?: number;
  enhanceContrast?: boolean;
  sharpen?: boolean;
  removeNoise?: boolean;
  normalizeExposure?: boolean;
}

export interface EnhancedImageResult {
  blob: Blob;
  width: number;
  height: number;
  quality: number;
  enhancements: string[];
}

export class ImageEnhancementService {
  private static readonly DEFAULT_TARGET_SIZE = 1024;
  private static readonly DEFAULT_QUALITY = 0.95;

  /**
   * Enhance image quality for virtual try-on processing
   */
  static async enhanceImageForTryOn(
    imageBlob: Blob,
    imageType: 'user' | 'outfit',
    options: ImageEnhancementOptions = {}
  ): Promise<EnhancedImageResult> {
    const {
      targetSize = this.DEFAULT_TARGET_SIZE,
      quality = this.DEFAULT_QUALITY,
      enhanceContrast = true,
      sharpen = true,
      removeNoise = true,
      normalizeExposure = true,
    } = options;

    if (typeof window === 'undefined' || !window.HTMLCanvasElement) {
      throw new Error('Image enhancement requires web environment');
    }

    return new Promise<EnhancedImageResult>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          if (!ctx) {
            throw new Error('Canvas context not available');
          }

          // Set canvas dimensions
          canvas.width = targetSize;
          canvas.height = targetSize;

          // Configure high-quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Calculate optimal scaling and positioning
          const { width: imgWidth, height: imgHeight } = img;
          const scale = Math.min(targetSize / imgWidth, targetSize / imgHeight);
          const scaledWidth = imgWidth * scale;
          const scaledHeight = imgHeight * scale;
          const x = (targetSize - scaledWidth) / 2;
          const y = (targetSize - scaledHeight) / 2;

          // Fill with optimal background
          if (imageType === 'user') {
            // Neutral background for user photos
            ctx.fillStyle = '#F5F5F5';
          } else {
            // White background for clothing items
            ctx.fillStyle = '#FFFFFF';
          }
          ctx.fillRect(0, 0, targetSize, targetSize);

          // Draw the base image
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          // Apply enhancements
          const appliedEnhancements: string[] = [];

          if (normalizeExposure) {
            this.normalizeExposure(ctx, targetSize, targetSize);
            appliedEnhancements.push('Exposure Normalization');
          }

          if (enhanceContrast) {
            this.enhanceContrast(ctx, targetSize, targetSize);
            appliedEnhancements.push('Contrast Enhancement');
          }

          if (removeNoise) {
            this.reduceNoise(ctx, targetSize, targetSize);
            appliedEnhancements.push('Noise Reduction');
          }

          if (sharpen) {
            this.sharpenImage(ctx, targetSize, targetSize);
            appliedEnhancements.push('Sharpening');
          }

          // Apply final quality optimizations
          this.optimizeForTryOn(ctx, targetSize, targetSize, imageType);
          appliedEnhancements.push('Try-On Optimization');

          // Convert to high-quality blob
          canvas.toBlob((enhancedBlob) => {
            if (enhancedBlob) {
              resolve({
                blob: enhancedBlob,
                width: targetSize,
                height: targetSize,
                quality: quality,
                enhancements: appliedEnhancements,
              });
            } else {
              reject(new Error('Failed to create enhanced image blob'));
            }
          }, 'image/png', quality);

        } catch (error) {
          reject(new Error(`Image enhancement failed: ${error}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for enhancement'));
      };

      // Load the image
      const imageUrl = URL.createObjectURL(imageBlob);
      img.src = imageUrl;

      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(imageUrl), 10000);
    });
  }

  /**
   * Normalize image exposure for better visibility
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

      data[i] = Math.min(255, data[i] * factor);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
      data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
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
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // Red
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // Green
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Reduce image noise
   */
  private static reduceNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    // Simple noise reduction using averaging
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels
          const idx = (y * width + x) * 4 + c;
          let sum = 0;
          let count = 0;

          // 3x3 kernel
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c;
              sum += data[neighborIdx];
              count++;
            }
          }

          newData[idx] = Math.round(sum / count);
        }
      }
    }

    const newImageData = new ImageData(newData, width, height);
    ctx.putImageData(newImageData, 0, 0);
  }

  /**
   * Sharpen image for better definition
   */
  private static sharpenImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    // Sharpening kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels
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
          newData[idx] = Math.min(255, Math.max(0, sum));
        }
      }
    }

    const newImageData = new ImageData(newData, width, height);
    ctx.putImageData(newImageData, 0, 0);
  }

  /**
   * Apply final optimizations specific to virtual try-on
   */
  private static optimizeForTryOn(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    imageType: 'user' | 'outfit'
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    if (imageType === 'user') {
      // Enhance skin tones and reduce shadows for user photos
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect and enhance skin tones
        if (this.isSkinTone(r, g, b)) {
          data[i] = Math.min(255, r * 1.1);     // Slightly enhance red
          data[i + 1] = Math.min(255, g * 1.05); // Slightly enhance green
          data[i + 2] = Math.min(255, b * 0.95); // Slightly reduce blue
        }
      }
    } else {
      // Enhance clothing colors and textures
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
          data[i] = Math.min(255, r * factor);
          data[i + 1] = Math.min(255, g * factor);
          data[i + 2] = Math.min(255, b * factor);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Detect if a color is likely a skin tone
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
   * Validate image quality before enhancement
   */
  static async validateImageQuality(imageBlob: Blob): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check file size
    if (imageBlob.size < 50 * 1024) { // Less than 50KB
      issues.push('Image file size is very small');
      recommendations.push('Use a higher resolution image');
    }

    if (imageBlob.size > 10 * 1024 * 1024) { // More than 10MB
      issues.push('Image file size is too large');
      recommendations.push('Compress the image or use a smaller file');
    }

    // Check image type
    if (!imageBlob.type.startsWith('image/')) {
      issues.push('File is not a valid image');
      recommendations.push('Use a PNG, JPEG, or WebP image file');
    }

    // Additional quality checks would require loading the image
    if (typeof window !== 'undefined') {
      try {
        const qualityCheck = await this.checkImageDimensions(imageBlob);
        issues.push(...qualityCheck.issues);
        recommendations.push(...qualityCheck.recommendations);
      } catch (error) {
        issues.push('Could not analyze image quality');
        recommendations.push('Try using a different image file');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Check image dimensions and quality
   */
  private static async checkImageDimensions(imageBlob: Blob): Promise<{
    issues: string[];
    recommendations: string[];
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const issues: string[] = [];
      const recommendations: string[] = [];

      img.onload = () => {
        const { width, height } = img;

        if (width < 512 || height < 512) {
          issues.push('Image resolution is too low');
          recommendations.push('Use an image with at least 512x512 pixels');
        }

        if (width > 4096 || height > 4096) {
          issues.push('Image resolution is very high');
          recommendations.push('Consider using a smaller image for faster processing');
        }

        const aspectRatio = width / height;
        if (aspectRatio < 0.5 || aspectRatio > 2.0) {
          issues.push('Image has unusual aspect ratio');
          recommendations.push('Use images with more standard proportions');
        }

        URL.revokeObjectURL(img.src);
        resolve({ issues, recommendations });
      };

      img.onerror = () => {
        issues.push('Could not load image for analysis');
        recommendations.push('Check if the image file is corrupted');
        resolve({ issues, recommendations });
      };

      img.src = URL.createObjectURL(imageBlob);
    });
  }
}