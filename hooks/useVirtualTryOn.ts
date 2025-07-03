import { useState, useCallback } from 'react';
import { HybridTryOnService, HybridTryOnResult } from '@/lib/hybrid-tryon-service';
import { MediaUploadService } from '@/lib/media-upload';
import { ImagePreprocessingService } from '@/lib/image-preprocessing-service';
import { useAuth } from './useAuth';
import { useTryOnPersistence } from './useTryOnPersistence';

export interface TryOnProgress {
  step: string;
  progress: number;
  details?: string;
}

export function useVirtualTryOn() {
  const { user } = useAuth();
  const { createTryOnSession, updateTryOnSession } = useTryOnPersistence();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<HybridTryOnResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processVirtualTryOn = useCallback(async (request: { 
    userImageUri: string; 
    outfitImageUri?: string; 
    outfitImageUrl?: string 
  }) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    let sessionId: string | null = null;

    try {
      const userId = user?.id || 'temp_user';

      // Step 1: Validating images
      setCurrentStep('Validating images for optimal processing...');
      setProgress(5);
      
      const userImageValidation = await MediaUploadService.validateFile(
        request.userImageUri,
        'image',
        10
      );
      
      if (!userImageValidation.valid) {
        throw new Error(`User image validation failed: ${userImageValidation.error}`);
      }

      setProgress(10);

      if (request.outfitImageUri) {
        const outfitImageValidation = await MediaUploadService.validateFile(
          request.outfitImageUri,
          'image',
          10
        );
        
        if (!outfitImageValidation.valid) {
          throw new Error(`Outfit image validation failed: ${outfitImageValidation.error}`);
        }
      }

      setProgress(15);

      // Step 2: Image quality assessment
      setCurrentStep('Analyzing image quality and compatibility...');
      setProgress(20);

      try {
        const userQualityCheck = await ImagePreprocessingService.validateImageForPreprocessing(request.userImageUri);
        if (!userQualityCheck.isValid) {
          console.warn('User image quality issues:', userQualityCheck.issues);
          setCurrentStep('User image has quality issues, but proceeding...');
        }

        const outfitImageUrl = request.outfitImageUrl || request.outfitImageUri;
        if (outfitImageUrl) {
          const outfitQualityCheck = await ImagePreprocessingService.validateImageForPreprocessing(outfitImageUrl);
          if (!outfitQualityCheck.isValid) {
            console.warn('Outfit image quality issues:', outfitQualityCheck.issues);
            setCurrentStep('Outfit image has quality issues, but proceeding...');
          }
        }
      } catch (qualityError) {
        console.warn('Quality check failed, but proceeding:', qualityError);
      }

      setProgress(25);

      // Step 3: Uploading images
      setCurrentStep('Uploading and optimizing images...');
      setProgress(30);
      
      let userImageUrl = request.userImageUri;
      if (!request.userImageUri.startsWith('http')) {
        const userUploadResult = await MediaUploadService.uploadTryOnImage(
          request.userImageUri,
          userId,
          'user'
        );
        
        if (userUploadResult.error) {
          throw new Error(`Failed to upload user image: ${userUploadResult.error}`);
        }
        
        userImageUrl = userUploadResult.url;
      }

      setProgress(50);

      let outfitImageUrl = request.outfitImageUrl;
      if (request.outfitImageUri && !request.outfitImageUri.startsWith('http')) {
        const outfitUploadResult = await MediaUploadService.uploadTryOnImage(
          request.outfitImageUri,
          userId,
          'outfit'
        );
        
        if (outfitUploadResult.error) {
          throw new Error(`Failed to upload outfit image: ${outfitUploadResult.error}`);
        }
        
        outfitImageUrl = outfitUploadResult.url;
      }

      if (!outfitImageUrl) {
        throw new Error('No outfit image provided');
      }

      setProgress(60);

      // Step 4: Create try-on session
      setCurrentStep('Creating virtual try-on session...');
      if (user) {
        sessionId = await createTryOnSession(userImageUrl, outfitImageUrl);
      }

      // Step 5: Processing with enhanced hybrid service
      setCurrentStep('Processing with advanced AI virtual try-on...');
      setProgress(70);
      
      const tryOnResult = await HybridTryOnService.processVirtualTryOn({
        userImageUri: userImageUrl,
        outfitImageUrl: outfitImageUrl,
        outfitImageUri: undefined,
      });
      
      setProgress(95);

      // Step 6: Update session with results
      setCurrentStep('Finalizing results and saving...');
      if (user && sessionId) {
        await updateTryOnSession(sessionId, {
          resultImageUrl: tryOnResult.resultImageUrl,
          processingStatus: 'completed',
          aiScore: tryOnResult.qualityScore || (tryOnResult.method === 'picaos' ? 9.5 : 7.5),
          aiFeedback: {
            processingTime: tryOnResult.processingTime,
            method: tryOnResult.method,
            fallbackReason: tryOnResult.fallbackReason,
            explanation: HybridTryOnService.getResultExplanation(tryOnResult),
            qualityScore: tryOnResult.qualityScore,
            preprocessingApplied: tryOnResult.preprocessingApplied,
            suggestions: HybridTryOnService.getQualityImprovementSuggestions(tryOnResult),
          },
        });
      }

      setCurrentStep('Virtual try-on complete!');
      setProgress(100);
      
      setResult(tryOnResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Virtual try-on failed';
      setError(errorMessage);
      console.error('Virtual try-on error:', err);

      if (user && sessionId) {
        try {
          await updateTryOnSession(sessionId, {
            processingStatus: 'failed',
            aiFeedback: {
              error: errorMessage,
              timestamp: new Date().toISOString(),
              suggestions: [
                'Try with higher quality images',
                'Ensure good lighting conditions',
                'Use a plain background',
                'Make sure the person is clearly visible',
              ],
            },
          });
        } catch (updateError) {
          console.error('Failed to update session with error:', updateError);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [user, createTryOnSession, updateTryOnSession]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setCurrentStep('');
    setResult(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    progress,
    currentStep,
    result,
    error,
    processVirtualTryOn,
    reset,
  };
}