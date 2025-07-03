import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface TryOnSession {
  id: string;
  userImageUrl: string;
  clothingImageUrl: string;
  resultImageUrl?: string;
  aiScore: number;
  aiFeedback: any;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  poseAdjustments: string[];
  styleRecommendations: string[];
  createdAt: Date;
  completedAt?: Date;
  isSaved: boolean;
}

export interface SavedLook {
  id: string;
  tryonSessionId?: string;
  title: string;
  description?: string;
  imageUrl: string;
  tags: string[];
  category?: string;
  aiScore?: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useTryOnPersistence() {
  const { user } = useAuth();
  const [tryOnSessions, setTryOnSessions] = useState<TryOnSession[]>([]);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user logs in
  useEffect(() => {
    if (user) {
      loadTryOnHistory();
      loadSavedLooks();
    } else {
      setTryOnSessions([]);
      setSavedLooks([]);
    }
  }, [user]);

  const loadTryOnHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tryon_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const sessions: TryOnSession[] = data.map(session => ({
        id: session.id,
        userImageUrl: session.user_image_url,
        clothingImageUrl: session.clothing_image_url,
        resultImageUrl: session.result_image_url,
        aiScore: session.ai_score || 0,
        aiFeedback: session.ai_feedback || {},
        processingStatus: session.processing_status,
        poseAdjustments: session.pose_adjustments || [],
        styleRecommendations: session.style_recommendations || [],
        createdAt: new Date(session.created_at),
        completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
        isSaved: session.is_saved,
      }));

      setTryOnSessions(sessions);
    } catch (err) {
      console.error('Failed to load try-on history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load try-on history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadSavedLooks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('saved_looks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const looks: SavedLook[] = data.map(look => ({
        id: look.id,
        tryonSessionId: look.tryon_session_id,
        title: look.title,
        description: look.description,
        imageUrl: look.image_url,
        tags: look.tags || [],
        category: look.category,
        aiScore: look.ai_score,
        isFavorite: look.is_favorite,
        createdAt: new Date(look.created_at),
        updatedAt: new Date(look.updated_at),
      }));

      setSavedLooks(looks);
    } catch (err) {
      console.error('Failed to load saved looks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load saved looks');
    }
  }, [user]);

  const createTryOnSession = useCallback(async (
    userImageUrl: string,
    clothingImageUrl: string
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const sessionData = {
        user_id: user.id,
        user_image_url: userImageUrl,
        clothing_image_url: clothingImageUrl,
        processing_status: 'pending',
      };

      const { data, error } = await supabase
        .from('tryon_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      const newSession: TryOnSession = {
        id: data.id,
        userImageUrl: data.user_image_url,
        clothingImageUrl: data.clothing_image_url,
        resultImageUrl: data.result_image_url,
        aiScore: data.ai_score || 0,
        aiFeedback: data.ai_feedback || {},
        processingStatus: data.processing_status,
        poseAdjustments: data.pose_adjustments || [],
        styleRecommendations: data.style_recommendations || [],
        createdAt: new Date(data.created_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        isSaved: data.is_saved,
      };

      setTryOnSessions(prev => [newSession, ...prev]);
      return data.id;
    } catch (err) {
      console.error('Failed to create try-on session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create try-on session');
      return null;
    }
  }, [user]);

  const updateTryOnSession = useCallback(async (
    sessionId: string,
    updates: Partial<TryOnSession>
  ) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.resultImageUrl !== undefined) updateData.result_image_url = updates.resultImageUrl;
      if (updates.aiScore !== undefined) updateData.ai_score = updates.aiScore;
      if (updates.aiFeedback !== undefined) updateData.ai_feedback = updates.aiFeedback;
      if (updates.processingStatus !== undefined) updateData.processing_status = updates.processingStatus;
      if (updates.poseAdjustments !== undefined) updateData.pose_adjustments = updates.poseAdjustments;
      if (updates.styleRecommendations !== undefined) updateData.style_recommendations = updates.styleRecommendations;
      if (updates.isSaved !== undefined) updateData.is_saved = updates.isSaved;
      
      if (updates.processingStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tryon_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTryOnSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      ));
    } catch (err) {
      console.error('Failed to update try-on session:', err);
      setError(err instanceof Error ? err.message : 'Failed to update try-on session');
    }
  }, [user]);

  const saveLook = useCallback(async (
    title: string,
    imageUrl: string,
    options: {
      description?: string;
      tags?: string[];
      category?: string;
      aiScore?: number;
      tryonSessionId?: string;
    } = {}
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const lookData = {
        user_id: user.id,
        title,
        image_url: imageUrl,
        description: options.description,
        tags: options.tags || [],
        category: options.category,
        ai_score: options.aiScore,
        tryon_session_id: options.tryonSessionId,
        is_favorite: false,
      };

      const { data, error } = await supabase
        .from('saved_looks')
        .insert(lookData)
        .select()
        .single();

      if (error) throw error;

      const newLook: SavedLook = {
        id: data.id,
        tryonSessionId: data.tryon_session_id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        tags: data.tags || [],
        category: data.category,
        aiScore: data.ai_score,
        isFavorite: data.is_favorite,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setSavedLooks(prev => [newLook, ...prev]);

      // Update profile saved_looks count
      await supabase.rpc('increment_saved_looks', { user_id: user.id });

      return data.id;
    } catch (err) {
      console.error('Failed to save look:', err);
      setError(err instanceof Error ? err.message : 'Failed to save look');
      return null;
    }
  }, [user]);

  const updateSavedLook = useCallback(async (
    lookId: string,
    updates: Partial<SavedLook>
  ) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

      const { error } = await supabase
        .from('saved_looks')
        .update(updateData)
        .eq('id', lookId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedLooks(prev => prev.map(look => 
        look.id === lookId 
          ? { ...look, ...updates, updatedAt: new Date() }
          : look
      ));
    } catch (err) {
      console.error('Failed to update saved look:', err);
      setError(err instanceof Error ? err.message : 'Failed to update saved look');
    }
  }, [user]);

  const deleteSavedLook = useCallback(async (lookId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_looks')
        .delete()
        .eq('id', lookId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedLooks(prev => prev.filter(look => look.id !== lookId));

      // Update profile saved_looks count
      await supabase.rpc('decrement_saved_looks', { user_id: user.id });
    } catch (err) {
      console.error('Failed to delete saved look:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete saved look');
    }
  }, [user]);

  const getTryOnSession = useCallback((sessionId: string) => {
    return tryOnSessions.find(session => session.id === sessionId);
  }, [tryOnSessions]);

  const getSavedLook = useCallback((lookId: string) => {
    return savedLooks.find(look => look.id === lookId);
  }, [savedLooks]);

  return {
    tryOnSessions,
    savedLooks,
    loading,
    error,
    loadTryOnHistory,
    loadSavedLooks,
    createTryOnSession,
    updateTryOnSession,
    saveLook,
    updateSavedLook,
    deleteSavedLook,
    getTryOnSession,
    getSavedLook,
  };
}