import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { GradientButton } from '@/components/GradientButton';
import { Sparkles, Camera, Users, TrendingUp, Star, ArrowRight, Shirt } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  const features = [
    {
      icon: Camera,
      title: 'AI Try-On',
      description: 'See how clothes look on you instantly',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#A855F7'],
      action: () => router.push('/tryon'),
    },
    {
      icon: Sparkles,
      title: 'Style Assistant',
      description: 'Get personalized fashion advice',
      color: '#EC4899',
      gradient: ['#EC4899', '#F472B6'],
      action: () => router.push('/chat'),
    },
    {
      icon: Users,
      title: 'Style Community',
      description: 'Share and discover looks',
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
      action: () => router.push('/saved'),
    },
    {
      icon: TrendingUp,
      title: 'Trend Analytics',
      description: 'Stay ahead of fashion trends',
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      action: () => router.push('/subscription'),
    },
  ];

  const trendingLooks = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Summer Elegance',
      rating: 4.8,
      tries: '2.1k',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Business Chic',
      rating: 4.9,
      tries: '1.8k',
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1559113/pexels-photo-1559113.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Evening Glam',
      rating: 4.7,
      tries: '3.2k',
    },
  ];

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {user ? `Welcome back, ${profile?.full_name || 'Stylist'}!` : 'Welcome to StyleAI'}
              </Text>
              <Text style={styles.subtitle}>
                Discover your perfect style with AI
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.logoContainer}
              onPress={() => router.push('/about')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.logo}
              >
                <Shirt color="#FFFFFF" size={24} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <LinearGradient
            colors={['#8B5CF620', '#EC489920', '#06B6D410']}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLogoContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.heroLogo}
                >
                  <Shirt color="#FFFFFF" size={32} />
                </LinearGradient>
              </View>
              <Text style={styles.heroTitle}>
                Transform Your Style with AI
              </Text>
              <Text style={styles.heroDescription}>
                Experience the future of fashion with our advanced AI-powered virtual try-on technology and personalized style recommendations.
              </Text>
              <View style={styles.heroButtons}>
                <GradientButton
                  title={user ? "Start Styling" : "Get Started"}
                  onPress={() => user ? router.push('/tryon') : router.push('/auth')}
                  variant="primary"
                  size="large"
                />
                <TouchableOpacity 
                  style={styles.learnMoreButton}
                  onPress={() => router.push('/about')}
                >
                  <Text style={styles.learnMoreText}>Learn More</Text>
                  <ArrowRight color="#8B5CF6" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Features Grid */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Explore Features</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.featureCard}
                  onPress={feature.action}
                >
                  <LinearGradient
                    colors={['#16213E', '#1E293B']}
                    style={styles.featureCardGradient}
                  >
                    <LinearGradient
                      colors={feature.gradient}
                      style={styles.featureIcon}
                    >
                      <feature.icon color="#FFFFFF" size={24} />
                    </LinearGradient>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trending Looks */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Looks</Text>
              <TouchableOpacity onPress={() => router.push('/saved')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {trendingLooks.map((look) => (
                <TouchableOpacity key={look.id} style={styles.trendingCard}>
                  <Image source={{ uri: look.image }} style={styles.trendingImage} />
                  <LinearGradient
                    colors={['transparent', '#00000080']}
                    style={styles.trendingOverlay}
                  >
                    <View style={styles.trendingInfo}>
                      <Text style={styles.trendingTitle}>{look.title}</Text>
                      <View style={styles.trendingStats}>
                        <View style={styles.trendingStat}>
                          <Star color="#F59E0B" size={12} fill="#F59E0B" />
                          <Text style={styles.trendingStatText}>{look.rating}</Text>
                        </View>
                        <Text style={styles.trendingTries}>{look.tries} tries</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Stats Section (if user is logged in) */}
          {user && profile && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Your Style Journey</Text>
              <LinearGradient
                colors={['#16213E', '#1E293B']}
                style={styles.statsCard}
              >
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.total_tryons}</Text>
                    <Text style={styles.statLabel}>Try-Ons</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.saved_looks}</Text>
                    <Text style={styles.statLabel}>Saved Looks</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.subscription_tier === 'premium' ? 'Pro' : 'Free'}</Text>
                    <Text style={styles.statLabel}>Plan</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* CTA Section */}
          {!user && (
            <View style={styles.ctaSection}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.ctaCard}
              >
                <Text style={styles.ctaTitle}>Ready to Transform Your Style?</Text>
                <Text style={styles.ctaDescription}>
                  Join thousands of fashion lovers using AI to discover their perfect look.
                </Text>
                <GradientButton
                  title="Sign Up Free"
                  onPress={() => router.push('/auth')}
                  variant="accent"
                  size="large"
                  style={styles.ctaButton}
                />
              </LinearGradient>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 12,
  },
  greeting: {
    color: '#F8FAFC',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  logoContainer: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    margin: 20,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLogoContainer: {
    marginBottom: 24,
  },
  heroLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroDescription: {
    color: '#CBD5E1',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  heroButtons: {
    alignItems: 'center',
    gap: 16,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  learnMoreText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seeAllText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    aspectRatio: 1,
  },
  featureCardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureIcon: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  featureTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  trendingCard: {
    width: 160,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  trendingInfo: {
    gap: 4,
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  trendingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingStatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  trendingTries: {
    color: '#CBD5E1',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statsCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#8B5CF6',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  ctaSection: {
    padding: 20,
    paddingBottom: 40,
  },
  ctaCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 24,
  },
  ctaButton: {
    marginTop: 8,
  },
});