import { useState, useEffect, useCallback } from 'react';
import { RevenueCatService } from '@/lib/revenuecat';
import { useAuth } from './useAuth';
import type { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

export function useRevenueCat() {
  const { user } = useAuth();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat and load data
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Set user ID when user logs in
  useEffect(() => {
    if (user) {
      RevenueCatService.setUserID(user.id);
      loadCustomerInfo();
    } else {
      RevenueCatService.logout();
      setCustomerInfo(null);
      setIsPremium(false);
    }
  }, [user]);

  const initializeRevenueCat = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await RevenueCatService.initialize();
      await loadOfferings();
      
      if (user) {
        await loadCustomerInfo();
      }
    } catch (err) {
      console.error('RevenueCat initialization failed:', err);
      setError('Failed to initialize subscription service');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadOfferings = useCallback(async () => {
    try {
      const currentOfferings = await RevenueCatService.getOfferings();
      setOfferings(currentOfferings);
    } catch (err) {
      console.error('Failed to load offerings:', err);
      setError('Failed to load subscription plans');
    }
  }, []);

  const loadCustomerInfo = useCallback(async () => {
    try {
      const info = await RevenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      
      if (info) {
        const premiumStatus = info.entitlements.active['premium'] !== undefined;
        setIsPremium(premiumStatus);
      }
    } catch (err) {
      console.error('Failed to load customer info:', err);
    }
  }, []);

  const purchasePackage = useCallback(async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(true);
      setError(null);

      const result = await RevenueCatService.purchasePackage(packageToPurchase);
      
      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const premiumStatus = result.customerInfo.entitlements.active['premium'] !== undefined;
        setIsPremium(premiumStatus);
        return { success: true };
      } else {
        setError(result.error || 'Purchase failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setPurchasing(false);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      setPurchasing(true);
      setError(null);

      const result = await RevenueCatService.restorePurchases();
      
      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const premiumStatus = result.customerInfo.entitlements.active['premium'] !== undefined;
        setIsPremium(premiumStatus);
        return { success: true };
      } else {
        setError(result.error || 'Restore failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setPurchasing(false);
    }
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    await loadCustomerInfo();
  }, [loadCustomerInfo]);

  return {
    offerings,
    customerInfo,
    isPremium,
    loading,
    purchasing,
    error,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
  };
}