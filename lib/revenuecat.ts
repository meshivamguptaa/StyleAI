import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

export class RevenueCatService {
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;

    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) {
        console.warn('RevenueCat API key not found');
        return;
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey,
        appUserID: undefined, // Will be set when user logs in
      });

      // Set debug logs (disable in production)
      if (__DEV__) {
        await Purchases.setLogLevel('debug');
      }

      this.initialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('RevenueCat initialization failed:', error);
    }
  }

  static async setUserID(userID: string) {
    try {
      await Purchases.logIn(userID);
      console.log('RevenueCat user ID set:', userID);
    } catch (error) {
      console.error('Failed to set RevenueCat user ID:', error);
    }
  }

  static async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Failed to get RevenueCat offerings:', error);
      return null;
    }
  }

  static async purchasePackage(packageToPurchase: PurchasesPackage): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      if (error.userCancelled) {
        return { success: false, error: 'Purchase was cancelled' };
      }
      
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  static async restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Restore purchases failed:', error);
      return { success: false, error: error.message || 'Restore failed' };
    }
  }

  static async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  static async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return customerInfo?.entitlements.active['premium'] !== undefined;
    } catch (error) {
      console.error('Failed to check premium status:', error);
      return false;
    }
  }

  static async logout() {
    try {
      await Purchases.logOut();
      console.log('RevenueCat user logged out');
    } catch (error) {
      console.error('Failed to logout from RevenueCat:', error);
    }
  }
}