/**
 * PicaOS AI Service for Fashion Chat
 * Replaces Dappier with PicaOS + ElevenLabs voice synthesis
 */

import { Platform } from 'react-native';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
  isVoice?: boolean;
  voiceUrl?: string;
}

export interface FashionAnalysis {
  styleScore: number;
  colorAnalysis: string;
  fitRecommendations: string[];
  occasionSuggestions: string[];
  trendAlignment: string;
}

export interface VoiceResponse {
  audioUrl: string;
  text: string;
  voiceId: string;
}

class PicaOSAIService {
  private picaSecretKey: string;
  private picaOpenAIConnectionKey: string;
  private picaGeminiConnectionKey: string;
  private elevenLabsApiKey: string;
  private baseUrl = 'https://api.picaos.com/v1/passthrough';

  constructor() {
    this.picaSecretKey = process.env.EXPO_PUBLIC_PICA_SECRET_KEY || '';
    this.picaOpenAIConnectionKey = process.env.EXPO_PUBLIC_PICA_OPENAI_CONNECTION_KEY || '';
    this.picaGeminiConnectionKey = process.env.EXPO_PUBLIC_PICA_GEMINI_CONNECTION_KEY || '';
    this.elevenLabsApiKey = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY || '';
  }

  async sendChatMessage(
    message: string, 
    conversationHistory: ChatMessage[] = [],
    imageUri?: string
  ): Promise<string> {
    try {
      // Check if API keys are available
      if (!this.picaSecretKey || !this.picaOpenAIConnectionKey) {
        console.warn('PicaOS API keys not found, using fallback response');
        return this.getFallbackResponse(message);
      }

      // Build context from conversation history
      const context = this.buildConversationContext(conversationHistory, message, imageUri);
      
      console.log('Sending request to PicaOS OpenAI:', {
        endpoint: `${this.baseUrl}/v1/chat/completions`,
        hasSecretKey: !!this.picaSecretKey,
        hasConnectionKey: !!this.picaOpenAIConnectionKey,
        messageLength: context.length
      });

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pica-secret': this.picaSecretKey,
          'x-pica-connection-key': this.picaOpenAIConnectionKey,
          'x-pica-action-id': 'conn_mod_def::GDzgKobnql8::UtRTNhIvQFqcEbowGSxfYQ',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: context
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      console.log('PicaOS response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PicaOS API error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Return fallback response instead of throwing
        return this.getFallbackResponse(message);
      }

      const data = await response.json();
      console.log('PicaOS response data:', data);
      
      const aiResponse = data.choices?.[0]?.message?.content || this.getFallbackResponse(message);
      return aiResponse;
    } catch (error) {
      console.error('PicaOS AI Service Error:', error);
      return this.getFallbackResponse(message);
    }
  }

  async sendChatMessageWithVoice(
    message: string, 
    conversationHistory: ChatMessage[] = [],
    imageUri?: string,
    voiceId: string = 'pMsXgVXv3BLzUgSXRplE' // Using Serena voice ID
  ): Promise<VoiceResponse> {
    try {
      // Get text response first
      const textResponse = await this.sendChatMessage(message, conversationHistory, imageUri);
      
      // Generate voice if ElevenLabs key is available
      if (this.elevenLabsApiKey) {
        const audioUrl = await this.generateVoice(textResponse, voiceId);
        return {
          audioUrl,
          text: textResponse,
          voiceId,
        };
      }

      // Return text-only response if voice generation fails
      return {
        audioUrl: '',
        text: textResponse,
        voiceId,
      };
    } catch (error) {
      console.error('Voice chat error:', error);
      const fallbackText = this.getFallbackResponse(message);
      return {
        audioUrl: '',
        text: fallbackText,
        voiceId,
      };
    }
  }

  async generateVoice(text: string, voiceId: string = 'pMsXgVXv3BLzUgSXRplE'): Promise<string> {
    try {
      if (!this.elevenLabsApiKey) {
        console.warn('ElevenLabs API key not found');
        return '';
      }

      console.log('Generating voice with ElevenLabs:', { voiceId, textLength: text.length });

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return '';
      }

      // Convert response to blob and create object URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('Voice generated successfully');
      return audioUrl;
    } catch (error) {
      console.error('Voice generation error:', error);
      return '';
    }
  }

  async analyzeFashionImage(imageUri: string): Promise<FashionAnalysis> {
    try {
      if (!this.picaSecretKey || !this.picaGeminiConnectionKey) {
        return this.getFallbackAnalysis();
      }

      const analysisPrompt = `Analyze this fashion image and provide:
      1. A style score out of 10
      2. Color analysis and recommendations
      3. Fit recommendations
      4. Occasion suggestions
      5. Trend alignment assessment
      
      Respond in a structured format with clear sections.`;

      console.log('Analyzing fashion image with PicaOS Gemini');

      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add prompt as a text part
      formData.append('prompt', analysisPrompt);
      
      // Add image as a file part
      let imageBlob: Blob;
      if (imageUri.startsWith('data:')) {
        imageBlob = await this.dataUrlToBlob(imageUri);
      } else {
        const response = await fetch(imageUri);
        imageBlob = await response.blob();
      }
      formData.append('image', imageBlob, 'fashion_image.jpg');

      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type - browser will set it with boundary
          'x-pica-secret': this.picaSecretKey,
          'x-pica-connection-key': this.picaGeminiConnectionKey,
          'x-pica-action-id': 'conn_mod_def::GCmd5BQE388::PISTzTbvRSqXx0N0rMa-Lw',
        },
        body: formData,
      });

      if (!response.ok) {
        console.error('Fashion analysis error:', response.status);
        return this.getFallbackAnalysis();
      }

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse the AI response to extract structured data
      return this.parseAnalysisResponse(analysisText);
    } catch (error) {
      console.error('Fashion Analysis Error:', error);
      return this.getFallbackAnalysis();
    }
  }

  async getRealTimeSuggestions(context: string, userPreferences?: any): Promise<string[]> {
    try {
      if (!this.picaSecretKey || !this.picaOpenAIConnectionKey) {
        return this.getFallbackSuggestions();
      }

      const suggestionsPrompt = `Based on this context: "${context}", provide 5 real-time fashion suggestions. 
      Focus on practical, actionable advice for styling, color coordination, or outfit improvements.
      ${userPreferences ? `User preferences: ${JSON.stringify(userPreferences)}` : ''}
      
      Respond with a numbered list of suggestions.`;

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pica-secret': this.picaSecretKey,
          'x-pica-connection-key': this.picaOpenAIConnectionKey,
          'x-pica-action-id': 'conn_mod_def::GDzgKobnql8::UtRTNhIvQFqcEbowGSxfYQ',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful fashion assistant. Provide concise, actionable styling suggestions.'
            },
            {
              role: 'user',
              content: suggestionsPrompt
            }
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        console.error('Suggestions error:', response.status);
        return this.getFallbackSuggestions();
      }

      const data = await response.json();
      const suggestionsText = data.choices?.[0]?.message?.content || '';
      
      return this.extractSuggestions(suggestionsText);
    } catch (error) {
      console.error('Real-time Suggestions Error:', error);
      return this.getFallbackSuggestions();
    }
  }

  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  private getSystemPrompt(): string {
    return `You are StyleAI, an expert fashion advisor and personal stylist. You specialize in:
    - Fashion advice and styling tips
    - Color coordination and matching
    - Outfit recommendations for different occasions
    - Body type and fit guidance
    - Current fashion trends and seasonal styles
    - Shopping recommendations
    - Wardrobe organization
    - Virtual try-on analysis and feedback
    
    Be friendly, knowledgeable, and provide specific, actionable advice. Keep responses concise but helpful.
    Use emojis when appropriate to make conversations engaging. Adapt your tone to be modern and relatable.`;
  }

  private buildConversationContext(
    history: ChatMessage[], 
    newMessage: string, 
    imageUri?: string
  ): string {
    let context = 'Conversation:\n';

    // Add recent conversation history (last 5 messages to keep context manageable)
    const recentHistory = history.slice(-5);
    recentHistory.forEach(msg => {
      context += `${msg.isUser ? 'User' : 'StyleAI'}: ${msg.text}\n`;
    });

    // Add current message
    if (imageUri) {
      context += `User: ${newMessage} [Image attached]\n`;
    } else {
      context += `User: ${newMessage}\n`;
    }

    return context;
  }

  private parseAnalysisResponse(analysisText: string): FashionAnalysis {
    // Extract structured data from AI response
    const scoreMatch = analysisText.match(/score[:\s]*(\d+(?:\.\d+)?)/i);
    const styleScore = scoreMatch ? parseFloat(scoreMatch[1]) : 7.5;

    return {
      styleScore,
      colorAnalysis: this.extractSection(analysisText, 'color') || 'Great color choices that complement your style!',
      fitRecommendations: this.extractListItems(analysisText, 'fit|recommendation') || ['Consider the fit around the waist', 'The length is perfect for your body type'],
      occasionSuggestions: this.extractListItems(analysisText, 'occasion|event') || ['Casual outings', 'Weekend events'],
      trendAlignment: this.extractSection(analysisText, 'trend') || 'Well-aligned with current fashion trends'
    };
  }

  private extractSection(text: string, keyword: string): string {
    const regex = new RegExp(`${keyword}[^.]*[.]`, 'i');
    const match = text.match(regex);
    return match ? match[0] : '';
  }

  private extractListItems(text: string, keyword: string): string[] {
    const lines = text.split('\n');
    const items: string[] = [];
    
    for (const line of lines) {
      if (line.includes(keyword) || line.match(/^\d+\.|^-|^\*/)) {
        const cleaned = line.replace(/^\d+\.|^-|^\*/, '').trim();
        if (cleaned) items.push(cleaned);
      }
    }
    
    return items.length > 0 ? items : [];
  }

  private extractSuggestions(text: string): string[] {
    const suggestions = this.extractListItems(text, 'suggest|recommend|try|consider');
    return suggestions.length > 0 ? suggestions.slice(0, 5) : this.getFallbackSuggestions();
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('color')) {
      return "For color coordination, try complementary colors or stick to a monochromatic palette! 🎨 What specific colors are you working with?";
    } else if (lowerMessage.includes('outfit') || lowerMessage.includes('style')) {
      return "I'd love to help with your outfit! ✨ Consider your body type, the occasion, and current trends. What's the specific event or look you're going for?";
    } else if (lowerMessage.includes('trend')) {
      return "Current trends include oversized blazers, earth tones, and sustainable fashion! 🌿 What type of trends are you most interested in?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! 👋 I'm your AI fashion assistant powered by advanced AI. I can help you with styling advice, color coordination, outfit recommendations, and fashion trends. What would you like to know about fashion today?";
    } else {
      return "I'm here to help with all your fashion needs! 💫 Feel free to ask about styling, colors, trends, or upload a photo for personalized advice.";
    }
  }

  private getFallbackAnalysis(): FashionAnalysis {
    return {
      styleScore: 7.5,
      colorAnalysis: 'Great color choices that complement your style!',
      fitRecommendations: ['Consider the fit around the waist', 'The length is perfect for your body type'],
      occasionSuggestions: ['Casual outings', 'Weekend events'],
      trendAlignment: 'Well-aligned with current fashion trends'
    };
  }

  private getFallbackSuggestions(): string[] {
    return [
      'Try adding a statement accessory ✨',
      'Consider layering for depth 🧥',
      'Experiment with different textures 🪶',
      'Add a pop of color with shoes or bag 👠',
      'Try tucking in your top for a polished look 👔'
    ];
  }
}

export const picaOSAIService = new PicaOSAIService();