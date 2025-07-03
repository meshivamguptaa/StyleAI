import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { GradientButton } from '@/components/GradientButton';
import { ArrowLeft, User, Mail, Calendar, Camera, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    age: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: user?.email || '',
        age: '', // Add age field to profile schema if needed
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
      });

      if (error) {
        Alert.alert('Error', error);
      } else {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
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
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save color="#8B5CF6" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.avatar}
                >
                  {formData.avatar_url ? (
                    <Image source={{ uri: formData.avatar_url }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {formData.full_name?.[0] || user?.email?.[0] || 'U'}
                    </Text>
                  )}
                </LinearGradient>
                <View style={styles.cameraButton}>
                  <Camera color="#FFFFFF" size={16} />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to change profile photo</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={['#16213E', '#1E293B']}
                    style={styles.inputWrapper}
                  >
                    <User color="#64748B" size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#64748B"
                      value={formData.full_name}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                      autoCapitalize="words"
                    />
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={['#16213E', '#1E293B']}
                    style={[styles.inputWrapper, styles.inputDisabled]}
                  >
                    <Mail color="#64748B" size={20} />
                    <TextInput
                      style={[styles.input, styles.inputTextDisabled]}
                      placeholder="Email address"
                      placeholderTextColor="#64748B"
                      value={formData.email}
                      editable={false}
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.inputHint}>Email cannot be changed</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age (Optional)</Text>
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={['#16213E', '#1E293B']}
                    style={styles.inputWrapper}
                  >
                    <Calendar color="#64748B" size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your age"
                      placeholderTextColor="#64748B"
                      value={formData.age}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Profile Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Profile Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>Use a clear, well-lit photo for your profile picture</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>Keep your profile information up to date for better recommendations</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>Your age helps us provide more personalized style suggestions</Text>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.saveSection}>
              <GradientButton
                title={loading ? 'Saving...' : 'Save Changes'}
                onPress={handleSave}
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
  saveButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 8,
    borderWidth: 3,
    borderColor: '#1A1A2E',
  },
  avatarHint: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  form: {
    gap: 24,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  inputTextDisabled: {
    color: '#94A3B8',
  },
  inputHint: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#8B5CF610',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
    marginBottom: 32,
  },
  tipsTitle: {
    color: '#8B5CF6',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 6,
  },
  tipText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  saveSection: {
    marginTop: 8,
  },
});