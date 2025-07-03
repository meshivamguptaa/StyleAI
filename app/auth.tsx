import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { GradientButton } from '@/components/GradientButton';
import { Shirt, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        if (isSignUp) {
          Alert.alert(
            'Success!', 
            'Account created successfully! Please check your email to verify your account, then sign in.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

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
              <Text style={styles.title}>
                {isSignUp ? 'Join StyleAI' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp 
                  ? 'Create your account and transform your style with AI'
                  : 'Sign in to continue your style journey'
                }
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={['#16213E', '#1E293B']}
                    style={styles.inputWrapper}
                  >
                    <User color="#64748B" size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#64748B"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </LinearGradient>
                </View>
              )}

              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={['#16213E', '#1E293B']}
                  style={styles.inputWrapper}
                >
                  <Mail color="#64748B" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </LinearGradient>
              </View>

              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={['#16213E', '#1E293B']}
                  style={styles.inputWrapper}
                >
                  <Lock color="#64748B" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#64748B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff color="#64748B" size={20} />
                    ) : (
                      <Eye color="#64748B" size={20} />
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={['#16213E', '#1E293B']}
                    style={styles.inputWrapper}
                  >
                    <Lock color="#64748B" size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#64748B"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? (
                        <EyeOff color="#64748B" size={20} />
                      ) : (
                        <Eye color="#64748B" size={20} />
                      )}
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}

              <GradientButton
                title={loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                onPress={handleAuth}
                disabled={loading}
                variant="primary"
                size="large"
                style={styles.authButton}
              />

              {!isSignUp && (
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => router.push('/forgot-password')}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Text style={styles.toggleButton}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Features Preview */}
            {isSignUp && (
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What you'll get:</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>AI-powered virtual try-on</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Personalized style recommendations</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Save and organize your looks</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Fashion trend insights</Text>
                  </View>
                </View>
              </View>
            )}
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
    marginBottom: 8,
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
    gap: 20,
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
  authButton: {
    marginTop: 8,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  toggleButton: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  featuresContainer: {
    backgroundColor: '#8B5CF610',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  featuresTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
});