import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useTryOnLimits } from '@/hooks/useTryOnLimits';
import { GradientButton } from '@/components/GradientButton';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Sparkles, 
  Camera, 
  Star, 
  Users,
  Zap,
  Shield,
  Infinity,
  RefreshCw
} from 'lucide-react-native';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { offerings, isPremium, purchasing, error, purchasePackage, restorePurchases } = useRevenueCat();
  const { limits } = useTryOnLimits();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const premiumFeatures = [
    'Unlimited virtual try-ons',
    'Advanced AI style analysis',
    'Personalized recommendations',
    'HD quality results',
    'Priority processing',
    'Exclusive pose guides',
    'Style trend insights',
    'Export high-res images',
    'Advanced color matching',
    'Body shape analysis',
    'Wardrobe planning tools',
    'Early access to new features',
  ];

  const handlePurchase = async (packageId: string) => {
    if (!offerings) {
      Alert.alert('Error', 'Subscription plans are not available right now. Please try again later.');
      return;
    }

    const packageToPurchase = offerings.availablePackages.find(pkg => pkg.identifier === packageId);
    if (!packageToPurchase) {
      Alert.alert('Error', 'Selected plan is not available.');
      return;
    }

    const result = await purchasePackage(packageToPurchase);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        'Welcome to StyleAI Premium! You now have unlimited access to all features.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    const result = await restorePurchases();
    
    if (result.success) {
      Alert.alert('Success', 'Your purchases have been restored!');
    } else {
      Alert.alert('Restore Failed', result.error || 'No purchases found to restore.');
    }
  };

  // Show premium status if already subscribed
  if (isPremium) {
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F9FAFB" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>StyleAI Premium</Text>
            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
              <Text style={styles.restoreText}>Restore</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Premium Status */}
            <View style={styles.premiumStatusSection}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.premiumBadge}
              >
                <Crown color="#FFFFFF" size={32} />
              </LinearGradient>
              <Text style={styles.premiumTitle}>You're Premium!</Text>
              <Text style={styles.premiumDescription}>
                Enjoy unlimited virtual try-ons and all premium features.
              </Text>
            </View>

            {/* Premium Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Your Premium Benefits</Text>
              <View style={styles.featuresList}>
                {premiumFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check color="#10B981" size={16} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upgrade to Premium</Text>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Try-on Limit Warning */}
          <View style={styles.limitWarningSection}>
            <LinearGradient
              colors={['#EF444420', '#DC262620']}
              style={styles.limitWarningCard}
            >
              <Camera color="#EF4444" size={24} />
              <Text style={styles.limitWarningTitle}>
                You've used {limits.count} of {limits.limit} free try-ons
              </Text>
              <Text style={styles.limitWarningDescription}>
                {limits.remaining > 0 
                  ? `${limits.remaining} try-ons remaining. Subscribe for unlimited access.`
                  : "You've used all 5 free virtual try-ons. Subscribe to continue unlimited access."
                }
              </Text>
            </LinearGradient>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.crownContainer}
            >
              <Crown color="#FFFFFF" size={32} />
            </LinearGradient>
            <Text style={styles.heroTitle}>Unlock Unlimited Style</Text>
            <Text style={styles.heroDescription}>
              Get unlimited virtual try-ons and access to all premium AI features
            </Text>
          </View>

          {/* Subscription Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
                  <RefreshCw color="#EF4444" size={16} />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.plansContainer}>
              {/* Monthly Plan */}
              <TouchableOpacity
                style={[styles.planCard, selectedPackage === 'monthly' && styles.planCardSelected]}
                onPress={() => setSelectedPackage('monthly')}
              >
                <LinearGradient
                  colors={selectedPackage === 'monthly' ? ['#8B5CF620', '#EC489920'] : ['#1F2937', '#374151']}
                  style={styles.planGradient}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planTitle}>Monthly</Text>
                    <View style={styles.planPricing}>
                      <Text style={styles.planPrice}>$9.99</Text>
                      <Text style={styles.planPeriod}>/month</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.planDescription}>
                    Perfect for trying premium features
                  </Text>

                  <GradientButton
                    title={purchasing ? 'Processing...' : 'Subscribe Monthly'}
                    onPress={() => handlePurchase('monthly')}
                    disabled={purchasing}
                    variant="primary"
                    size="medium"
                    style={styles.subscribeButton}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Yearly Plan */}
              <TouchableOpacity
                style={[styles.planCard, selectedPackage === 'yearly' && styles.planCardSelected, styles.planCardPopular]}
                onPress={() => setSelectedPackage('yearly')}
              >
                <LinearGradient
                  colors={selectedPackage === 'yearly' ? ['#8B5CF620', '#EC489920'] : ['#1F2937', '#374151']}
                  style={styles.planGradient}
                >
                  <View style={styles.popularBadge}>
                    <Sparkles color="#FFFFFF" size={12} />
                    <Text style={styles.popularText}>Best Value</Text>
                  </View>
                  
                  <View style={styles.planHeader}>
                    <Text style={styles.planTitle}>Yearly</Text>
                    <View style={styles.planPricing}>
                      <Text style={styles.planPrice}>$59.99</Text>
                      <Text style={styles.planPeriod}>/year</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.planDescription}>
                    Best value - save 50% compared to monthly
                  </Text>
                  
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save $60/year</Text>
                  </View>

                  <GradientButton
                    title={purchasing ? 'Processing...' : 'Subscribe Yearly'}
                    onPress={() => handlePurchase('yearly')}
                    disabled={purchasing}
                    variant="primary"
                    size="medium"
                    style={styles.subscribeButton}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            <View style={styles.featuresList}>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Check color="#10B981" size={16} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Why Go Premium?</Text>
            <View style={styles.benefitsGrid}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Infinity color="#8B5CF6" size={24} />
                </View>
                <Text style={styles.benefitTitle}>Unlimited Try-Ons</Text>
                <Text style={styles.benefitDescription}>
                  No limits on virtual try-ons. Experiment with as many looks as you want.
                </Text>
              </LinearGradient>
              
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Zap color="#EC4899" size={24} />
                </View>
                <Text style={styles.benefitTitle}>Priority Processing</Text>
                <Text style={styles.benefitDescription}>
                  Get your results faster with priority AI processing queue.
                </Text>
              </LinearGradient>
              
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Star color="#F59E0B" size={24} />
                </View>
                <Text style={styles.benefitTitle}>Advanced AI</Text>
                <Text style={styles.benefitDescription}>
                  Access to our most sophisticated AI models and analysis.
                </Text>
              </LinearGradient>
              
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Shield color="#06B6D4" size={24} />
                </View>
                <Text style={styles.benefitTitle}>Premium Support</Text>
                <Text style={styles.benefitDescription}>
                  Get priority customer support and exclusive features.
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Cancel anytime. No commitments. Secure payments.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  restoreButton: {
    padding: 8,
  },
  restoreText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  limitWarningSection: {
    padding: 20,
    paddingBottom: 0,
  },
  limitWarningCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  limitWarningTitle: {
    color: '#EF4444',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  limitWarningDescription: {
    color: '#F87171',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumStatusSection: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  premiumBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumTitle: {
    color: '#F9FAFB',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  crownContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    color: '#F9FAFB',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  plansSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#EF444420',
    borderRadius: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  retryButton: {
    padding: 4,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  planCardSelected: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  planGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  planTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    color: '#8B5CF6',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  planPeriod: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  planDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  savingsBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  savingsText: {
    color: '#10B981',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  subscribeButton: {
    marginTop: 8,
  },
  featuresSection: {
    padding: 20,
    paddingTop: 0,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  benefitsSection: {
    padding: 20,
    paddingTop: 0,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  benefitIcon: {
    backgroundColor: '#8B5CF620',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  benefitTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDescription: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 14,
  },
  footerSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});