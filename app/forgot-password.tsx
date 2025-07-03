import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { GradientButton } from '@/components/GradientButton';
import { ArrowLeft, Mail, Shirt, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app.com/reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F8FAFC" size={24} />
            </TouchableOpacity>

            <View style={styles.successContent}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.successIcon}
              >
                <CheckCircle color="#FFFFFF" size={32} />
              </LinearGradient>
              
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successDescription}>
                We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
              </Text>

              <View style={styles.successActions}>
                <GradientButton
                  title="Back to Sign In"
                  onPress={() => router.push('/auth')}
                  variant="primary"
                  size="large"
                />
                
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={() => setEmailSent(false)}
                >
                  <Text style={styles.resendText}>Didn't receive email? Try again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F8FAFC" size={24} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.logoContainer}
              >
                <Shirt color="#FFFFFF" size={32} />
              </LinearGradient>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={['#16213E', '#1E293B']}
                  style={styles.inputWrapper}
                >
                  <Mail color="#64748B" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </LinearGradient>
              </View>

              <GradientButton
                title={loading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleResetPassword}
                disabled={loading}
                variant="primary"
                size="large"
                style={styles.resetButton}
              />
            </View>

            {/* Back to Sign In */}
            <View style={styles.backToSignIn}>
              <Text style={styles.backToSignInText}>Remember your password?</Text>
              <TouchableOpacity onPress={() => router.push('/auth')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  successContent: {
    alignItems: 'center',
    marginTop: 60,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successDescription: {
    color: '#94A3B8',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successActions: {
    width: '100%',
    gap: 16,
  },
  resendButton: {
    alignSelf: 'center',
  },
  resendText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 24,
    marginBottom: 32,
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
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  resetButton: {
    marginTop: 8,
  },
  backToSignIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  backToSignInText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  signInLink: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});