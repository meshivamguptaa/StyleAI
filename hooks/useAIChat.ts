import { useState, useCallback } from 'react';
import { picaOSAIService, ChatMessage, FashionAnalysis, VoiceResponse } from '@/lib/picaos-ai-service';
import { useChatPersistence } from './useChatPersistence';
import { MediaUploadService } from '@/lib/media-upload';

export function useAIChat() {
  const { messages, saveMessage, currentSessionId, startNewSession, error: persistenceError, loading } = useChatPersistence();
  const [isTyping, setIsTyping] = useState(false);
  const [realTimeSuggestions, setRealTimeSuggestions] = useState<string[]>([]);

  const sendMessage = useCallback(async (
    text: string, 
    mediaUri?: string, 
    isVoice?: boolean,
    imageUri?: string,
    voiceDuration?: number,
    enableVoiceResponse?: boolean
  ) => {
    if (!text.trim() && !mediaUri) return;

    let uploadedMediaUrl: string | undefined;

    // Handle media upload if provided
    if (mediaUri) {
      try {
        // Get user ID from the first message or generate a temporary one
        const userId = 'user_temp'; // In real app, get from auth
        
        const mediaType = isVoice ? 'voice' : 'image';
        const uploadResult = await MediaUploadService.uploadMediaToSupabase(
          mediaUri, 
          userId, 
          mediaType
        );

        if (uploadResult.error) {
          console.error('Media upload failed:', uploadResult.error);
        } else {
          uploadedMediaUrl = uploadResult.url;
        }
      } catch (error) {
        console.error('Media upload error:', error);
      }
    }

    // Save user message
    const userMessage = await saveMessage({
      text: text || (isVoice ? 'Voice message' : 'Image'),
      isUser: true,
      imageUrl: !isVoice ? (uploadedMediaUrl || imageUri) : undefined,
      voiceUrl: isVoice ? uploadedMediaUrl : undefined,
      isVoice,
      voiceDuration,
    });

    if (!userMessage) return;

    setIsTyping(true);

    try {
      let response: string;
      let voiceUrl: string | undefined;

      if (enableVoiceResponse) {
        // Get response with voice
        const voiceResponse: VoiceResponse = await picaOSAIService.sendChatMessageWithVoice(
          text || (isVoice ? 'Voice message received' : 'Image received'), 
          messages, 
          uploadedMediaUrl || imageUri
        );
        
        response = voiceResponse.text;
        voiceUrl = voiceResponse.audioUrl;
      } else {
        // Get text-only response
        response = await picaOSAIService.sendChatMessage(
          text || (isVoice ? 'Voice message received' : 'Image received'), 
          messages, 
          uploadedMediaUrl || imageUri
        );
      }
      
      // Save AI response
      await saveMessage({
        text: response,
        isUser: false,
        voiceUrl: voiceUrl,
        isVoice: !!voiceUrl,
      });

      // Get real-time suggestions based on the conversation
      if (uploadedMediaUrl || imageUri || text.toLowerCase().includes('outfit') || text.toLowerCase().includes('style')) {
        const suggestions = await picaOSAIService.getRealTimeSuggestions(text || 'media message');
        setRealTimeSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Chat error:', error);
      await saveMessage({
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
      });
    } finally {
      setIsTyping(false);
    }
  }, [messages, saveMessage]);

  const analyzeFashion = useCallback(async (imageUri: string): Promise<FashionAnalysis> => {
    try {
      return await picaOSAIService.analyzeFashionImage(imageUri);
    } catch (error) {
      console.error('Fashion analysis failed:', error);
      throw error;
    }
  }, []);

  const getRealTimeSuggestions = useCallback(async (context: string) => {
    try {
      const suggestions = await picaOSAIService.getRealTimeSuggestions(context);
      setRealTimeSuggestions(suggestions);
      return suggestions;
    } catch (error) {
      console.error('Failed to get real-time suggestions:', error);
      return [];
    }
  }, []);

  const generateVoiceResponse = useCallback(async (text: string, voiceId: string = 'pMsXgVXv3BLzUgSXRplE') => {
    try {
      return await picaOSAIService.generateVoice(text, voiceId);
    } catch (error) {
      console.error('Voice generation failed:', error);
      return '';
    }
  }, []);

  const createNewChatSession = useCallback(() => {
    setRealTimeSuggestions([]); // Clear suggestions on new session
    return startNewSession();
  }, [startNewSession]);

  return {
    messages,
    isTyping,
    realTimeSuggestions,
    currentSessionId,
    error: persistenceError,
    loading,
    sendMessage,
    analyzeFashion,
    getRealTimeSuggestions,
    generateVoiceResponse,
    createNewChatSession,
  };
}