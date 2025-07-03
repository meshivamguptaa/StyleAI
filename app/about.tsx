import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shirt, Sparkles, Users, Shield, Heart, ExternalLink } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Technology',
      description: 'Advanced machine learning algorithms for realistic virtual try-on experiences.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with fashion enthusiasts and share your style discoveries.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your photos and data are secure with enterprise-grade encryption.',
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Crafted by fashion lovers for fashion lovers around the world.',
    },
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      description: 'Former fashion industry executive with 15+ years experience.',
    },
    {
      name: 'Alex Chen',
      role: 'CTO & Co-Founder',
      description: 'AI researcher specializing in computer vision and machine learning.',
    },
    {
      name: 'Maya Patel',
      role: 'Head of Design',
      description: 'Award-winning UX designer passionate about inclusive fashion.',
    },
  ];

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About StyleAI</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.logoContainer}
            >
              <Shirt color="#FFFFFF" size={48} />
            </LinearGradient>
            <Text style={styles.heroTitle}>StyleAI</Text>
            <Text style={styles.heroSubtitle}>AI Fashion Advisor</Text>
            <Text style={styles.heroDescription}>
              Revolutionizing the way you discover, try, and shop for fashion with the power of artificial intelligence.
            </Text>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <LinearGradient
              colors={['#1F2937', '#374151']}
              style={styles.missionCard}
            >
              <Text style={styles.missionText}>
                To democratize fashion by making style accessible to everyone through innovative AI technology. 
                We believe that everyone deserves to feel confident and express their unique style, 
                regardless of their fashion background or budget.
              </Text>
            </LinearGradient>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Makes Us Special</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <LinearGradient
                  key={index}
                  colors={['#1F2937', '#374151']}
                  style={styles.featureCard}
                >
                  <View style={styles.featureIcon}>
                    <feature.icon color="#8B5CF6" size={24} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Team Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meet Our Team</Text>
            <View style={styles.teamGrid}>
              {teamMembers.map((member, index) => (
                <LinearGradient
                  key={index}
                  colors={['#1F2937', '#374151']}
                  style={styles.teamCard}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    style={styles.teamAvatar}
                  >
                    <Text style={styles.teamAvatarText}>{member.name[0]}</Text>
                  </LinearGradient>
                  <Text style={styles.teamName}>{member.name}</Text>
                  <Text style={styles.teamRole}>{member.role}</Text>
                  <Text style={styles.teamDescription}>{member.description}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By the Numbers</Text>
            <View style={styles.statsGrid}>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.statCard}>
                <Text style={styles.statNumber}>100K+</Text>
                <Text style={styles.statLabel}>Happy Users</Text>
              </LinearGradient>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.statCard}>
                <Text style={styles.statNumber}>1M+</Text>
                <Text style={styles.statLabel}>Try-Ons</Text>
              </LinearGradient>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.statCard}>
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Clothing Items</Text>
              </LinearGradient>
              <LinearGradient colors={['#1F2937', '#374151']} style={styles.statCard}>
                <Text style={styles.statNumber}>99.9%</Text>
                <Text style={styles.statLabel}>Uptime</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            <LinearGradient
              colors={['#8B5CF620', '#EC489920']}
              style={styles.contactCard}
            >
              <Text style={styles.contactTitle}>We'd love to hear from you!</Text>
              <Text style={styles.contactDescription}>
                Have questions, feedback, or just want to say hello? Reach out to us through any of these channels.
              </Text>
              <View style={styles.contactLinks}>
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => handleLinkPress('mailto:hello@styleai.com')}
                >
                  <Text style={styles.contactLinkText}>hello@styleai.com</Text>
                  <ExternalLink color="#8B5CF6" size={16} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => handleLinkPress('https://twitter.com/styleai')}
                >
                  <Text style={styles.contactLinkText}>@styleai</Text>
                  <ExternalLink color="#8B5CF6" size={16} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => router.push('/feedback')}
                >
                  <Text style={styles.contactLinkText}>Send Feedback</Text>
                  <ExternalLink color="#8B5CF6" size={16} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Version Info */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>StyleAI Version 1.0.0</Text>
            <Text style={styles.versionDate}>Released January 2024</Text>
            <Text style={styles.copyright}>© 2024 StyleAI. All rights reserved.</Text>
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
  heroSection: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  heroTitle: {
    color: '#F9FAFB',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#8B5CF6',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  heroDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  missionCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  missionText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  featureIcon: {
    backgroundColor: '#8B5CF620',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  featureTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  teamGrid: {
    gap: 16,
  },
  teamCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  teamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  teamName: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  teamRole: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  teamDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statNumber: {
    color: '#8B5CF6',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  contactCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  contactTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactLinks: {
    gap: 12,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  contactLinkText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  versionSection: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  versionText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  versionDate: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  copyright: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});