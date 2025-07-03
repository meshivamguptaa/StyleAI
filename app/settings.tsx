import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Bell, Shield, CreditCard, Trash2, CircleHelp as HelpCircle, FileText, Moon, Globe, Volume2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion
            Alert.alert('Account Deletion', 'Account deletion feature will be implemented in production.');
          },
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Push Notifications',
          description: 'Receive updates about new features and trends',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Moon,
          title: 'Dark Mode',
          description: 'Use dark theme throughout the app',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: Volume2,
          title: 'Sound Effects',
          description: 'Play sounds for interactions and feedback',
          type: 'toggle',
          value: soundEffects,
          onToggle: setSoundEffects,
        },
        {
          icon: Globe,
          title: 'Language',
          description: 'English (US)',
          type: 'navigation',
          onPress: () => Alert.alert('Language', 'Language selection will be available in future updates.'),
        },
      ],
    },
    {
      title: 'Account & Billing',
      items: [
        {
          icon: CreditCard,
          title: 'Billing Details',
          description: 'Manage payment methods and billing info',
          type: 'navigation',
          onPress: () => router.push('/subscription'),
        },
        {
          icon: Shield,
          title: 'Privacy & Security',
          description: 'Control your privacy settings',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy', 'Privacy settings will be available in future updates.'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          description: 'Get help with using StyleAI',
          type: 'navigation',
          onPress: () => router.push('/feedback'),
        },
        {
          icon: FileText,
          title: 'Terms & Privacy Policy',
          description: 'Read our terms and privacy policy',
          type: 'navigation',
          onPress: () => Alert.alert('Legal', 'Terms and Privacy Policy will be available in future updates.'),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: Trash2,
          title: 'Delete Account',
          description: 'Permanently delete your account and data',
          type: 'danger',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity
        key={item.title}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.settingGradient}
        >
          <View style={styles.settingContent}>
            <View style={[
              styles.settingIcon,
              item.type === 'danger' && styles.settingIconDanger
            ]}>
              <item.icon 
                color={item.type === 'danger' ? '#EF4444' : '#8B5CF6'} 
                size={20} 
              />
            </View>
            <View style={styles.settingText}>
              <Text style={[
                styles.settingTitle,
                item.type === 'danger' && styles.settingTitleDanger
              ]}>
                {item.title}
              </Text>
              <Text style={styles.settingDescription}>{item.description}</Text>
            </View>
            {item.type === 'toggle' && (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#374151', true: '#8B5CF6' }}
                thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userSection}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.userAvatar}
            >
              <Text style={styles.userAvatarText}>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userStatus}>StyleAI Member</Text>
            </View>
          </View>

          {/* Settings Groups */}
          {settingsGroups.map((group, groupIndex) => (
            <View key={group.title} style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupItems}>
                {group.items.map(renderSettingItem)}
              </View>
            </View>
          ))}

          {/* App Version */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>StyleAI Version 1.0.0</Text>
            <Text style={styles.versionSubtext}>Built with ❤️ for fashion lovers</Text>
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  userStatus: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  settingsGroup: {
    marginBottom: 32,
  },
  groupTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  groupItems: {
    paddingHorizontal: 20,
    gap: 12,
  },
  settingItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingGradient: {
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  settingIcon: {
    backgroundColor: '#8B5CF620',
    borderRadius: 10,
    padding: 10,
  },
  settingIconDanger: {
    backgroundColor: '#EF444420',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  settingTitleDanger: {
    color: '#EF4444',
  },
  settingDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
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
  versionSubtext: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});