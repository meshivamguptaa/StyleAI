import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { GradientButton } from '@/components/GradientButton';
import { ArrowLeft, MessageSquare, Star, Bug, Lightbulb, Heart } from 'lucide-react-native';

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature' | 'compliment'>('general');
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    {
      id: 'general',
      title: 'General Feedback',
      description: 'Share your thoughts about the app',
      icon: MessageSquare,
      color: '#8B5CF6',
    },
    {
      id: 'bug',
      title: 'Report a Bug',
      description: 'Something not working as expected?',
      icon: Bug,
      color: '#EF4444',
    },
    {
      id: 'feature',
      title: 'Feature Request',
      description: 'Suggest a new feature or improvement',
      icon: Lightbulb,
      color: '#F59E0B',
    },
    {
      id: 'compliment',
      title: 'Compliment',
      description: 'Share what you love about StyleAI',
      icon: Heart,
      color: '#EC4899',
    },
  ];

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (feedbackType === 'general' && rating === 0) {
      Alert.alert('Error', 'Please provide a rating for general feedback');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input and will review it carefully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.ratingLabel}>How would you rate your experience?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Star
                size={32}
                color={star <= rating ? '#F59E0B' : '#374151'}
                fill={star <= rating ? '#F59E0B' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingText}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F8FAFC" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Send Feedback</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Feedback Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What type of feedback do you have?</Text>
              <View style={styles.typeGrid}>
                {feedbackTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      feedbackType === type.id && styles.typeCardSelected,
                    ]}
                    onPress={() => setFeedbackType(type.id as any)}
                  >
                    <LinearGradient
                      colors={
                        feedbackType === type.id
                          ? [`${type.color}20`, `${type.color}10`]
                          : ['#1F2937', '#374151']
                      }
                      style={styles.typeGradient}
                    >
                      <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                        <type.icon color={type.color} size={24} />
                      </View>
                      <Text style={styles.typeTitle}>{type.title}</Text>
                      <Text style={styles.typeDescription}>{type.description}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating (for general feedback) */}
            {feedbackType === 'general' && (
              <View style={styles.section}>
                {renderStars()}
              </View>
            )}

            {/* Subject */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={['#16213E', '#1E293B']}
                  style={styles.inputWrapper}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Brief description of your feedback"
                    placeholderTextColor="#64748B"
                    value={subject}
                    onChangeText={setSubject}
                    maxLength={100}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.characterCount}>{subject.length}/100</Text>
            </View>

            {/* Message */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Message *</Text>
              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={['#16213E', '#1E293B']}
                  style={styles.inputWrapper}
                >
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Please provide detailed feedback..."
                    placeholderTextColor="#64748B"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={6}
                    maxLength={1000}
                    textAlignVertical="top"
                  />
                </LinearGradient>
              </View>
              <Text style={styles.characterCount}>{message.length}/1000</Text>
            </View>

            {/* User Info */}
            {user && (
              <View style={styles.section}>
                <LinearGradient
                  colors={['#8B5CF610', '#EC489910']}
                  style={styles.userInfoCard}
                >
                  <Text style={styles.userInfoTitle}>Your Information</Text>
                  <Text style={styles.userInfoText}>Email: {user.email}</Text>
                  <Text style={styles.userInfoNote}>
                    We'll use this email to follow up on your feedback if needed.
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <GradientButton
                title={loading ? 'Submitting...' : 'Submit Feedback'}
                onPress={handleSubmit}
                disabled={loading}
                variant="primary"
                size="large"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
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
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  typeCardSelected: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  typeGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  typeIcon: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  typeTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  starsContainer: {
    alignItems: 'center',
    backgroundColor: '#8B5CF610',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  ratingLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  inputLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    minHeight: 120,
  },
  characterCount: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  userInfoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  userInfoTitle: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  userInfoText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  userInfoNote: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  submitSection: {
    marginTop: 8,
  },
});