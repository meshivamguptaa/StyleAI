import { Platform } from 'react-native';
import { ImagePreprocessingService } from './image-preprocessing-service';

export interface VirtualTryOnRequest {
  userImageUri: string;
  outfitImageUri?: string;
  outfitImageUrl?: string;
}

export interface VirtualTryOnResult {
  resultImageUrl: string;
  processingTime: number;
  success: boolean;
  error?: string;
  preprocessingDetails?: {
    userImageProcessed: boolean;
    outfitImageProcessed: boolean;
    improvements: string[];
  };
}

class PicaOSService {
  private apiUrl = 'https://api.picaos.com/v1/passthrough/v1/images/edits';
  private secretKey: string;
  private connectionKey: string;
  private actionId = 'conn_mod_def::GDzgKobnql8::UtRTNhIvQFqcEbowGSxfYQ';

  constructor() {
    this.secretKey = process.env.EXPO_PUBLIC_PICA_SECRET_KEY || '';
    this.connectionKey = process.env.EXPO_PUBLIC_PICA_OPENAI_CONNECTION_KEY || '';
  }

  async processVirtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResult> {
    const startTime = Date.now();
    let preprocessingDetails = {
      userImageProcessed: false,
      outfitImageProcessed: false,
      improvements: [] as string[],
    };

    try {
      if (!this.secretKey || !this.connectionKey) {
        throw new Error('PicaOS API keys not configured');
      }

      console.log('Starting PicaOS virtual try-on with preprocessing...');

      // Get image URLs
      const userImageUrl = request.userImageUri;
      const outfitImageUrl = request.outfitImageUrl || request.outfitImageUri;

      if (!userImageUrl || !outfitImageUrl) {
        throw new Error('Both user and outfit images are required');
      }

      // Preprocess images for better PicaOS compatibility
      let processedUserImageUrl = userImageUrl;
      let processedOutfitImageUrl = outfitImageUrl;

      try {
        console.log('Preprocessing user image...');
        const userPreprocessResult = await ImagePreprocessingService.preprocessForPicaOS(
          userImageUrl,
          'user',
          {
            targetSize: 1024,
            quality: 0.95,
            enhanceContrast: true,
            normalizeExposure: true,
            sharpen: true,
            optimizeColors: true
          }
        );
        
        processedUserImageUrl = userPreprocessResult.processedImageUrl;
        preprocessingDetails.userImageProcessed = true;
        preprocessingDetails.improvements.push(...userPreprocessResult.improvements.map(i => `User: ${i}`));
        console.log('User image preprocessing completed');
      } catch (preprocessError) {
        console.warn('User image preprocessing failed, using original:', preprocessError);
        preprocessingDetails.improvements.push('User: Preprocessing failed, using original');
      }

      try {
        console.log('Preprocessing outfit image...');
        const outfitPreprocessResult = await ImagePreprocessingService.preprocessForPicaOS(
          outfitImageUrl,
          'clothing',
          {
            targetSize: 1024,
            quality: 0.95,
            enhanceContrast: true,
            removeBackground: true,
            normalizeExposure: true,
            sharpen: true,
            optimizeColors: true
          }
        );
        
        processedOutfitImageUrl = outfitPreprocessResult.processedImageUrl;
        preprocessingDetails.outfitImageProcessed = true;
        preprocessingDetails.improvements.push(...outfitPreprocessResult.improvements.map(i => `Outfit: ${i}`));
        console.log('Outfit image preprocessing completed');
      } catch (preprocessError) {
        console.warn('Outfit image preprocessing failed, using original:', preprocessError);
        preprocessingDetails.improvements.push('Outfit: Preprocessing failed, using original');
      }

      // Create FormData object for multipart/form-data request
      const formData = new FormData();
      
      // Convert user image to blob and append to FormData
      let userBlob: Blob;
      if (processedUserImageUrl.startsWith('data:')) {
        userBlob = await this.dataUrlToBlob(processedUserImageUrl);
      } else {
        const userResponse = await fetch(processedUserImageUrl);
        userBlob = await userResponse.blob();
      }
      formData.append('image', userBlob, 'user.png');
      
      // Create a comprehensive but concise prompt
      const prompt = `Virtual try-on: Replace the clothing in the image with the outfit from the reference image. Maintain the person's pose, face, body shape, and background. Ensure realistic lighting, shadows, and fabric draping. The new clothing should fit naturally on the person's body.`;
      formData.append('prompt', prompt);
      
      // Add outfit image as reference
      if (processedOutfitImageUrl.startsWith('data:')) {
        const outfitBlob = await this.dataUrlToBlob(processedOutfitImageUrl);
        formData.append('reference_image', outfitBlob, 'outfit.png');
      } else {
        // For URL references, we need to download and append as blob
        const outfitResponse = await fetch(processedOutfitImageUrl);
        const outfitBlob = await outfitResponse.blob();
        formData.append('reference_image', outfitBlob, 'outfit.png');
      }
      
      // Set other parameters
      formData.append('model', 'dall-e-3');
      formData.append('n', '1');
      formData.append('response_format', 'url');
      formData.append('size', '1024x1024');
      formData.append('quality', 'hd');
      formData.append('style', 'natural');

      console.log('Sending multipart/form-data request to PicaOS...');

      // Send request with proper content type (multipart/form-data)
      // Note: We don't set Content-Type header - fetch will set it automatically with boundary
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'x-pica-secret': this.secretKey,
          'x-pica-connection-key': this.connectionKey,
          'x-pica-action-id': this.actionId,
          // Do NOT set Content-Type here - browser will set it with proper boundary
        },
        body: formData,
      });

      console.log('PicaOS response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PicaOS API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        throw new Error(`PicaOS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PicaOS response received');

      if (!data.data || !data.data[0] || !data.data[0].url) {
        console.error('Invalid PicaOS response:', data);
        throw new Error('Invalid response from PicaOS - no result image');
      }

      const resultImageUrl = data.data[0].url;
      const processingTime = Date.now() - startTime;
      
      console.log(`PicaOS virtual try-on completed successfully in ${processingTime}ms`);

      return {
        resultImageUrl,
        processingTime,
        success: true,
        preprocessingDetails,
      };
    } catch (error) {
      console.error('PicaOS Service Error:', error);
      const processingTime = Date.now() - startTime;
      
      return {
        resultImageUrl: '',
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : 'Virtual try-on failed',
        preprocessingDetails,
      };
    }
  }

  /**
   * Convert data URL to Blob
   */
  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    if (dataUrl.startsWith('data:')) {
      const response = await fetch(dataUrl);
      return response.blob();
    } else {
      // If it's a regular URL, fetch it
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      return response.blob();
    }
  }

  /**
   * Validate image compatibility with PicaOS
   */
  async validateImageForPicaOS(imageUrl: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // First validate with preprocessing service
      const preprocessValidation = await ImagePreprocessingService.validateImageForPreprocessing(imageUrl);
      
      if (!preprocessValidation.isValid) {
        return {
          valid: false,
          error: `Image validation failed: ${preprocessValidation.issues.join(', ')}`
        };
      }

      // Additional PicaOS-specific validations
      if (Platform.OS === 'web') {
        if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          if (blob.size > 20 * 1024 * 1024) { // 20MB limit for PicaOS
            return {
              valid: false,
              error: 'Image size must be less than 20MB for PicaOS processing'
            };
          }
          
          if (!blob.type.startsWith('image/')) {
            return {
              valid: false,
              error: 'File must be a valid image format'
            };
          }
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const picaOSService = new PicaOSService();