import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { ArrowLeft, Camera, CircleCheck as CheckCircle, Circle as XCircle, Lightbulb, User, RotateCcw } from 'lucide-react-native';

export default function PoseDetectionScreen() {
  const router = useRouter();
  const [selectedPose, setSelectedPose] = useState<number | null>(null);

  const poses = [
    {
      id: 1,
      title: 'Front Facing',
      description: 'Stand straight facing the camera',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300',
      isRecommended: true,
      difficulty: 'Easy',
      tips: [
        'Stand with feet shoulder-width apart',
        'Keep arms slightly away from your body',
        'Look directly at the camera',
        'Maintain good posture'
      ]
    },
    {
      id: 2,
      title: 'Side Profile',
      description: 'Turn to show your side profile',
      image: 'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=300',
      isRecommended: false,
      difficulty: 'Medium',
      tips: [
        'Turn 90 degrees to the side',
        'Keep your back straight',
        'Arms should be visible',
        'Chin up, shoulders back'
      ]
    },
    {
      id: 3,
      title: 'Three-Quarter View',
      description: 'Angle your body at 45 degrees',
      image: 'https://images.pexels.com/photos/1559113/pexels-photo-1559113.jpeg?auto=compress&cs=tinysrgb&w=300',
      isRecommended: true,
      difficulty: 'Medium',
      tips: [
        'Turn body 45 degrees from camera',
        'Keep both shoulders visible',
        'Slight angle shows dimension',
        'Natural, relaxed stance'
      ]
    },
    {
      id: 4,
      title: 'Walking Pose',
      description: 'Dynamic pose while walking',
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=300',
      isRecommended: false,
      difficulty: 'Hard',
      tips: [
        'Mid-step position',
        'Natural arm movement',
        'Confident stride',
        'Good for showing flow'
      ]
    }
  ];

  const poseGuidelines = [
    {
      icon: CheckCircle,
      title: 'Good Lighting',
      description: 'Use natural light or bright, even lighting',
      isGood: true,
    },
    {
      icon: CheckCircle,
      title: 'Plain Background',
      description: 'Stand against a solid, light-colored wall',
      isGood: true,
    },
    {
      icon: CheckCircle,
      title: 'Full Body Visible',
      description: 'Make sure your entire body fits in the frame',
      isGood: true,
    },
    {
      icon: XCircle,
      title: 'Avoid Shadows',
      description: 'Don\'t stand with harsh shadows on your body',
      isGood: false,
    },
    {
      icon: XCircle,
      title: 'No Busy Patterns',
      description: 'Avoid patterned backgrounds or clothing',
      isGood: false,
    },
    {
      icon: XCircle,
      title: 'Don\'t Cut Off Body Parts',
      description: 'Ensure hands, feet, and head are fully visible',
      isGood: false,
    },
  ];

  const handlePoseSelect = (poseId: number) => {
    setSelectedPose(poseId);
  };

  const handleContinue = () => {
    // Navigate back to upload with selected pose guidance
    router.back();
  };

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pose Guide</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.introSection}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.introIcon}
            >
              <User color="#FFFFFF" size={32} />
            </LinearGradient>
            <Text style={styles.introTitle}>Perfect Your Pose</Text>
            <Text style={styles.introDescription}>
              The right pose makes all the difference in virtual try-on results. 
              Follow these guidelines for the best AI analysis.
            </Text>
          </View>

          {/* Pose Options */}
          <View style={styles.posesSection}>
            <Text style={styles.sectionTitle}>Choose Your Pose</Text>
            <View style={styles.posesGrid}>
              {poses.map((pose) => (
                <TouchableOpacity
                  key={pose.id}
                  style={[
                    styles.poseCard,
                    selectedPose === pose.id && styles.poseCardSelected
                  ]}
                  onPress={() => handlePoseSelect(pose.id)}
                >
                  <LinearGradient
                    colors={selectedPose === pose.id ? ['#8B5CF620', '#EC489920'] : ['#1F2937', '#374151']}
                    style={styles.poseCardGradient}
                  >
                    {pose.isRecommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                    
                    <View style={styles.poseImageContainer}>
                      <Image source={{ uri: pose.image }} style={styles.poseImage} />
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>{pose.difficulty}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.poseInfo}>
                      <Text style={styles.poseTitle}>{pose.title}</Text>
                      <Text style={styles.poseDescription}>{pose.description}</Text>
                    </View>

                    {selectedPose === pose.id && (
                      <View style={styles.poseTips}>
                        <Text style={styles.poseTipsTitle}>Tips:</Text>
                        {pose.tips.map((tip, index) => (
                          <View key={index} style={styles.poseTip}>
                            <View style={styles.poseTipDot} />
                            <Text style={styles.poseTipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesSection}>
            <Text style={styles.sectionTitle}>Photo Guidelines</Text>
            <View style={styles.guidelinesList}>
              <View style={styles.guidelinesColumn}>
                <Text style={styles.guidelinesColumnTitle}>✓ Do This</Text>
                {poseGuidelines.filter(g => g.isGood).map((guideline, index) => (
                  <View key={index} style={styles.guidelineItem}>
                    <guideline.icon color="#10B981" size={16} />
                    <View style={styles.guidelineContent}>
                      <Text style={styles.guidelineTitle}>{guideline.title}</Text>
                      <Text style={styles.guidelineDescription}>{guideline.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.guidelinesColumn}>
                <Text style={styles.guidelinesColumnTitle}>✗ Avoid This</Text>
                {poseGuidelines.filter(g => !g.isGood).map((guideline, index) => (
                  <View key={index} style={styles.guidelineItem}>
                    <guideline.icon color="#EF4444" size={16} />
                    <View style={styles.guidelineContent}>
                      <Text style={styles.guidelineTitle}>{guideline.title}</Text>
                      <Text style={styles.guidelineDescription}>{guideline.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Pro Tips */}
          <View style={styles.proTipsSection}>
            <LinearGradient
              colors={['#F59E0B20', '#D97706']}
              style={styles.proTipsCard}
            >
              <View style={styles.proTipsHeader}>
                <Lightbulb color="#F59E0B" size={24} />
                <Text style={styles.proTipsTitle}>Pro Tips</Text>
              </View>
              <View style={styles.proTipsList}>
                <Text style={styles.proTip}>• Use a timer or ask someone to help take the photo</Text>
                <Text style={styles.proTip}>• Take multiple shots and choose the best one</Text>
                <Text style={styles.proTip}>• Relax and breathe naturally - tension shows in photos</Text>
                <Text style={styles.proTip}>• Consider your outfit - form-fitting clothes work best</Text>
                <Text style={styles.proTip}>• Check the photo before uploading - retake if needed</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            <GradientButton
              title={selectedPose ? "Continue with Selected Pose" : "Got It, Let's Continue"}
              onPress={handleContinue}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
            
            <TouchableOpacity style={styles.retakeButton} onPress={() => router.push('/upload-user')}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.retakeButtonGradient}>
                <RotateCcw color="#8B5CF6" size={16} />
                <Text style={styles.retakeButtonText}>Retake Photo</Text>
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  introDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  posesSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  posesGrid: {
    gap: 16,
  },
  poseCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  poseCardSelected: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  poseCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  poseImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  poseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#00000080',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  poseInfo: {
    marginBottom: 12,
  },
  poseTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  poseDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  poseTips: {
    backgroundColor: '#8B5CF610',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  poseTipsTitle: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  poseTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  poseTipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    marginTop: 6,
  },
  poseTipText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 16,
  },
  guidelinesSection: {
    padding: 20,
    paddingTop: 0,
  },
  guidelinesList: {
    gap: 20,
  },
  guidelinesColumn: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  guidelinesColumnTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  guidelineDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  proTipsSection: {
    padding: 20,
    paddingTop: 0,
  },
  proTipsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  proTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  proTipsTitle: {
    color: '#F59E0B',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  proTipsList: {
    gap: 8,
  },
  proTip: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  actionSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  retakeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retakeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  retakeButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});