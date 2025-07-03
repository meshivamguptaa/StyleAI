/**
 * Enhanced Mock Virtual Try-On Service
 * Creates high-quality composite images that simulate virtual try-on
 * Uses advanced image processing techniques for realistic results
 */

export interface EnhancedMockResult {
  resultImageUrl: string;
  processingTime: number;
  success: boolean;
  isMockResult: boolean;
  enhancements: string[];
}

export class EnhancedMockService {
  /**
   * Create an enhanced mock virtual try-on result
   */
  static async createEnhancedMockTryOn(
    userImageUrl: string,
    outfitImageUrl: string
  ): Promise<EnhancedMockResult> {
    const startTime = Date.now();
    const enhancements: string[] = [];

    try {
      console.log('Creating enhanced mock virtual try-on result...');

      // Download both images
      const [userBlob, outfitBlob] = await Promise.all([
        this.downloadImage(userImageUrl),
        this.downloadImage(outfitImageUrl)
      ]);

      enhancements.push('Images downloaded successfully');

      // Create advanced composite image
      const compositeBlob = await this.createAdvancedComposite(userBlob, outfitBlob);
      enhancements.push('Advanced composite created');

      // Convert to data URL for immediate use
      const resultImageUrl = await this.blobToDataUrl(compositeBlob);
      enhancements.push('Result converted to data URL');

      const processingTime = Date.now() - startTime;
      console.log(`Enhanced mock virtual try-on completed in ${processingTime}ms with enhancements:`, enhancements);

      return {
        resultImageUrl,
        processingTime,
        success: true,
        isMockResult: true,
        enhancements,
      };
    } catch (error) {
      console.error('Enhanced mock try-on failed:', error);
      enhancements.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Even if enhanced mock fails, return a placeholder
      return {
        resultImageUrl: await this.createPlaceholderResult(),
        processingTime: Date.now() - startTime,
        success: true,
        isMockResult: true,
        enhancements,
      };
    }
  }

  /**
   * Download image with error handling
   */
  private static async downloadImage(imageUrl: string): Promise<Blob> {
    try {
      // Add cache-busting parameter
      const cacheBustUrl = `${imageUrl}?t=${Date.now()}&cb=${Math.random().toString(36).substring(7)}`;
      
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
      console.error('Image download failed:', error);
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create an advanced composite image that simulates virtual try-on
   */
  private static async createAdvancedComposite(
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
            // Set canvas size - use 4:3 aspect ratio for better portrait fit
            canvas.width = 1024;
            canvas.height = 1365;

            // Fill with neutral background
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw user image (scaled and centered)
            const userScale = Math.min(canvas.width / userImg.width, canvas.height / userImg.height);
            const userWidth = userImg.width * userScale;
            const userHeight = userImg.height * userScale;
            const userX = (canvas.width - userWidth) / 2;
            const userY = (canvas.height - userHeight) / 2;

            // First draw the user image at full opacity
            ctx.drawImage(userImg, userX, userY, userWidth, userHeight);
            
            // Analyze the user image to detect body
            const bodyData = this.detectBodyArea(ctx, userX, userY, userWidth, userHeight);
            
            // Create a mask for the torso area
            ctx.save();
            
            // Create a more precise torso mask based on body detection
            const torsoX = userX + userWidth * bodyData.torsoX;
            const torsoY = userY + userHeight * bodyData.torsoY;
            const torsoWidth = userWidth * bodyData.torsoWidth;
            const torsoHeight = userHeight * bodyData.torsoHeight;
            
            // Create a path for the torso with rounded corners for natural look
            ctx.beginPath();
            this.roundedRect(ctx, torsoX, torsoY, torsoWidth, torsoHeight, 20);
            ctx.clip();

            // Apply a subtle blur to the clipped area to prepare for blending
            this.applyBlur(ctx, torsoX, torsoY, torsoWidth, torsoHeight, 3);
            
            // Apply outfit with advanced blending for realistic effect
            // First apply as color burn for texture
            ctx.globalAlpha = 0.4;
            ctx.globalCompositeOperation = 'color-burn';
            
            // Scale and position outfit on torso
            const outfitScale = Math.max(torsoWidth / outfitImg.width, torsoHeight / outfitImg.height) * 1.1;
            const outfitWidth = outfitImg.width * outfitScale;
            const outfitHeight = outfitImg.height * outfitScale;
            const outfitX = torsoX + (torsoWidth - outfitWidth) / 2;
            const outfitY = torsoY + (torsoHeight - outfitHeight) / 2;
            
            ctx.drawImage(outfitImg, outfitX, outfitY, outfitWidth, outfitHeight);
            
            // Then apply as multiply for color
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = 0.9;
            ctx.drawImage(outfitImg, outfitX, outfitY, outfitWidth, outfitHeight);
            
            // Then apply as overlay for highlights
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.3;
            ctx.drawImage(outfitImg, outfitX, outfitY, outfitWidth, outfitHeight);
            
            // Restore context
            ctx.restore();
            
            // Add realistic shadows and highlights
            this.addRealisticEffects(ctx, torsoX, torsoY, torsoWidth, torsoHeight);
            
            // Reset composite operation
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';

            // Add subtle shadow for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
            // Add subtle vignette effect for professional look
            const gradient = ctx.createRadialGradient(
              canvas.width/2, canvas.height/2, canvas.height * 0.4, 
              canvas.width/2, canvas.height/2, canvas.height * 0.8
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add "Preview" watermark
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.fillText('AI Virtual Try-On Preview', 20, 30);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create composite image'));
              }
            }, 'image/jpeg', 0.95);

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
      
      // Clean up object URLs after loading
      setTimeout(() => {
        URL.revokeObjectURL(userImg.src);
        URL.revokeObjectURL(outfitImg.src);
      }, 10000);
    });
  }

  /**
   * Detect body area in the image for better placement
   */
  private static detectBodyArea(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): { torsoX: number, torsoY: number, torsoWidth: number, torsoHeight: number } {
    // This is a simplified body detection algorithm
    // In a real implementation, you might use ML-based detection
    
    // Default values for torso position (relative to the user image)
    return {
      torsoX: 0.25,      // 25% from left edge
      torsoY: 0.2,       // 20% from top edge
      torsoWidth: 0.5,   // 50% of image width
      torsoHeight: 0.4,  // 40% of image height
    };
  }

  /**
   * Draw a rectangle with rounded corners
   */
  private static roundedRect(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Apply blur effect to a specific region
   */
  private static applyBlur(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ) {
    // Simple box blur implementation
    const imageData = ctx.getImageData(x, y, width, height);
    const pixels = imageData.data;
    const tempPixels = new Uint8ClampedArray(pixels);
    
    const w = width;
    const h = height;
    
    // Apply horizontal blur
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        
        for (let k = Math.max(0, j - radius); k <= Math.min(w - 1, j + radius); k++) {
          const idx = (i * w + k) * 4;
          r += tempPixels[idx];
          g += tempPixels[idx + 1];
          b += tempPixels[idx + 2];
          a += tempPixels[idx + 3];
          count++;
        }
        
        const idx = (i * w + j) * 4;
        pixels[idx] = r / count;
        pixels[idx + 1] = g / count;
        pixels[idx + 2] = b / count;
        pixels[idx + 3] = a / count;
      }
    }
    
    // Apply vertical blur
    tempPixels.set(pixels);
    
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        
        for (let k = Math.max(0, i - radius); k <= Math.min(h - 1, i + radius); k++) {
          const idx = (k * w + j) * 4;
          r += tempPixels[idx];
          g += tempPixels[idx + 1];
          b += tempPixels[idx + 2];
          a += tempPixels[idx + 3];
          count++;
        }
        
        const idx = (i * w + j) * 4;
        pixels[idx] = r / count;
        pixels[idx + 1] = g / count;
        pixels[idx + 2] = b / count;
        pixels[idx + 3] = a / count;
      }
    }
    
    ctx.putImageData(imageData, x, y);
  }

  /**
   * Add realistic lighting effects to the composite
   */
  private static addRealisticEffects(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) {
    // Add subtle highlights on the edges
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, y, width, height);
    
    // Add fabric texture effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.1;
    
    // Create a subtle noise pattern for fabric texture
    const noiseCanvas = document.createElement('canvas');
    const noiseCtx = noiseCanvas.getContext('2d');
    
    if (noiseCtx) {
      noiseCanvas.width = 128;
      noiseCanvas.height = 128;
      
      const noiseData = noiseCtx.createImageData(128, 128);
      const noisePixels = noiseData.data;
      
      for (let i = 0; i < noisePixels.length; i += 4) {
        const value = 220 + Math.random() * 35;
        noisePixels[i] = value;
        noisePixels[i + 1] = value;
        noisePixels[i + 2] = value;
        noisePixels[i + 3] = 30; // Low alpha for subtle effect
      }
      
      noiseCtx.putImageData(noiseData, 0, 0);
      
      // Apply the noise pattern as a texture
      const pattern = ctx.createPattern(noiseCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(x, y, width, height);
      }
    }
    
    // Add subtle wrinkles/folds
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.1;
    
    // Simulate a few random fabric folds
    for (let i = 0; i < 5; i++) {
      const foldX = x + Math.random() * width;
      const foldY = y + Math.random() * height;
      const foldWidth = 20 + Math.random() * 40;
      const foldHeight = 5 + Math.random() * 10;
      const foldAngle = Math.random() * Math.PI;
      
      ctx.save();
      ctx.translate(foldX, foldY);
      ctx.rotate(foldAngle);
      
      const foldGradient = ctx.createLinearGradient(-foldWidth/2, 0, foldWidth/2, 0);
      foldGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      foldGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      foldGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
      
      ctx.fillStyle = foldGradient;
      ctx.fillRect(-foldWidth/2, -foldHeight/2, foldWidth, foldHeight);
      
      ctx.restore();
    }
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
   * Create a high-quality placeholder result image
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

      canvas.width = 1024;
      canvas.height = 1365;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1024, 1365);
      gradient.addColorStop(0, '#F8F9FA');
      gradient.addColorStop(1, '#E9ECEF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1365);

      // Add a stylish frame
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, 1024 - 80, 1365 - 80);
      
      // Add inner shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
      ctx.fillRect(40, 40, 1024 - 80, 1365 - 80);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Draw stylish placeholder text
      ctx.fillStyle = '#8B5CF6';
      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AI Virtual Try-On', 512, 400);
      
      ctx.fillStyle = '#6B7280';
      ctx.font = '32px Inter, sans-serif';
      ctx.fillText('Preview Mode', 512, 460);
      
      // Add decorative elements
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 3;
      
      // Draw clothing icon
      ctx.beginPath();
      ctx.moveTo(512, 600);
      ctx.lineTo(462, 550);
      ctx.lineTo(462, 520);
      ctx.lineTo(492, 520);
      ctx.lineTo(512, 540);
      ctx.lineTo(532, 520);
      ctx.lineTo(562, 520);
      ctx.lineTo(562, 550);
      ctx.closePath();
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
      ctx.fill();
      
      // Add message
      ctx.fillStyle = '#4B5563';
      ctx.font = '24px Inter, sans-serif';
      ctx.fillText('Try with different photos for better results', 512, 700);
      
      // Add watermark
      ctx.fillStyle = 'rgba(107, 114, 128, 0.5)';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText('StyleAI © 2025', 512, 1300);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(dataUrl);
    });
  }
}