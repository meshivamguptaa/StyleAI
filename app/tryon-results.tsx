import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTryOnLimits } from '@/hooks/useTryOnLimits';
import { StyleFeedbackCard } from '@/components/StyleFeedbackCard';
import { GradientButton } from '@/components/GradientButton';
import { HybridTryOnService } from '@/lib/hybrid-tryon-service';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Download, Share, Heart, RotateCcw, Sparkles, Star, Camera, ShoppingBag, Zap, Lightbulb, Save, ExternalLink, Crown, CircleAlert as AlertCircle, TrendingUp, Wand as Wand2 } from 'lucide-react-native';

export default function TryOnResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { incrementTryOnCount } = useTryOnLimits();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [countIncremented, setCountIncremented] = useState(false);

  const resultImageUrl = params.resultImageUrl as string;
  const processingTime = params.processingTime as string;
  const userImage = params.userImage as string;
  const outfitImage = params.outfitImage as string;
  const method = params.method as string;
  const fallbackReason = params.fallbackReason as string;
  const qualityScore = parseFloat(params.qualityScore as string) || 0;
  const preprocessingApplied = params.preprocessingApplied === 'true';

  // Determine result type and quality
  const isPremiumResult = method === 'picaos';
  const isEnhancedMock = method === 'enhanced-mock';
  const isBasicMock = method === 'mock';

  // Increment try-on count when results are viewed (only once)
  useEffect(() => {
    if (resultImageUrl && !countIncremented) {
      incrementTryOnCount().catch(error => {
        console.error('Failed to increment try-on count:', error);
      });
      setCountIncremented(true);
    }
  }, [resultImageUrl, countIncremented, incrementTryOnCount]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your results to your gallery.');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      console.log('Saving result...');
      setIsSaved(true);
      Alert.alert('Saved!', 'Your virtual try-on result has been saved to your gallery.');
    } catch (error) {
      console.error('Failed to save result:', error);
      Alert.alert('Save Failed', 'Failed to save the result. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      if (typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = resultImageUrl;
        link.download = `styleai-tryon-result-${Date.now()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert('Download Started', 'Your virtual try-on result is being downloaded.');
      } else {
        await Linking.openURL(resultImageUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', 'Unable to download the image. You can save it by long-pressing the image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'My StyleAI Virtual Try-On Result',
          text: 'Check out my virtual try-on result from StyleAI!',
          url: resultImageUrl,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(resultImageUrl);
        Alert.alert('Link Copied', 'The image link has been copied to your clipboard.');
      } else {
        window.open(resultImageUrl, '_blank');
      }
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Share Failed', 'Unable to share the image. You can copy the link manually.');
    }
  };

  const handleTryAnother = () => {
    router.push('/(tabs)/tryon');
  };

  const handleViewFullSize = () => {
    if (typeof window !== 'undefined') {
      window.open(resultImageUrl, '_blank');
    }
  };

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  const getResultTypeInfo = () => {
    if (isPremiumResult) {
      return {
        title: 'Premium AI Result',
        description: 'Generated with advanced AI technology and image preprocessing',
        color: '#10B981',
        icon: Sparkles,
      };
    } else if (isEnhancedMock) {
      return {
        title: 'Enhanced Preview Result',
        description: 'Generated with advanced image processing and realistic blending',
        color: '#F59E0B',
        icon: Wand2,
      };
    } else {
      return {
        title: 'Preview Result',
        description: 'Basic preview showing how the outfit might look',
        color: '#6B7280',
        icon: Camera,
      };
    }
  };

  const resultTypeInfo = getResultTypeInfo();

  if (!resultImageUrl) {
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <AlertCircle color="#EF4444" size={48} />
            <Text style={styles.errorText}>No result image available</Text>
            <GradientButton
              title="Try Again"
              onPress={handleTryAnother}
              variant="primary"
              size="medium"
            />
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Virtual Try-On Results</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction} onPress={handleSave}>
              <Heart 
                color={isSaved ? '#EC4899' : '#6B7280'} 
                size={20} 
                fill={isSaved ? '#EC4899' : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction} onPress={handleShare}>
              <Share color="#6B7280" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Result Type Badge */}
          <View style={styles.resultTypeBadgeContainer}>
            <LinearGradient
              colors={[`${resultTypeInfo.color}20`, `${resultTypeInfo.color}10`]}
              style={styles.resultTypeBadge}
            >
              <resultTypeInfo.icon color={resultTypeInfo.color} size={16} />
              <View style={styles.resultTypeBadgeContent}>
                <Text style={[styles.resultTypeBadgeText, { color: resultTypeInfo.color }]}>
                  {resultTypeInfo.title}
                </Text>
                <Text style={styles.resultTypeBadgeSubtext}>
                  {resultTypeInfo.description}
                </Text>
                {preprocessingApplied && (
                  <Text style={styles.preprocessingBadge}>
                    ✨ Image preprocessing applied
                  </Text>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Result Image */}
          <View style={styles.resultContainer}>
            <TouchableOpacity onPress={handleViewFullSize} style={styles.resultImageContainer}>
              <LinearGradient
                colors={['#1F2937', '#374151']}
                style={styles.resultImageGradient}
              >
                <Image 
                  source={{ uri: resultImageUrl }}
                  style={styles.resultImage}
                  resizeMode="contain"
                />
                <LinearGradient
                  colors={['transparent', '#00000040']}
                  style={styles.resultOverlay}
                >
                  <View style={styles.resultBadge}>
                    <Star color="#F59E0B" size={16} fill="#F59E0B" />
                    <Text style={styles.resultScore}>{qualityScore.toFixed(1)}</Text>
                  </View>
                  {isPremiumResult && (
                    <View style={styles.premiumBadge}>
                      <Crown color="#F59E0B" size={12} />
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.fullSizeButton} onPress={handleViewFullSize}>
                    <ExternalLink color="#FFFFFF" size={16} />
                    <Text style={styles.fullSizeText}>View Full Size</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={handleSave}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.quickActionGradient}>
                <Save color={isSaved ? '#10B981' : '#8B5CF6'} size={20} />
                <Text style={styles.quickActionText}>
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={handleDownload}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.quickActionGradient}>
                <Download color="#EC4899" size={20} />
                <Text style={styles.quickActionText}>
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/pose-detection')}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.quickActionGradient}>
                <Camera color="#06B6D4" size={20} />
                <Text style={styles.quickActionText}>Pose Tips</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.quickActionGradient}>
                <ShoppingBag color="#10B981" size={20} />
                <Text style={styles.quickActionText}>Shop</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* AI Feedback */}
          <View style={styles.feedbackSection}>
            <StyleFeedbackCard
              feedback={HybridTryOnService.getResultExplanation({ 
                method, 
                fallbackReason, 
                qualityScore 
              })}
              score={qualityScore}
              colorMatch={isPremiumResult ? "Excellent" : isEnhancedMock ? "Very Good" : "Good"}
              fitRating={isPremiumResult ? "AI Optimized" : isEnhancedMock ? "Enhanced Preview" : "Preview"}
              recommendations={HybridTryOnService.getQualityImprovementSuggestions({ 
                method, 
                qualityScore,
                fallbackReason 
              } as any)}
            />
          </View>

          {/* Upgrade Prompt for Non-Premium Results */}
          {!isPremiumResult && (
            <View style={styles.upgradeSection}>
              <LinearGradient
                colors={['#8B5CF620', '#EC489920']}
                style={styles.upgradeCard}
              >
                <View style={styles.upgradeHeader}>
                  <Crown color="#F59E0B" size={24} />
                  <Text style={styles.upgradeTitle}>Get Premium AI Results</Text>
                </View>
                <Text style={styles.upgradeDescription}>
                  Unlock advanced AI virtual try-on technology with image preprocessing for the most realistic and accurate results. 
                  Premium users get priority processing and enhanced image quality.
                </Text>
                <View style={styles.upgradeFeatures}>
                  <View style={styles.upgradeFeature}>
                    <Zap color="#8B5CF6" size={16} />
                    <Text style={styles.upgradeFeatureText}>Advanced AI Processing</Text>
                  </View>
                  <View style={styles.upgradeFeature}>
                    <TrendingUp color="#EC4899" size={16} />
                    <Text style={styles.upgradeFeatureText}>Image Preprocessing</Text>
                  </View>
                  <View style={styles.upgradeFeature}>
                    <Sparkles color="#F59E0B" size={16} />
                    <Text style={styles.upgradeFeatureText}>Unlimited Try-Ons</Text>
                  </View>
                  <View style={styles.upgradeFeature}>
                    <Star color="#10B981" size={16} />
                    <Text style={styles.upgradeFeatureText}>HD Quality Results</Text>
                  </View>
                </View>
                <GradientButton
                  title="Upgrade to Premium"
                  onPress={handleUpgrade}
                  variant="primary"
                  size="medium"
                  style={styles.upgradeButton}
                />
              </LinearGradient>
            </View>
          )}

          {/* Processing Info */}
          <View style={styles.processingSection}>
            <Text style={styles.sectionTitle}>Processing Details</Text>
            <LinearGradient colors={['#1F2937', '#374151']} style={styles.processingCard}>
              <View style={styles.processingInfo}>
                <Text style={styles.processingLabel}>Processing Time:</Text>
                <Text style={styles.processingValue}>
                  {Math.round(parseInt(processingTime || '0') / 1000)}s
                </Text>
              </View>
              <View style={styles.processingInfo}>
                <Text style={styles.processingLabel}>Method:</Text>
                <Text style={styles.processingValue}>
                  {isPremiumResult ? 'Premium AI' : isEnhancedMock ? 'Enhanced Preview' : 'Basic Preview'}
                </Text>
              </View>
              <View style={styles.processingInfo}>
                <Text style={styles.processingLabel}>Quality Score:</Text>
                <Text style={styles.processingValue}>
                  {qualityScore.toFixed(1)}/10
                </Text>
              </View>
              {preprocessingApplied && (
                <View style={styles.processingInfo}>
                  <Text style={styles.processingLabel}>Preprocessing:</Text>
                  <Text style={styles.processingValue}>Applied</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GradientButton
              title="Try Another Look"
              onPress={handleTryAnother}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
            
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(tabs)')}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.secondaryButtonGradient}>
                <Text style={styles.secondaryButtonText}>Back to Home</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  resultTypeBadgeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultTypeBadge: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  resultTypeBadgeContent: {
    flex: 1,
  },
  resultTypeBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  resultTypeBadgeSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  preprocessingBadge: {
    color: '#8B5CF6',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    marginTop: 4,
  },
  resultContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  resultImageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    aspectRatio: 3/4,
    position: 'relative',
  },
  resultImageGradient: {
    flex: 1,
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00000080',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-end',
  },
  resultScore: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B80',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  fullSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00000080',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  fullSizeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    alignItems: 'center',
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  feedbackSection: {
    padding: 20,
    paddingTop: 8,
  },
  upgradeSection: {
    padding: 20,
    paddingTop: 0,
  },
  upgradeCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  upgradeTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  upgradeDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  upgradeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
  },
  upgradeFeatureText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  upgradeButton: {
    width: '100%',
  },
  processingSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  processingCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 12,
  },
  processingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  processingLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  processingValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actionButtons: {
    padding: 20,
    paddingTop: 8,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryButtonGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});