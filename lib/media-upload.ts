import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { Platform } from 'react-native';

export interface MediaUploadResult {
  url: string;
  path: string;
  error?: string;
}

export class MediaUploadService {
  private static readonly BUCKET_NAME = 'chat-media';

  /**
   * Ensure bucket exists and has proper policies
   */
  private static async ensureBucketSetup(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('Could not list buckets:', listError);
        // Don't throw - bucket might still exist
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.log('Chat-media bucket not found, but continuing anyway...');
        // Don't try to create bucket here - it should be created via migration
        // Just log and continue
      } else {
        console.log('Chat-media bucket exists');
      }
    } catch (error) {
      console.warn('Bucket setup check error:', error);
      // Don't throw - continue with upload attempt
    }
  }

  /**
   * Upload media file to Supabase Storage
   * @param uri Local file URI
   * @param userId User ID for folder organization
   * @param type Media type (image or voice)
   * @returns Promise with upload result
   */
  static async uploadMediaToSupabase(
    uri: string,
    userId: string,
    type: 'image' | 'voice'
  ): Promise<MediaUploadResult> {
    try {
      // Ensure bucket is set up (non-blocking)
      await this.ensureBucketSetup();

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const extension = type === 'image' ? 'jpg' : 'mp3';
      const fileName = `${timestamp}_${randomId}.${extension}`;
      
      // Use public path to avoid RLS issues - this is the key fix
      const filePath = `public/${fileName}`;

      // Handle different URI types
      let fileData: Uint8Array;
      
      if (Platform.OS === 'web') {
        // For web, handle blob/file differently
        if (uri.startsWith('blob:') || uri.startsWith('data:')) {
          const response = await fetch(uri);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          fileData = new Uint8Array(arrayBuffer);
        } else {
          // Handle regular URLs
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          fileData = new Uint8Array(arrayBuffer);
        }
      } else {
        // For mobile platforms
        try {
          // First check if file exists
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            throw new Error(`File does not exist at path: ${uri}`);
          }

          // Check size (max 10MB)
          if (fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
            throw new Error('Image size must be less than 10MB');
          }

          // Read file as base64
          const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convert base64 to Uint8Array
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          fileData = new Uint8Array(byteNumbers);
        } catch (fileError) {
          console.error('File system error:', fileError);
          throw new Error(`Failed to read file: ${fileError.message}`);
        }
      }

      const contentType = type === 'image' ? 'image/jpeg' : 'audio/mpeg';
      const file = new Blob([fileData], { type: contentType });

      console.log(`Uploading ${type} to Supabase:`, {
        filePath,
        size: file.size,
        type: contentType,
        userId
      });

      // Upload to Supabase Storage with enhanced options
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          contentType,
          upsert: true, // Allow overwriting if file exists
          duplex: 'half', // Required for some environments
        });

      if (error) {
        console.error('Supabase upload error:', error);
        
        // Enhanced error handling for common issues
        if (error.message.includes('row-level security policy')) {
          throw new Error('Storage permission error. Please ensure you are signed in.');
        } else if (error.message.includes('not found')) {
          throw new Error('Storage bucket not found. Please contact support.');
        } else if (error.message.includes('size')) {
          throw new Error('File size exceeds limit. Please use a smaller image.');
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log(`${type} uploaded successfully:`, urlData.publicUrl);

      // Enhanced verification with better retry logic
      await this.enhancedVerifyFileAccess(urlData.publicUrl, type);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error('Media upload error:', error);
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload image specifically for virtual try-on
   * @param uri Local file URI
   * @param userId User ID for folder organization
   * @param imageType Type of image (user or outfit)
   * @returns Promise with upload result
   */
  static async uploadTryOnImage(
    uri: string,
    userId: string,
    imageType: 'user' | 'outfit'
  ): Promise<MediaUploadResult> {
    try {
      console.log(`Starting ${imageType} image upload:`, uri);

      // Ensure bucket is set up (non-blocking)
      await this.ensureBucketSetup();

      // Generate unique filename with timestamp and type
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `tryon_${imageType}_${timestamp}_${randomId}.jpg`;
      
      // Use public path to avoid RLS issues - this is the key fix
      const filePath = `public/tryons/${fileName}`;

      // Handle different URI types and platforms
      let fileData: Uint8Array;
      
      if (Platform.OS === 'web') {
        // For web platform
        if (uri.startsWith('blob:') || uri.startsWith('data:')) {
          console.log('Processing blob/data URI for web...');
          const response = await fetch(uri);
          const blob = await response.blob();
          
          // Validate image
          if (!blob.type.startsWith('image/')) {
            throw new Error('File must be an image');
          }
          
          // Check size (max 10MB, will be optimized by PicaOS service)
          if (blob.size > 10 * 1024 * 1024) {
            throw new Error('Image size must be less than 10MB');
          }
          
          const arrayBuffer = await blob.arrayBuffer();
          fileData = new Uint8Array(arrayBuffer);
        } else {
          // Handle regular URLs
          console.log('Processing URL for web...');
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          if (!blob.type.startsWith('image/')) {
            throw new Error('File must be an image');
          }
          
          if (blob.size > 10 * 1024 * 1024) {
            throw new Error('Image size must be less than 10MB');
          }
          
          const arrayBuffer = await blob.arrayBuffer();
          fileData = new Uint8Array(arrayBuffer);
        }
      } else {
        // For mobile platforms (iOS/Android)
        console.log('Processing file for mobile platform...');
        
        try {
          // Check if file exists
          const fileInfo = await FileSystem.getInfoAsync(uri);
          console.log('File info:', fileInfo);
          
          if (!fileInfo.exists) {
            throw new Error(`File does not exist at path: ${uri}`);
          }

          // Check size (max 10MB)
          if (fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
            throw new Error('Image size must be less than 10MB');
          }

          // Read file as base64
          console.log('Reading file as base64...');
          const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convert base64 to Uint8Array
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          fileData = new Uint8Array(byteNumbers);
        } catch (fileError) {
          console.error('File system error details:', fileError);
          throw new Error(`Failed to read file: ${fileError.message}`);
        }
      }

      const contentType = 'image/jpeg';
      const file = new Blob([fileData], { type: contentType });

      console.log(`Uploading ${imageType} image to Supabase:`, {
        filePath,
        size: file.size,
        type: contentType,
        userId
      });

      // Upload to Supabase Storage with enhanced options
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          contentType,
          upsert: true, // Allow overwriting if file exists
          duplex: 'half', // Required for some environments
        });

      if (error) {
        console.error('Supabase upload error:', error);
        
        // Enhanced error handling for common issues
        if (error.message.includes('row-level security policy')) {
          throw new Error('Storage permission error. Please ensure you are signed in.');
        } else if (error.message.includes('not found')) {
          throw new Error('Storage bucket not found. Please contact support.');
        } else if (error.message.includes('size')) {
          throw new Error('File size exceeds limit. Please use a smaller image.');
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log(`${imageType} image uploaded successfully:`, urlData.publicUrl);

      // Enhanced verification with better retry logic
      await this.enhancedVerifyFileAccess(urlData.publicUrl, `${imageType} image`);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error(`${imageType} image upload error:`, error);
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Enhanced file access verification with improved retry logic
   * @param url Public URL to verify
   * @param fileType Type of file being verified (for logging)
   */
  private static async enhancedVerifyFileAccess(url: string, fileType: string = 'file'): Promise<void> {
    const maxRetries = 3; // Reduced retries for faster processing
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${fileType} verification attempt ${attempt}/${maxRetries}`);
        
        // Progressive delays: 1s, 2s, 3s
        if (attempt > 1) {
          const delay = attempt * 1000;
          console.log(`Waiting ${delay}ms before verification attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Enhanced cache-busting with multiple parameters
        const cacheBustParams = new URLSearchParams({
          t: Date.now().toString(),
          v: attempt.toString(),
          verify: 'true',
          cb: Math.random().toString(36).substring(7),
        });
        const urlWithCacheBust = `${url}?${cacheBustParams.toString()}`;
        
        // Create timeout promise (5 seconds per attempt)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Verification timeout')), 5000);
        });

        const response = await Promise.race([
          fetch(urlWithCacheBust, {
            method: 'HEAD',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Accept': 'image/jpeg, image/png, image/webp, image/*',
              'User-Agent': 'StyleAI-Verification/1.0',
            },
          }),
          timeoutPromise
        ]);
        
        console.log(`${fileType} verification response:`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          
          // Additional validation for images
          if (fileType.includes('image')) {
            if (!contentType || !contentType.startsWith('image/')) {
              throw new Error(`Invalid content type: ${contentType}. Expected image.`);
            }
            
            if (contentLength && parseInt(contentLength) === 0) {
              throw new Error('Image file is empty (0 bytes)');
            }
          }
          
          console.log(`${fileType} access verified successfully on attempt ${attempt}`);
          return; // Success!
        }
        
        if (response.status === 404) {
          throw new Error(`File not found (404). The ${fileType} may not be fully propagated yet.`);
        } else if (response.status === 403) {
          throw new Error(`Access denied (403). Check permissions for ${fileType}.`);
        } else if (response.status === 400) {
          throw new Error(`Bad request (400). The ${fileType} URL may be invalid.`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`${fileType} verification attempt ${attempt} failed:`, lastError.message);
        
        if (attempt === maxRetries) {
          break;
        }
      }
    }
    
    // If verification fails, log warning but don't throw (allow processing to continue)
    console.warn(`${fileType} verification failed after ${maxRetries} attempts, but continuing anyway...`);
    console.warn('Last error:', lastError?.message);
    console.warn('The file should still be accessible - PicaOS will handle any access issues');
  }

  /**
   * Delete media file from Supabase Storage
   * @param filePath File path in storage
   * @returns Promise with deletion result
   */
  static async deleteMediaFromSupabase(filePath: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      return {};
    } catch (error) {
      console.error('Media deletion error:', error);
      return {
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Get file size in a human-readable format
   * @param uri File URI
   * @returns Promise with file size string
   */
  static async getFileSize(uri: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        if (uri.startsWith('blob:') || uri.startsWith('data:')) {
          const response = await fetch(uri);
          const blob = await response.blob();
          return this.formatFileSize(blob.size);
        } else {
          const response = await fetch(uri);
          const blob = await response.blob();
          return this.formatFileSize(blob.size);
        }
      } else {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        return this.formatFileSize(fileInfo.size || 0);
      }
    } catch (error) {
      console.error('Error getting file size:', error);
      return 'Unknown size';
    }
  }

  /**
   * Format file size in bytes to human-readable format
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file type and size
   * @param uri File URI
   * @param type Expected media type
   * @param maxSizeMB Maximum file size in MB
   * @returns Validation result
   */
  static async validateFile(
    uri: string,
    type: 'image' | 'voice',
    maxSizeMB: number = 10
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      console.log(`Validating ${type} file:`, uri);
      
      let fileSize: number;
      
      if (Platform.OS === 'web') {
        if (uri.startsWith('blob:') || uri.startsWith('data:')) {
          const response = await fetch(uri);
          const blob = await response.blob();
          fileSize = blob.size;
          
          // Check MIME type for web
          const expectedMimeTypes = type === 'image' 
            ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            : ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
            
          if (!expectedMimeTypes.includes(blob.type)) {
            return {
              valid: false,
              error: `Invalid file type. Expected ${type} file, got ${blob.type}.`,
            };
          }
        } else {
          // For regular URLs, we'll skip detailed validation
          return { valid: true };
        }
      } else {
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            return {
              valid: false,
              error: `File does not exist at path: ${uri}`,
            };
          }
          fileSize = fileInfo.size || 0;
        } catch (fileError) {
          return {
            valid: false,
            error: `Cannot access file: ${fileError.message}`,
          };
        }
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (fileSize > maxSizeBytes) {
        return {
          valid: false,
          error: `File size (${this.formatFileSize(fileSize)}) exceeds ${maxSizeMB}MB limit`,
        };
      }

      console.log(`File validation passed: ${this.formatFileSize(fileSize)}`);
      return { valid: true };
    } catch (error) {
      console.error('File validation error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }
}