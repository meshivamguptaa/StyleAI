import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { RevenueCatService } from '@/lib/revenuecat';

const FREE_TRYON_LIMIT = 5;
const STORAGE_KEY = 'tryon_count';

export interface TryOnLimits {
  count: number;
  limit: number;
  remaining: number;
  canTryOn: boolean;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
}

export function useTryOnLimits() {
  const { user } = useAuth();
  const [tryOnCount, setTryOnCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load try-on count and premium status
  useEffect(() => {
    loadTryOnData();
  }, [user]);

  const loadTryOnData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load try-on count
      await loadTryOnCount();

      // Check premium status
      if (user) {
        const premiumStatus = await RevenueCatService.checkPremiumStatus();
        setIsPremium(premiumStatus);
      } else {
        setIsPremium(false);
      }
    } catch (err) {
      console.error('Failed to load try-on data:', err);
      setError('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadTryOnCount = useCallback(async () => {
    try {
      if (user) {
        // Try to load from Supabase first
        const { data, error } = await supabase
          .from('profiles')
          .select('total_tryons')
          .eq('id', user.id)
          .single();

        if (!error && data) {
  const count = data.total_tryons ?? 0; // if null, default to 0
  setTryOnCount(count);
  await AsyncStorage.setItem(STORAGE_KEY, count.toString());
  return;
}
      }

      // Fallback to AsyncStorage
      const storedCount = await AsyncStorage.getItem(STORAGE_KEY);
      setTryOnCount(storedCount ? parseInt(storedCount, 10) : 0);
    } catch (err) {
      console.error('Failed to load try-on count:', err);
      setTryOnCount(0);
    }
  }, [user]);

  const incrementTryOnCount = useCallback(async () => {
    try {
      const newCount = tryOnCount + 1;
      setTryOnCount(newCount);

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, newCount.toString());

      // Save to Supabase if user is logged in
      if (user) {
        try {
          await supabase.rpc('increment_total_tryons', { user_id: user.id });
        } catch (dbError) {
          console.error('Failed to update try-on count in database:', dbError);
          // Continue with local storage - don't block the user
        }
      }

      return newCount;
    } catch (err) {
      console.error('Failed to increment try-on count:', err);
      throw new Error('Failed to update try-on count');
    }
  }, [tryOnCount, user]);

  const resetTryOnCount = useCallback(async () => {
    try {
      setTryOnCount(0);
      await AsyncStorage.setItem(STORAGE_KEY, '0');

      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ total_tryons: 0 })
            .eq('id', user.id);
        } catch (dbError) {
          console.error('Failed to reset try-on count in database:', dbError);
        }
      }
    } catch (err) {
      console.error('Failed to reset try-on count:', err);
    }
  }, [user]);

  const checkCanTryOn = useCallback((): boolean => {
    if (isPremium) return true;
    return tryOnCount < FREE_TRYON_LIMIT;
  }, [isPremium, tryOnCount]);

  const refreshPremiumStatus = useCallback(async () => {
    try {
      const premiumStatus = await RevenueCatService.checkPremiumStatus();
      setIsPremium(premiumStatus);
      return premiumStatus;
    } catch (err) {
      console.error('Failed to refresh premium status:', err);
      return false;
    }
  }, []);

  const limits: TryOnLimits = {
    count: tryOnCount,
    limit: FREE_TRYON_LIMIT,
    remaining: Math.max(0, FREE_TRYON_LIMIT - tryOnCount),
    canTryOn: checkCanTryOn(),
    isPremium,
    loading,
    error,
  };

  return {
    limits,
    incrementTryOnCount,
    resetTryOnCount,
    refreshPremiumStatus,
    loadTryOnData,
  };
}