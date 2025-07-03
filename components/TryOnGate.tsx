import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTryOnLimits } from '@/hooks/useTryOnLimits';
import { GradientButton } from './GradientButton';
import { Camera, Crown, Lock } from 'lucide-react-native';

interface TryOnGateProps {
  onProceed: () => void;
  children?: React.ReactNode;
}

export function TryOnGate({ onProceed, children }: TryOnGateProps) {
  const router = useRouter();
  const { limits } = useTryOnLimits();

  const handleTryOnRequest = () => {
    if (limits.isPremium) {
      // Premium users can proceed directly
      onProceed();
      return;
    }

    if (limits.canTryOn) {
      // Free users with remaining tries - proceed without incrementing count yet
      onProceed();
    } else {
      // Free users who have exceeded the limit
      router.push('/subscription');
    }
  };

  // Show paywall if user has exceeded free limit and is not premium
  if (!limits.canTryOn && !limits.isPremium) {
    return (
      <View style={styles.paywallContainer}>
        <LinearGradient
          colors={['#0F172A', '#1F2937']}
          style={styles.paywallGradient}
        >
          <View style={styles.paywallContent}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.paywallIcon}
            >
              <Lock color="#FFFFFF" size={32} />
            </LinearGradient>
            
            <Text style={styles.paywallTitle}>Try-On Limit Reached</Text>
            <Text style={styles.paywallDescription}>
              You've used all {limits.limit} free virtual try-ons. Subscribe to StyleAI Premium for unlimited access to all features.
            </Text>

            <View style={styles.paywallFeatures}>
              <View style={styles.paywallFeature}>
                <Camera color="#8B5CF6" size={16} />
                <Text style={styles.paywallFeatureText}>Unlimited virtual try-ons</Text>
              </View>
              <View style={styles.paywallFeature}>
                <Crown color="#F59E0B" size={16} />
                <Text style={styles.paywallFeatureText}>Premium AI features</Text>
              </View>
            </View>

            <GradientButton
              title="Get Unlimited Access"
              onPress={() => router.push('/subscription')}
              variant="primary"
              size="large"
              style={styles.upgradeButton}
            />

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Show try-on gate with remaining count for free users
  if (!limits.isPremium) {
    return (
      <View style={styles.gateContainer}>
        <LinearGradient
          colors={['#8B5CF620', '#EC489920']}
          style={styles.gateCard}
        >
          <View style={styles.gateHeader}>
            <Camera color="#8B5CF6" size={24} />
            <Text style={styles.gateTitle}>Virtual Try-On</Text>
          </View>
          
          <Text style={styles.gateDescription}>
            You have {limits.remaining} free try-on{limits.remaining !== 1 ? 's' : ''} remaining.
          </Text>

          <View style={styles.gateProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(limits.count / limits.limit) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {limits.count}/{limits.limit} used
            </Text>
          </View>

          <View style={styles.gateActions}>
            <GradientButton
              title="Start Try-On"
              onPress={handleTryOnRequest}
              variant="primary"
              size="medium"
              style={styles.tryOnButton}
            />
            
            <TouchableOpacity 
              style={styles.upgradeLink}
              onPress={() => router.push('/subscription')}
            >
              <Text style={styles.upgradeLinkText}>Get Unlimited Access</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {children}
      </View>
    );
  }

  // Premium users see normal content with premium badge
  return (
    <View style={styles.premiumContainer}>
      <View style={styles.premiumBadge}>
        <Crown color="#F59E0B" size={16} />
        <Text style={styles.premiumText}>Premium - Unlimited Try-Ons</Text>
      </View>
      
      <TouchableOpacity style={styles.premiumTryOnButton} onPress={handleTryOnRequest}>
        <LinearGradient
          colors={['#8B5CF6', '#A855F7']}
          style={styles.premiumTryOnGradient}
        >
          <Camera color="#FFFFFF" size={20} />
          <Text style={styles.premiumTryOnText}>Start Virtual Try-On</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  paywallContainer: {
    flex: 1,
  },
  paywallGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  paywallContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  paywallIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  paywallTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  paywallDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  paywallFeatures: {
    gap: 12,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  paywallFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paywallFeatureText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  upgradeButton: {
    marginBottom: 16,
    width: '100%',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  gateContainer: {
    padding: 20,
  },
  gateCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
    marginBottom: 20,
  },
  gateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  gateTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  gateDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  gateProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  gateActions: {
    gap: 12,
  },
  tryOnButton: {
    width: '100%',
  },
  upgradeLink: {
    alignSelf: 'center',
    padding: 8,
  },
  upgradeLinkText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  premiumContainer: {
    padding: 20,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 16,
  },
  premiumText: {
    color: '#F59E0B',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  premiumTryOnButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  premiumTryOnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  premiumTryOnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});