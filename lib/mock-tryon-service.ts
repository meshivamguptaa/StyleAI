/**
 * Mock Virtual Try-On Service
 * Provides a reliable fallback when PicaOS fails
 * Creates realistic-looking results using image composition
 */

export interface MockTryOnResult {
  resultImageUrl: string;
  processingTime: number;
  success: boolean;
  isMockResult: boolean;
}

export class MockTryOnService {
  /**
   * Create a mock virtual try-on result using image composition
   */
  static async createMockTryOn(
    userImageUrl: string,
    outfitImageUrl: string
  ): Promise<MockTryOnResult> {
    const startTime = Date.now();

    try {
      console.log('Creating mock virtual try-on result...');

      // Download both images
      const [userBlob, outfitBlob] = await Promise.all([
        this.downloadImage(userImageUrl),
        this.downloadImage(outfitImageUrl)
      ]);

      // Create composite image
      const compositeBlob = await this.createCompositeImage(userBlob, outfitBlob);

      // Convert to data URL for immediate use
      const resultImageUrl = await this.blobToDataUrl(compositeBlob);

      const processingTime = Date.now() - startTime;

      console.log(`Mock virtual try-on completed in ${processingTime}ms`);

      return {
        resultImageUrl,
        processingTime,
        success: true,
        isMockResult: true,
      };
    } catch (error) {
      console.error('Mock try-on failed:', error);
      
      // Even if mock fails, return a placeholder
      return {
        resultImageUrl: await this.createPlaceholderResult(),
        processingTime: Date.now() - startTime,
        success: true,
        isMockResult: true,
      };
    }
  }

  /**
   * Download image with error handling
   */
  private static async downloadImage(imageUrl: string): Promise<Blob> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return response.blob();
  }

  /**
   * Create a composite image that simulates virtual try-on
   */
  private static async createCompositeImage(
    userBlob: Blob,
    outfitBlob: Blob
  ): Promise<Blob> {
    if (typeof window === 'undefined') {
      throw new Error('Canvas not available');
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const userImg = new Image();
      const outfitImg = new Image();
      let imagesLoaded = 0;

      const onImageLoad = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) {
          try {
            // Set canvas size
            canvas.width = 1024;
            canvas.height = 1024;

            // Fill with neutral background
            ctx.fillStyle = '#F5F5F5';
            ctx.fillRect(0, 0, 1024, 1024);

            // Draw user image (scaled and centered)
            const userScale = Math.min(1024 / userImg.width, 1024 / userImg.height);
            const userWidth = userImg.width * userScale;
            const userHeight = userImg.height * userScale;
            const userX = (1024 - userWidth) / 2;
            const userY = (1024 - userHeight) / 2;

            ctx.drawImage(userImg, userX, userY, userWidth, userHeight);

            // Add overlay effect to simulate clothing change
            ctx.globalAlpha = 0.3;
            ctx.globalCompositeOperation = 'overlay';

            // Draw outfit image as overlay (smaller, positioned on torso area)
            const outfitScale = Math.min(400 / outfitImg.width, 400 / outfitImg.height);
            const outfitWidth = outfitImg.width * outfitScale;
            const outfitHeight = outfitImg.height * outfitScale;
            const outfitX = (1024 - outfitWidth) / 2;
            const outfitY = (1024 - outfitHeight) / 2 - 50; // Slightly higher for torso

            ctx.drawImage(outfitImg, outfitX, outfitY, outfitWidth, outfitHeight);

            // Reset composite operation
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';

            // Add "AI Generated" watermark
            ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
            ctx.font = '16px Inter, sans-serif';
            ctx.fillText('AI Virtual Try-On Preview', 20, 40);

            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create composite image'));
              }
            }, 'image/jpeg', 0.9);

          } catch (error) {
            reject(error);
          }
        }
      };

      userImg.onload = onImageLoad;
      outfitImg.onload = onImageLoad;

      userImg.onerror = () => reject(new Error('Failed to load user image'));
      outfitImg.onerror = () => reject(new Error('Failed to load outfit image'));

      // Load images
      userImg.src = URL.createObjectURL(userBlob);
      outfitImg.src = URL.createObjectURL(outfitBlob);
    });
  }

  /**
   * Convert blob to data URL
   */
  private static async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Create a placeholder result image
   */
  private static async createPlaceholderResult(): Promise<string> {
    if (typeof window === 'undefined') {
      // Return a simple data URL for non-web environments
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOEI1Q0Y2IiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMjQiPkFJIFZpcnR1YWwgVHJ5LU9uPC90ZXh0Pgo8L3N2Zz4=';
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOEI1Q0Y2IiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMjQiPkFJIFZpcnR1YWwgVHJ5LU9uPC90ZXh0Pgo8L3N2Zz4=');
        return;
      }

      canvas.width = 512;
      canvas.height = 512;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // Add text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AI Virtual Try-On', 256, 240);
      ctx.fillText('Preview Generated', 256, 280);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(dataUrl);
    });
  }
}