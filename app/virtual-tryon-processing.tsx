import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';
import { useTryOnLimits } from '@/hooks/useTryOnLimits';
import { GradientButton } from '@/components/GradientButton';
import { ArrowLeft, Zap, Sparkles, Lightbulb, CircleAlert as AlertCircle, RefreshCw, Shield, Image, Wand as Wand2 } from 'lucide-react-native';

export default function VirtualTryOnProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { processVirtualTryOn, isProcessing, progress, currentStep, result, error, reset } = useVirtualTryOn();
  const { incrementTryOnCount } = useTryOnLimits();
  const [hasStarted, setHasStarted] = useState(false);
  const [countIncremented, setCountIncremented] = useState(false);

  const userImage = params.userImage as string;
  const outfitImage = params.outfitImage as string;
  const outfitImageUrl = params.outfitImageUrl as string;
  const method = params.method as string;

  useEffect(() => {
    if (!hasStarted && userImage) {
      setHasStarted(true);
      startProcessing();
    }
  }, [hasStarted, userImage]);

  // Increment try-on count when processing completes successfully
  useEffect(() => {
    if (result && result.success && !countIncremented) {
      incrementTryOnCount().catch(error => {
        console.error('Failed to increment try-on count:', error);
      });
      setCountIncremented(true);
    }
  }, [result, countIncremented, incrementTryOnCount]);

  const startProcessing = async () => {
    try {
      await processVirtualTryOn({
        userImageUri: userImage,
        outfitImageUri: outfitImage || undefined,
        outfitImageUrl: outfitImageUrl || undefined,
      });
    } catch (err) {
      console.error('Processing failed:', err);
    }
  };

  const handleViewResults = () => {
    if (result && result.success) {
      router.push({
        pathname: '/tryon-results',
        params: {
          resultImageUrl: result.resultImageUrl,
          processingTime: result.processingTime.toString(),
          userImage,
          outfitImage: outfitImage || outfitImageUrl,
          method: result.method || 'hybrid',
          fallbackReason: result.fallbackReason || '',
          qualityScore: (result.qualityScore || 7.0).toString(),
          preprocessingApplied: result.preprocessingApplied ? 'true' : 'false',
        }
      });
    }
  };

  const handleRetry = () => {
    reset();
    setHasStarted(false);
    setCountIncremented(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (error) {
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <AlertCircle color="#EF4444" size={48} />
            </View>
            
            <Text style={styles.errorTitle}>Processing Failed</Text>
            <Text style={styles.errorDescription}>
              {error}
            </Text>
            
            <View style={styles.troubleshootingSection}>
              <Text style={styles.troubleshootingTitle}>💡 Tips for Better Results:</Text>
              <View style={styles.troubleshootingList}>
                <Text style={styles.troubleshootingItem}>• Use well-lit, clear photos</Text>
                <Text style={styles.troubleshootingItem}>• Stand facing the camera directly</Text>
                <Text style={styles.troubleshootingItem}>• Ensure your full body is visible</Text>
                <Text style={styles.troubleshootingItem}>• Use high-quality images (not blurry)</Text>
                <Text style={styles.troubleshootingItem}>• Choose clothing items that are clearly visible</Text>
                <Text style={styles.troubleshootingItem}>• Avoid complex poses or angles</Text>
              </View>
            </View>
            
            <View style={styles.errorActions}>
              <GradientButton
                title="Try Again with New Photos"
                onPress={handleRetry}
                variant="primary"
                size="large"
                style={styles.actionButton}
              />
              
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (result && result.success) {
    const isPremiumResult = result.method === 'picaos';
    const isEnhancedResult = result.method === 'enhanced-mock';
    
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <LinearGradient
              colors={isPremiumResult ? ['#10B981', '#059669'] : isEnhancedResult ? ['#F59E0B', '#D97706'] : ['#6B7280', '#4B5563']}
              style={styles.successIcon}
            >
              {isPremiumResult ? (
                <Sparkles color="#FFFFFF" size={48} />
              ) : isEnhancedResult ? (
                <Wand2 color="#FFFFFF" size={48} />
              ) : (
                <Image color="#FFFFFF" size={48} />
              )}
            </LinearGradient>
            
            <Text style={styles.successTitle}>
              {isPremiumResult ? 'Premium AI Result Ready!' : isEnhancedResult ? 'Enhanced Result Ready!' : 'Preview Result Ready!'}
            </Text>
            <Text style={styles.successDescription}>
              {isPremiumResult 
                ? `Your premium AI virtual try-on has been processed with advanced technology and image preprocessing. Processing took ${Math.round(result.processingTime / 1000)} seconds.`
                : isEnhancedResult
                ? `Your enhanced virtual try-on is ready! This shows how the outfit might look with advanced image processing. Processing took ${Math.round(result.processingTime / 1000)} seconds.`
                : `Your preview result is ready! This shows how the outfit might look. For the most realistic results with advanced AI, consider upgrading to premium. Processing took ${Math.round(result.processingTime / 1000)} seconds.`
              }
            </Text>
            
            <View style={styles.resultTypeBadge}>
              {isPremiumResult ? (
                <>
                  <Zap color="#10B981" size={16} />
                  <Text style={[styles.resultTypeText, { color: '#10B981' }]}>Premium AI Technology</Text>
                </>
              ) : isEnhancedResult ? (
                <>
                  <Wand2 color="#F59E0B" size={16} />
                  <Text style={[styles.resultTypeText, { color: '#F59E0B' }]}>Enhanced Preview</Text>
                </>
              ) : (
                <>
                  <Shield color="#6B7280" size={16} />
                  <Text style={[styles.resultTypeText, { color: '#6B7280' }]}>Basic Preview</Text>
                </>
              )}
            </View>
            
            {result.preprocessingApplied && (
              <View style={styles.preprocessingBadge}>
                <Sparkles color="#8B5CF6" size={12} />
                <Text style={styles.preprocessingText}>Image preprocessing applied</Text>
              </View>
            )}
            
            <View style={styles.successActions}>
              <GradientButton
                title="View Your Results"
                onPress={handleViewResults}
                variant="primary"
                size="large"
                style={styles.actionButton}
              />
              
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Text style={styles.backButtonText}>Try Another Look</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={handleGoBack}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Processing</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.processingContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.processingIcon}
          >
            <Zap color="#FFFFFF" size={48} />
          </LinearGradient>
          
          <Text style={styles.processingTitle}>Advanced AI Virtual Try-On</Text>
          <Text style={styles.processingSubtitle}>
            {currentStep || 'Initializing intelligent processing system...'}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          <View style={styles.aiFeatures}>
            <Text style={styles.aiFeaturesTitle}>Advanced Processing Active</Text>
            <View style={styles.aiFeaturesList}>
              <View style={styles.aiFeatureItem}>
                <Wand2 color="#8B5CF6" size={16} />
                <Text style={styles.aiFeatureText}>Image Preprocessing</Text>
              </View>
              <View style={styles.aiFeatureItem}>
                <Zap color="#EC4899" size={16} />
                <Text style={styles.aiFeatureText}>Premium AI First</Text>
              </View>
              <View style={styles.aiFeatureItem}>
                <Shield color="#F59E0B" size={16} />
                <Text style={styles.aiFeatureText}>Reliable Fallback</Text>
              </View>
              <View style={styles.aiFeatureItem}>
                <Lightbulb color="#10B981" size={16} />
                <Text style={styles.aiFeatureText}>Quality Optimization</Text>
              </View>
            </View>
          </View>

          <View style={styles.processingInfo}>
            <Text style={styles.processingInfoTitle}>How It Works</Text>
            <Text style={styles.processingInfoText}>
              Our advanced system first preprocesses your images to optimize quality, then uses premium AI for the highest quality results. 
              If needed, we automatically switch to our enhanced preview system to ensure you always get great results.
            </Text>
          </View>

          <View style={styles.guaranteeSection}>
            <View style={styles.guaranteeIcon}>
              <Shield color="#10B981" size={20} />
            </View>
            <Text style={styles.guaranteeText}>
              100% Success Guarantee - You will always get a result!
            </Text>
          </View>
        </View>
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
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  headerSpacer: {
    width: 40,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  processingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  processingTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  processingSubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
    minHeight: 48,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  aiFeatures: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  aiFeaturesTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  aiFeaturesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  aiFeatureItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
  },
  aiFeatureText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  processingInfo: {
    backgroundColor: '#8B5CF610',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
    marginBottom: 20,
  },
  processingInfoTitle: {
    color: '#8B5CF6',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  processingInfoText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B98120',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  guaranteeIcon: {
    backgroundColor: '#10B98130',
    borderRadius: 8,
    padding: 6,
  },
  guaranteeText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  troubleshootingSection: {
    backgroundColor: '#F59E0B10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F59E0B30',
    width: '100%',
  },
  troubleshootingTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  troubleshootingList: {
    gap: 8,
  },
  troubleshootingItem: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  errorActions: {
    width: '100%',
    gap: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  resultTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F293720',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  resultTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  preprocessingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 32,
  },
  preprocessingText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  successActions: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    width: '100%',
  },
  backButton: {
    alignSelf: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});