import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  voiceUrl?: string;
  isVoice?: boolean;
  voiceDuration?: number;
  sessionId?: string;
  aiAnalysis?: any;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
}

export function useChatPersistence() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history when user logs in
  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      setMessages([]);
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [user]);

  const loadChatHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First, try to query with a simple select to test table existence
      const { data: testData, error: testError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Table test error:', testError);
        
        // Check if it's a table not found error
        if (testError.code === 'PGRST116' || testError.message.includes('does not exist')) {
          console.log('Chat messages table does not exist yet - using empty state');
          setMessages([]);
          setSessions([]);
          return;
        }
        
        // For other errors, show user-friendly message
        setError('Chat is currently unavailable. Please try again later.');
        setMessages([]);
        setSessions([]);
        return;
      }

      // Now try to load the actual messages with all columns
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          id,
          user_id,
          message_text,
          is_user_message,
          message_type,
          image_url,
          voice_url,
          voice_duration,
          session_id,
          ai_analysis,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        
        // Check for specific column errors
        if (messagesError.code === '42703') {
          console.log('Column does not exist, trying alternative query...');
          
          // Try with minimal columns that should exist
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('chat_messages')
            .select(`
              id,
              user_id,
              message_text,
              is_user_message
            `)
            .eq('user_id', user.id)
            .limit(50);

          if (fallbackError) {
            setError('Chat is currently unavailable. Please try again later.');
            setMessages([]);
            setSessions([]);
            return;
          }

          // Convert fallback data to ChatMessage format
          const fallbackMessages: ChatMessage[] = (fallbackData || []).map((msg, index) => ({
            id: msg.id,
            text: msg.message_text || '',
            isUser: msg.is_user_message,
            timestamp: new Date(Date.now() - (fallbackData.length - index) * 60000), // Fake timestamps
            sessionId: 'fallback-session',
          }));

          setMessages(fallbackMessages);
          setSessions([]);
          return;
        }
        
        // For other errors, show user-friendly message
        setError('Chat is currently unavailable. Please try again later.');
        setMessages([]);
        setSessions([]);
        return;
      }

      // Convert to ChatMessage format
      const chatMessages: ChatMessage[] = (messagesData || []).map(msg => ({
        id: msg.id,
        text: msg.message_text || '',
        isUser: msg.is_user_message,
        timestamp: new Date(msg.created_at),
        imageUrl: msg.image_url,
        voiceUrl: msg.voice_url,
        isVoice: msg.message_type === 'voice',
        voiceDuration: msg.voice_duration,
        sessionId: msg.session_id,
        aiAnalysis: msg.ai_analysis,
      }));

      setMessages(chatMessages);

      // Group messages by session
      const sessionMap = new Map<string, ChatMessage[]>();
      chatMessages.forEach(msg => {
        const sessionId = msg.sessionId || 'default';
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, []);
        }
        sessionMap.get(sessionId)!.push(msg);
      });

      // Convert to ChatSession format
      const chatSessions: ChatSession[] = Array.from(sessionMap.entries()).map(([sessionId, msgs]) => ({
        id: sessionId,
        messages: msgs,
        createdAt: new Date(Math.min(...msgs.map(m => m.timestamp.getTime()))),
        lastMessageAt: new Date(Math.max(...msgs.map(m => m.timestamp.getTime()))),
      }));

      setSessions(chatSessions.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()));

      // Set current session to the most recent one
      if (chatSessions.length > 0) {
        setCurrentSessionId(chatSessions[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Chat is currently unavailable. Please try again later.');
      setMessages([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user) return null;

    try {
      const sessionId = currentSessionId || generateSessionId();
      
      // Create message locally first for immediate UI update
      const localMessage: ChatMessage = {
        id: generateMessageId(),
        text: message.text,
        isUser: message.isUser,
        timestamp: new Date(),
        imageUrl: message.imageUrl,
        voiceUrl: message.voiceUrl,
        isVoice: message.isVoice,
        voiceDuration: message.voiceDuration,
        sessionId: sessionId,
        aiAnalysis: message.aiAnalysis,
      };

      setMessages(prev => [...prev, localMessage]);
      
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      // Try to save to database
      try {
        const messageData = {
          user_id: user.id,
          message_text: message.text,
          is_user_message: message.isUser,
          message_type: message.isVoice ? 'voice' : (message.imageUrl ? 'image' : 'text'),
          image_url: message.imageUrl,
          voice_url: message.voiceUrl,
          voice_duration: message.voiceDuration,
          session_id: sessionId,
          ai_analysis: message.aiAnalysis,
        };

        const { data, error } = await supabase
          .from('chat_messages')
          .insert(messageData)
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          // Message is already in local state, so we can continue
        } else {
          // Update the local message with the database ID
          setMessages(prev => prev.map(msg => 
            msg.id === localMessage.id 
              ? { ...msg, id: data.id, timestamp: new Date(data.created_at) }
              : msg
          ));
        }
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Message is already in local state, so we can continue
      }

      return localMessage;
    } catch (err) {
      console.error('Failed to save message:', err);
      
      // Still create the message locally
      const sessionId = currentSessionId || generateSessionId();
      const newMessage: ChatMessage = {
        id: generateMessageId(),
        text: message.text,
        isUser: message.isUser,
        timestamp: new Date(),
        imageUrl: message.imageUrl,
        voiceUrl: message.voiceUrl,
        isVoice: message.isVoice,
        voiceDuration: message.voiceDuration,
        sessionId: sessionId,
        aiAnalysis: message.aiAnalysis,
      };

      setMessages(prev => [...prev, newMessage]);
      
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      return newMessage;
    }
  }, [user, currentSessionId]);

  const startNewSession = useCallback(() => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    setError(null); // Clear any previous errors
    setMessages([]); // Clear messages for new session
    return newSessionId;
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          user_id,
          message_text,
          is_user_message,
          message_type,
          image_url,
          voice_url,
          voice_duration,
          session_id,
          ai_analysis,
          created_at
        `)
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('Chat messages table does not exist - using empty session');
          setMessages([]);
          setCurrentSessionId(sessionId);
          return;
        }
        throw error;
      }

      const sessionMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        text: msg.message_text || '',
        isUser: msg.is_user_message,
        timestamp: new Date(msg.created_at),
        imageUrl: msg.image_url,
        voiceUrl: msg.voice_url,
        isVoice: msg.message_type === 'voice',
        voiceDuration: msg.voice_duration,
        sessionId: msg.session_id,
        aiAnalysis: msg.ai_analysis,
      }));

      setMessages(sessionMessages);
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete session. Please try again.');
    }
  }, [user, currentSessionId]);

  const clearAllHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setMessages([]);
      setSessions([]);
      setCurrentSessionId(null);
      setError(null);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear history. Please try again.');
    }
  }, [user]);

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return {
    messages,
    sessions,
    currentSessionId,
    loading,
    error,
    saveMessage,
    loadChatHistory,
    startNewSession,
    loadSession,
    deleteSession,
    clearAllHistory,
  };
}