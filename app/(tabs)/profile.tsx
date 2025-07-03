import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTryOnLimits } from '@/hooks/useTryOnLimits';
import { User, Settings, Crown, Camera, Star, TrendingUp, Calendar, Award, LogOut, CreditCard as Edit, Share, Heart, MessageSquare } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { limits } = useTryOnLimits();

  if (!user) {
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.authPrompt}>
            <User color="#8B5CF6" size={48} />
            <Text style={styles.authTitle}>Profile</Text>
            <Text style={styles.authDescription}>
              Sign in to access your profile, view your style journey, and manage your preferences.
            </Text>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth')}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.authButtonGradient}>
                <Text style={styles.authButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const achievements = [
    {
      id: 1,
      title: 'Style Explorer',
      description: 'Completed 10 try-ons',
      icon: Star,
      color: '#F59E0B',
      earned: limits.count >= 10,
      date: '2024-01-10',
    },
    {
      id: 2,
      title: 'Trendsetter',
      description: 'Saved 25 looks',
      icon: TrendingUp,
      color: '#EC4899',
      earned: (profile?.saved_looks || 0) >= 25,
      date: '2024-01-08',
    },
    {
      id: 3,
      title: 'Fashion Enthusiast',
      description: 'Used app for 30 days',
      icon: Calendar,
      color: '#06B6D4',
      earned: false,
      progress: 15,
    },
    {
      id: 4,
      title: 'Style Guru',
      description: 'Premium subscriber',
      icon: Award,
      color: '#10B981',
      earned: limits.isPremium,
      progress: limits.isPremium ? 10 : 0,
    },
  ];

  const stats = [
    {
      label: 'Try-Ons',
      value: limits.count,
      icon: Camera,
      color: '#8B5CF6',
    },
    {
      label: 'Saved Looks',
      value: profile?.saved_looks || 0,
      icon: Heart,
      color: '#EC4899',
    },
    {
      label: 'Plan',
      value: limits.isPremium ? 'Premium' : 'Free',
      icon: Crown,
      color: '#F59E0B',
    },
    {
      label: 'Remaining',
      value: limits.isPremium ? '∞' : limits.remaining,
      icon: Star,
      color: '#10B981',
    },
  ];

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => router.push('/settings')}
            >
              <Settings color="#6B7280" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Share color="#6B7280" size={20} />
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.avatar}
              >
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
                  </Text>
                )}
              </LinearGradient>
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => router.push('/edit-profile')}
              >
                <Edit color="#FFFFFF" size={12} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>
              {profile?.full_name || 'Fashion Enthusiast'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            
            {limits.isPremium ? (
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.premiumBadge}
              >
                <Crown color="#FFFFFF" size={16} />
                <Text style={styles.premiumText}>Premium Member</Text>
              </LinearGradient>
            ) : (
              <TouchableOpacity 
                style={styles.upgradeButton} 
                onPress={() => router.push('/subscription')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.upgradeGradient}
                >
                  <Crown color="#FFFFFF" size={16} />
                  <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Style Journey</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <LinearGradient
                  key={index}
                  colors={['#1F2937', '#374151']}
                  style={styles.statCard}
                >
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <stat.icon color={stat.color} size={20} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.achievementCount}>
                {achievements.filter(a => a.earned).length}/{achievements.length}
              </Text>
            </View>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <LinearGradient
                  key={achievement.id}
                  colors={achievement.earned ? ['#1F2937', '#374151'] : ['#111827', '#1F2937']}
                  style={[
                    styles.achievementCard,
                    !achievement.earned && styles.achievementCardLocked,
                  ]}
                >
                  <View style={[
                    styles.achievementIcon,
                    { backgroundColor: `${achievement.color}${achievement.earned ? '30' : '10'}` }
                  ]}>
                    <achievement.icon 
                      color={achievement.earned ? achievement.color : '#6B7280'} 
                      size={24} 
                    />
                  </View>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.achievementTitleLocked,
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.earned && styles.achievementDescriptionLocked,
                  ]}>
                    {achievement.description}
                  </Text>
                  {achievement.earned ? (
                    <Text style={styles.achievementDate}>
                      Earned {new Date(achievement.date).toLocaleDateString()}
                    </Text>
                  ) : achievement.progress ? (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${(achievement.progress / 10) * 100}%`,
                              backgroundColor: achievement.color,
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{achievement.progress}/10</Text>
                    </View>
                  ) : null}
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsList}>
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => router.push('/edit-profile')}
              >
                <LinearGradient colors={['#1F2937', '#374151']} style={styles.actionGradient}>
                  <Edit color="#8B5CF6" size={20} />
                  <Text style={styles.actionText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => router.push('/saved')}
              >
                <LinearGradient colors={['#1F2937', '#374151']} style={styles.actionGradient}>
                  <Heart color="#EC4899" size={20} />
                  <Text style={styles.actionText}>View Saved Looks</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => router.push('/subscription')}
              >
                <LinearGradient colors={['#1F2937', '#374151']} style={styles.actionGradient}>
                  <Crown color="#F59E0B" size={20} />
                  <Text style={styles.actionText}>
                    {limits.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => router.push('/feedback')}
              >
                <LinearGradient colors={['#1F2937', '#374151']} style={styles.actionGradient}>
                  <MessageSquare color="#06B6D4" size={20} />
                  <Text style={styles.actionText}>Send Feedback</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => router.push('/about')}
              >
                <LinearGradient colors={['#1F2937', '#374151']} style={styles.actionGradient}>
                  <User color="#10B981" size={20} />
                  <Text style={styles.actionText}>About StyleAI</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
                <LinearGradient colors={['#1F2937', '#374151']} style={styles.actionGradient}>
                  <LogOut color="#EF4444" size={20} />
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>Sign Out</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    color: '#F9FAFB',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  authDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  authButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  settingsButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  userName: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  upgradeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementCount: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statIcon: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  statValue: {
    color: '#F9FAFB',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  achievementsSection: {
    padding: 20,
    paddingTop: 0,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  achievementTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: '#6B7280',
  },
  achievementDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescriptionLocked: {
    color: '#6B7280',
  },
  achievementDate: {
    color: '#8B5CF6',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});