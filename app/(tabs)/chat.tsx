import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat } from '@/hooks/useAIChat';
import { MediaMessage } from '@/components/MediaMessage';
import { MediaUploader } from '@/components/MediaUploader';
import { VoiceToggle } from '@/components/VoiceToggle';
import { Send, Sparkles, Camera, Palette, TrendingUp, Shirt, CircleAlert as AlertCircle, RefreshCw, Volume2 } from 'lucide-react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    messages, 
    isTyping, 
    realTimeSuggestions, 
    sendMessage, 
    createNewChatSession,
    error: chatError,
    loading: chatLoading
  } = useAIChat();
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (!user) {
    return (
      <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.authPrompt}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.authIcon}
            >
              <Shirt color="#FFFFFF" size={48} />
            </LinearGradient>
            <Text style={styles.authTitle}>AI Style Assistant</Text>
            <Text style={styles.authDescription}>
              Sign in to chat with your personal AI stylist powered by advanced AI and get personalized fashion advice with voice responses.
            </Text>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth')}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.authButtonGradient}>
                <Text style={styles.authButtonText}>Sign In to Chat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const quickActions = [
    {
      icon: Camera,
      title: 'Outfit Analysis',
      description: 'Analyze my current outfit',
      color: '#8B5CF6',
      action: () => setInputText('What do you think about this outfit?'),
    },
    {
      icon: Palette,
      title: 'Color Matching',
      description: 'Help me match colors',
      color: '#EC4899',
      action: () => setInputText('Can you help me with color coordination for my outfit?'),
    },
    {
      icon: TrendingUp,
      title: 'Style Trends',
      description: 'What\'s trending now?',
      color: '#06B6D4',
      action: () => setInputText('What are the latest fashion trends I should know about?'),
    },
    {
      icon: Sparkles,
      title: 'Style Quiz',
      description: 'Find my style type',
      color: '#10B981',
      action: () => setInputText('Can you help me discover my personal style?'),
    },
  ];

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const message = inputText.trim();
    setInputText('');
    setIsSending(true);
    
    try {
      await sendMessage(message, undefined, false, undefined, undefined, voiceEnabled);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaSelect = async (type: 'image' | 'voice', uri: string, duration?: number) => {
    setIsSending(true);
    try {
      const messageText = type === 'image' ? 'What do you think about this?' : 'Voice message';
      await sendMessage(messageText, uri, type === 'voice', undefined, duration, voiceEnabled);
    } catch (error) {
      console.error('Failed to send media message:', error);
      Alert.alert('Error', 'Failed to send media message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaUploadComplete = (url: string, type: 'image' | 'voice') => {
    console.log(`${type} uploaded successfully:`, url);
  };

  const handleMediaUploadError = (error: string) => {
    console.error('Media upload error:', error);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    action.action();
  };

  const handleImagePress = (imageUrl: string) => {
    // Could implement full-screen image viewer here
    console.log('Image pressed:', imageUrl);
  };

  const handleRetryConnection = () => {
    createNewChatSession();
  };

  // Show error state if there's a persistent error
  const showErrorState = chatError && !chatLoading && messages.length === 0;

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.aiAvatar}
              >
                <Sparkles color="#FFFFFF" size={20} />
              </LinearGradient>
              <View>
                <Text style={styles.headerTitle}>AI Style Assistant</Text>
                <Text style={styles.headerSubtitle}>
                  {showErrorState ? 'Connection Issue' : 'Powered by PicaOS + ElevenLabs'}
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <VoiceToggle 
                enabled={voiceEnabled} 
                onToggle={setVoiceEnabled}
                disabled={isSending}
              />
              <TouchableOpacity 
                style={styles.newChatButton}
                onPress={createNewChatSession}
              >
                <Text style={styles.newChatText}>New Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice Status Banner */}
          {voiceEnabled && (
            <View style={styles.voiceBanner}>
              <LinearGradient
                colors={['#8B5CF620', '#EC489920']}
                style={styles.voiceBannerGradient}
              >
                <Volume2 color="#8B5CF6" size={16} />
                <Text style={styles.voiceBannerText}>Voice responses enabled</Text>
              </LinearGradient>
            </View>
          )}

          {/* Error Banner */}
          {chatError && !showErrorState && (
            <View style={styles.errorBanner}>
              <LinearGradient
                colors={['#EF444420', '#DC262620']}
                style={styles.errorBannerGradient}
              >
                <AlertCircle color="#EF4444" size={16} />
                <Text style={styles.errorText}>Connection issues - using offline mode</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetryConnection}>
                  <RefreshCw color="#EF4444" size={14} />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {showErrorState ? (
              <View style={styles.errorState}>
                <AlertCircle color="#EF4444" size={48} />
                <Text style={styles.errorStateTitle}>Chat Unavailable</Text>
                <Text style={styles.errorStateDescription}>
                  We're having trouble connecting to the chat service. You can still use the app in offline mode.
                </Text>
                <TouchableOpacity style={styles.retryConnectionButton} onPress={handleRetryConnection}>
                  <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.retryConnectionGradient}>
                    <RefreshCw color="#FFFFFF" size={16} />
                    <Text style={styles.retryConnectionText}>Try Again</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : messages.length === 0 && !chatLoading ? (
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickActionCard}
                      onPress={() => handleQuickAction(action)}
                    >
                      <LinearGradient
                        colors={['#16213E', '#1E293B']}
                        style={styles.quickActionGradient}
                      >
                        <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                          <action.icon color={action.color} size={20} />
                        </View>
                        <Text style={styles.quickActionTitle}>{action.title}</Text>
                        <Text style={styles.quickActionDescription}>{action.description}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {chatLoading && messages.length === 0 && (
              <View style={styles.loadingState}>
                <View style={styles.loadingDots}>
                  <View style={styles.loadingDot} />
                  <View style={styles.loadingDot} />
                  <View style={styles.loadingDot} />
                </View>
                <Text style={styles.loadingText}>Loading chat history...</Text>
              </View>
            )}

            {messages.map((message) => (
              <View key={message.id}>
                {/* Media Message */}
                {(message.imageUrl || message.voiceUrl) && (
                  <View
                    style={[
                      styles.messageContainer,
                      message.isUser ? styles.userMessage : styles.aiMessage,
                    ]}
                  >
                    {!message.isUser && (
                      <LinearGradient
                        colors={['#8B5CF6', '#EC4899']}
                        style={styles.messageAvatar}
                      >
                        <Sparkles color="#FFFFFF" size={12} />
                      </LinearGradient>
                    )}
                    <MediaMessage
                      imageUrl={message.imageUrl}
                      voiceUrl={message.voiceUrl}
                      voiceDuration={message.voiceDuration}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                      onImagePress={handleImagePress}
                    />
                  </View>
                )}

                {/* Text Message */}
                {message.text && (
                  <View
                    style={[
                      styles.messageContainer,
                      message.isUser ? styles.userMessage : styles.aiMessage,
                    ]}
                  >
                    {!message.isUser && (
                      <LinearGradient
                        colors={['#8B5CF6', '#EC4899']}
                        style={styles.messageAvatar}
                      >
                        <Sparkles color="#FFFFFF" size={12} />
                      </LinearGradient>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        message.isUser ? styles.userBubble : styles.aiBubble,
                      ]}
                    >
                      <Text style={[
                        styles.messageText,
                        message.isUser ? styles.userText : styles.aiText,
                      ]}>
                        {message.text}
                      </Text>
                      <Text style={styles.messageTime}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {(isTyping || isSending) && (
              <View style={[styles.messageContainer, styles.aiMessage]}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.messageAvatar}
                >
                  <Sparkles color="#FFFFFF" size={12} />
                </LinearGradient>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            )}

            {/* Real-time Suggestions */}
            {realTimeSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>AI Suggestions</Text>
                {realTimeSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => setInputText(suggestion)}
                  >
                    <LinearGradient
                      colors={['#F59E0B10', '#F59E0B05']}
                      style={styles.suggestionGradient}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <LinearGradient
              colors={['#16213E', '#1E293B']}
              style={styles.inputWrapper}
            >
              <MediaUploader
                onMediaSelect={handleMediaSelect}
                onUploadComplete={handleMediaUploadComplete}
                onUploadError={handleMediaUploadError}
                userId={user.id}
                disabled={isSending}
              />
              
              <TextInput
                style={styles.textInput}
                placeholder="Ask me about fashion, style, or trends..."
                placeholderTextColor="#64748B"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                editable={!isSending}
              />
              
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || isTyping || isSending}
              >
                <LinearGradient
                  colors={inputText.trim() && !isSending ? ['#8B5CF6', '#A855F7'] : ['#64748B', '#64748B']}
                  style={styles.sendButtonGradient}
                >
                  <Send color="#FFFFFF" size={16} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
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
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authIcon: {
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
  authTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  authDescription: {
    color: '#94A3B8',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButton: {
    borderRadius: 16,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newChatButton: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  newChatText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  voiceBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  voiceBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  voiceBannerText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  errorText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  retryButton: {
    padding: 4,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  errorStateTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorStateDescription: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryConnectionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryConnectionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryConnectionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
    flexGrow: 1,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickActionIcon: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  quickActionTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#F8FAFC',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  suggestionsContainer: {
    marginTop: 16,
    gap: 8,
  },
  suggestionsTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  suggestionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionGradient: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  suggestionText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  inputContainer: {
    padding: 20,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    maxHeight: 80,
  },
  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});