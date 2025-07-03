import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ImageUploader } from '@/components/ImageUploader';
import { GradientButton } from '@/components/GradientButton';
import { ArrowLeft, Camera, Upload, Lightbulb, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function UploadUserScreen() {
  const router = useRouter();
  const [userImage, setUserImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'user' | 'clothing' | 'review'>('user');

  const tips = [
    'Stand against a plain, light-colored background',
    'Ensure good lighting - natural light works best',
    'Keep your full body visible in the frame',
    'Stand straight with arms slightly away from your body',
    'Wear form-fitting clothes for better results',
  ];

  const handleUserImageSelect = (uri: string) => {
    setUserImage(uri);
  };

  const handleClothingImageSelect = (uri: string) => {
    setClothingImage(uri);
  };

  const handleNext = () => {
    if (currentStep === 'user' && userImage) {
      setCurrentStep('clothing');
    } else if (currentStep === 'clothing' && clothingImage) {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'clothing') {
      setCurrentStep('user');
    } else if (currentStep === 'review') {
      setCurrentStep('clothing');
    } else {
      router.back();
    }
  };

  const handleStartTryOn = () => {
    // Navigate to processing/results screen
    router.push('/tryon-results');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.stepDot, currentStep === 'user' && styles.stepDotActive]} />
        <Text style={[styles.stepText, currentStep === 'user' && styles.stepTextActive]}>
          Your Photo
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepDot, 
          (currentStep === 'clothing' || currentStep === 'review') && styles.stepDotActive
        ]} />
        <Text style={[
          styles.stepText, 
          (currentStep === 'clothing' || currentStep === 'review') && styles.stepTextActive
        ]}>
          Clothing
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepContainer}>
        <View style={[styles.stepDot, currentStep === 'review' && styles.stepDotActive]} />
        <Text style={[styles.stepText, currentStep === 'review' && styles.stepTextActive]}>
          Review
        </Text>
      </View>
    </View>
  );

  const renderUserStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Upload Your Photo</Text>
      <Text style={styles.stepDescription}>
        Take or upload a photo of yourself for the virtual try-on
      </Text>
      
      <ImageUploader
        onImageSelect={handleUserImageSelect}
        placeholder="Upload your photo"
        aspectRatio={[3, 4]}
      />

      <View style={styles.tipsContainer}>
        <View style={styles.tipsHeader}>
          <Lightbulb color="#F59E0B" size={20} />
          <Text style={styles.tipsTitle}>Tips for best results</Text>
        </View>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderClothingStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Add Clothing Item</Text>
      <Text style={styles.stepDescription}>
        Upload an image of the clothing item you want to try on
      </Text>
      
      <ImageUploader
        onImageSelect={handleClothingImageSelect}
        placeholder="Upload clothing image"
        aspectRatio={[1, 1]}
      />

      <View style={styles.clothingTips}>
        <Text style={styles.clothingTipsTitle}>Clothing Photo Tips:</Text>
        <View style={styles.tipItem}>
          <CheckCircle color="#10B981" size={16} />
          <Text style={styles.tipText}>Use clear, well-lit photos</Text>
        </View>
        <View style={styles.tipItem}>
          <CheckCircle color="#10B981" size={16} />
          <Text style={styles.tipText}>Show the full garment</Text>
        </View>
        <View style={styles.tipItem}>
          <CheckCircle color="#10B981" size={16} />
          <Text style={styles.tipText}>Avoid wrinkled or folded items</Text>
        </View>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Try On</Text>
      <Text style={styles.stepDescription}>
        Ready to see how this looks on you? Our AI will process your images and create a virtual try-on.
      </Text>

      <View style={styles.reviewContainer}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.reviewCard}
        >
          <Text style={styles.reviewCardTitle}>Your Photos</Text>
          <View style={styles.reviewImages}>
            <View style={styles.reviewImageContainer}>
              <Text style={styles.reviewImageLabel}>Your Photo</Text>
              <View style={styles.reviewImagePlaceholder}>
                <Camera color="#8B5CF6" size={24} />
                <Text style={styles.reviewImageText}>Ready</Text>
              </View>
            </View>
            <View style={styles.reviewImageContainer}>
              <Text style={styles.reviewImageLabel}>Clothing</Text>
              <View style={styles.reviewImagePlaceholder}>
                <Upload color="#EC4899" size={24} />
                <Text style={styles.reviewImageText}>Ready</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#8B5CF620', '#EC489920']}
          style={styles.processingInfo}
        >
          <Text style={styles.processingTitle}>AI Processing</Text>
          <Text style={styles.processingDescription}>
            Our advanced AI will analyze your body shape, pose, and the clothing item to create a realistic virtual try-on experience.
          </Text>
          <View style={styles.processingFeatures}>
            <Text style={styles.processingFeature}>• Pose detection and alignment</Text>
            <Text style={styles.processingFeature}>• Color and lighting adjustment</Text>
            <Text style={styles.processingFeature}>• Realistic fabric simulation</Text>
            <Text style={styles.processingFeature}>• Style compatibility analysis</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Virtual Try-On</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {currentStep === 'user' && renderUserStep()}
          {currentStep === 'clothing' && renderClothingStep()}
          {currentStep === 'review' && renderReviewStep()}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {currentStep === 'review' ? (
            <GradientButton
              title="Start Virtual Try-On"
              onPress={handleStartTryOn}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
          ) : (
            <GradientButton
              title="Next"
              onPress={handleNext}
              variant="primary"
              size="large"
              disabled={
                (currentStep === 'user' && !userImage) ||
                (currentStep === 'clothing' && !clothingImage)
              }
              style={styles.actionButton}
            />
          )}
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
  backButton: {
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepContainer: {
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  stepDotActive: {
    backgroundColor: '#8B5CF6',
  },
  stepText: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  stepTextActive: {
    color: '#8B5CF6',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#374151',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
    gap: 24,
  },
  stepTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  stepDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  tipsContainer: {
    backgroundColor: '#F59E0B10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  tipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  tipText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  clothingTips: {
    backgroundColor: '#10B98110',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  clothingTipsTitle: {
    color: '#10B981',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  reviewContainer: {
    gap: 20,
  },
  reviewCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  reviewCardTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewImages: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reviewImageContainer: {
    alignItems: 'center',
    gap: 8,
  },
  reviewImageLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  reviewImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  reviewImageText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  processingInfo: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  processingTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  processingDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  processingFeatures: {
    gap: 8,
  },
  processingFeature: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  bottomActions: {
    padding: 20,
    paddingTop: 12,
  },
  actionButton: {
    width: '100%',
  },
});