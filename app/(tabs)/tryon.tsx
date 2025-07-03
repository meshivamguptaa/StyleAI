import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat } from '@/hooks/useAIChat';
import { TryOnGate } from '@/components/TryOnGate';
import { GradientButton } from '@/components/GradientButton';
import { ImageUploader } from '@/components/ImageUploader';
import { CameraOverlay } from '@/components/CameraOverlay';
import { Camera, Upload, Link, Sparkles, Clock, Star, TrendingUp, Search, Zap, Lightbulb, User, Shirt, Wand as Wand2 } from 'lucide-react-native';

export default function TryOnScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getRealTimeSuggestions } = useAIChat();
  const [selectedMethod, setSelectedMethod] = useState<'upload' | 'link' | 'camera' | null>(null);
  const [productLink, setProductLink] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null);
  const [realTimeSuggestions, setRealTimeSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!user) {
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.authPrompt}>
            <Camera color="#8B5CF6" size={48} />
            <Text style={styles.authTitle}>AI Virtual Try-On</Text>
            <Text style={styles.authDescription}>
              Sign in to use our advanced AI-powered virtual try-on technology with real-time pose adjustment and style suggestions.
            </Text>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth')}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.authButtonGradient}>
                <Text style={styles.authButtonText}>Sign In to Try On</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const tryOnMethods = [
    {
      id: 'upload',
      icon: Upload,
      title: 'Upload Photos',
      description: 'Upload your photo and clothing item with AI pose adjustment',
      color: '#8B5CF6',
      isRecommended: true,
      features: ['AI Pose Enhancement', 'Real-time Fitting', 'Style Analysis']
    },
    {
      id: 'link',
      icon: Link,
      title: 'Product Link',
      description: 'Paste a link and we\'ll extract the product with AI',
      color: '#EC4899',
      isRecommended: false,
      features: ['Auto Product Detection', 'Smart Extraction', 'Instant Try-On']
    },
    {
      id: 'camera',
      icon: Camera,
      title: 'Camera Overlay',
      description: 'Try on clothes in real-time with your camera',
      color: '#10B981',
      isRecommended: true,
      features: ['Live Preview', 'Real-time Fitting', 'Instant Results']
    },
  ];

  const recentTryOns = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200',
      title: 'Summer Dress',
      score: 8.9,
      date: '2 hours ago',
      aiEnhanced: true,
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=200',
      title: 'Business Blazer',
      score: 9.2,
      date: '1 day ago',
      aiEnhanced: true,
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1559113/pexels-photo-1559113.jpeg?auto=compress&cs=tinysrgb&w=200',
      title: 'Casual Jeans',
      score: 8.7,
      date: '3 days ago',
      aiEnhanced: false,
    },
  ];

  const handleMethodSelect = (method: 'upload' | 'link' | 'camera') => {
    setSelectedMethod(method);
    if (method === 'upload') {
      // Reset any previous selections
      setProductLink('');
      setOutfitImageUrl(null);
    } else if (method === 'link') {
      // Reset upload selections
      setUserImage(null);
      setOutfitImage(null);
    } else if (method === 'camera') {
      // Reset other selections but keep user image if available
      setProductLink('');
      setOutfitImageUrl(null);
    }
  };

  const getSuggestions = async (context: string) => {
    setIsAnalyzing(true);
    try {
      const suggestions = await getRealTimeSuggestions(context);
      setRealTimeSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUserImageSelect = (uri: string) => {
    console.log('User image selected:', uri);
    setUserImage(uri);
    getSuggestions('user photo uploaded for virtual try-on');
  };

  const handleOutfitImageSelect = (uri: string) => {
    console.log('Outfit image selected:', uri);
    setOutfitImage(uri);
    getSuggestions('outfit image uploaded for virtual try-on');
  };

  const handleProductLink = async () => {
    if (!productLink.trim()) {
      Alert.alert('Error', 'Please enter a product link');
      return;
    }

    setIsAnalyzing(true);
    await getSuggestions(`product link: ${productLink}`);

    // For demo purposes, we'll use a sample outfit image URL
    // In production, you might want to extract the actual image from the product page
    const sampleOutfitImages = [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1559113/pexels-photo-1559113.jpeg?auto=compress&cs=tinysrgb&w=400',
    ];
    
    const randomImage = sampleOutfitImages[Math.floor(Math.random() * sampleOutfitImages.length)];
    setOutfitImageUrl(randomImage);
    setIsAnalyzing(false);
  };

  const handleStartTryOn = () => {
    if (selectedMethod === 'upload') {
      if (!userImage) {
        Alert.alert('Missing Image', 'Please upload your photo first');
        return;
      }

      if (!outfitImage) {
        Alert.alert('Missing Image', 'Please upload an outfit image');
        return;
      }

      // Navigate to processing screen with the selected images
      router.push({
        pathname: '/virtual-tryon-processing',
        params: {
          userImage,
          outfitImage,
          method: 'upload'
        }
      });
    } else if (selectedMethod === 'link') {
      if (!userImage) {
        Alert.alert('Missing Image', 'Please upload your photo first');
        return;
      }

      if (!outfitImageUrl) {
        Alert.alert('Missing Link', 'Please enter a product link first');
        return;
      }

      // Navigate to processing screen with the user image and outfit URL
      router.push({
        pathname: '/virtual-tryon-processing',
        params: {
          userImage,
          outfitImageUrl,
          method: 'link'
        }
      });
    } else if (selectedMethod === 'camera') {
      if (!outfitImage && !outfitImageUrl) {
        Alert.alert('Missing Outfit', 'Please upload an outfit image or enter a product link');
        return;
      }

      // Navigate to camera overlay screen
      router.push({
        pathname: '/camera-overlay',
        params: {
          outfitImage: outfitImage || '',
          outfitImageUrl: outfitImageUrl || '',
        }
      });
    }
  };

  const handleExploreLooks = () => {
    router.push('/explore-looks');
  };

  const handleTryOnGateAction = () => {
    // This will be called by TryOnGate after checking limits
    // User can proceed with try-on setup
  };

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>AI Virtual Try-On</Text>
              <Text style={styles.headerSubtitle}>
                Advanced AI with pose adjustment & real-time suggestions
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={handleExploreLooks}
            >
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.exploreGradient}>
                <Search color="#FFFFFF" size={16} />
                <Text style={styles.exploreText}>Explore</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Try-On Gate */}
          <TryOnGate onProceed={handleTryOnGateAction}>
            {/* AI Features Banner */}
            <View style={styles.aiBanner}>
              <LinearGradient
                colors={['#8B5CF620', '#EC489920']}
                style={styles.aiBannerGradient}
              >
                <View style={styles.aiBannerContent}>
                  <Zap color="#8B5CF6" size={24} />
                  <Text style={styles.aiBannerTitle}>Powered by Advanced AI</Text>
                  <Text style={styles.aiBannerDescription}>
                    Automatic pose adjustment, real-time fitting, and intelligent style suggestions
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Try-On Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Your Method</Text>
              <View style={styles.methodsContainer}>
                {tryOnMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodCard,
                      selectedMethod === method.id && styles.methodCardSelected
                    ]}
                    onPress={() => handleMethodSelect(method.id as 'upload' | 'link' | 'camera')}
                  >
                    <LinearGradient
                      colors={selectedMethod === method.id ? ['#8B5CF620', '#EC489920'] : ['#1F2937', '#374151']}
                      style={styles.methodGradient}
                    >
                      {method.isRecommended && (
                        <View style={styles.recommendedBadge}>
                          <Sparkles color="#F59E0B" size={12} />
                          <Text style={styles.recommendedText}>AI Enhanced</Text>
                        </View>
                      )}
                      <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
                        <method.icon color={method.color} size={32} />
                      </View>
                      <Text style={styles.methodTitle}>{method.title}</Text>
                      <Text style={styles.methodDescription}>{method.description}</Text>
                      
                      <View style={styles.featuresContainer}>
                        {method.features.map((feature, index) => (
                          <View key={index} style={styles.featureItem}>
                            <View style={styles.featureDot} />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Upload Method */}
            {selectedMethod === 'upload' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upload Images</Text>
                
                {/* User Image Upload */}
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadLabel}>Your Photo</Text>
                  <ImageUploader
                    onImageSelect={handleUserImageSelect}
                    placeholder="Upload your photo"
                    aspectRatio={[3, 4]}
                  />
                  {userImage && (
                    <View style={styles.uploadSuccess}>
                      <User color="#10B981" size={16} />
                      <Text style={styles.uploadSuccessText}>Photo uploaded successfully!</Text>
                    </View>
                  )}
                </View>

                {/* Outfit Image Upload */}
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadLabel}>Outfit Image</Text>
                  <ImageUploader
                    onImageSelect={handleOutfitImageSelect}
                    placeholder="Upload outfit image"
                    aspectRatio={[1, 1]}
                  />
                  {outfitImage && (
                    <View style={styles.uploadSuccess}>
                      <Shirt color="#10B981" size={16} />
                      <Text style={styles.uploadSuccessText}>Outfit uploaded successfully!</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Product Link Input */}
            {selectedMethod === 'link' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Enter Product Link</Text>
                
                {/* User Image Upload */}
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadLabel}>Your Photo</Text>
                  <ImageUploader
                    onImageSelect={handleUserImageSelect}
                    placeholder="Upload your photo"
                    aspectRatio={[3, 4]}
                  />
                  {userImage && (
                    <View style={styles.uploadSuccess}>
                      <User color="#10B981" size={16} />
                      <Text style={styles.uploadSuccessText}>Photo uploaded successfully!</Text>
                    </View>
                  )}
                </View>

                {/* Product Link Input */}
                <View style={styles.linkInputContainer}>
                  <LinearGradient
                    colors={['#1F2937', '#374151']}
                    style={styles.linkInputWrapper}
                  >
                    <TextInput
                      style={styles.linkInput}
                      placeholder="Paste product URL here..."
                      placeholderTextColor="#6B7280"
                      value={productLink}
                      onChangeText={setProductLink}
                      multiline
                    />
                  </LinearGradient>
                  <GradientButton
                    title={isAnalyzing ? "Analyzing..." : "Extract Product"}
                    onPress={handleProductLink}
                    variant="primary"
                    size="medium"
                    disabled={isAnalyzing}
                    style={styles.extractButton}
                  />
                  {outfitImageUrl && (
                    <View style={styles.uploadSuccess}>
                      <Link color="#10B981" size={16} />
                      <Text style={styles.uploadSuccessText}>Product link processed!</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Camera Overlay Method */}
            {selectedMethod === 'camera' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Camera Overlay Try-On</Text>
                
                {/* Outfit Image Upload */}
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadLabel}>Outfit to Try On</Text>
                  <ImageUploader
                    onImageSelect={handleOutfitImageSelect}
                    placeholder="Upload outfit image"
                    aspectRatio={[1, 1]}
                  />
                  {outfitImage && (
                    <View style={styles.uploadSuccess}>
                      <Shirt color="#10B981" size={16} />
                      <Text style={styles.uploadSuccessText}>Outfit uploaded successfully!</Text>
                    </View>
                  )}
                </View>

                {/* Or Product Link */}
                <View style={styles.orDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.linkInputContainer}>
                  <LinearGradient
                    colors={['#1F2937', '#374151']}
                    style={styles.linkInputWrapper}
                  >
                    <TextInput
                      style={styles.linkInput}
                      placeholder="Paste product URL here..."
                      placeholderTextColor="#6B7280"
                      value={productLink}
                      onChangeText={setProductLink}
                      multiline
                    />
                  </LinearGradient>
                  <GradientButton
                    title={isAnalyzing ? "Analyzing..." : "Extract Product"}
                    onPress={handleProductLink}
                    variant="primary"
                    size="medium"
                    disabled={isAnalyzing}
                    style={styles.extractButton}
                  />
                  {outfitImageUrl && (
                    <View style={styles.uploadSuccess}>
                      <Link color="#10B981" size={16} />
                      <Text style={styles.uploadSuccessText}>Product link processed!</Text>
                    </View>
                  )}
                </View>

                {/* Camera Preview */}
                {(outfitImage || outfitImageUrl) && (
                  <View style={styles.cameraPreviewSection}>
                    <LinearGradient
                      colors={['#10B98120', '#059669']}
                      style={styles.cameraPreviewCard}
                    >
                      <View style={styles.cameraPreviewHeader}>
                        <Wand2 color="#10B981" size={24} />
                        <Text style={styles.cameraPreviewTitle}>Live Camera Overlay</Text>
                      </View>
                      <Text style={styles.cameraPreviewDescription}>
                        Open your camera to see the outfit overlaid in real-time. Position yourself and adjust for the best fit.
                      </Text>
                      <View style={styles.cameraPreviewImageContainer}>
                        <Image 
                          source={{ uri: outfitImage || outfitImageUrl || '' }} 
                          style={styles.cameraPreviewImage} 
                        />
                        <View style={styles.cameraPreviewOverlay}>
                          <Camera color="#FFFFFF" size={32} />
                          <Text style={styles.cameraPreviewOverlayText}>Ready for Camera</Text>
                        </View>
                      </View>
                      <Text style={styles.cameraPreviewNote}>
                        The outfit will be automatically processed to remove background and enhance quality.
                      </Text>
                    </LinearGradient>
                  </View>
                )}
              </View>
            )}

            {/* Real-time Suggestions */}
            {realTimeSuggestions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.suggestionsHeader}>
                  <Lightbulb color="#F59E0B" size={20} />
                  <Text style={styles.suggestionsTitle}>AI Suggestions</Text>
                </View>
                <View style={styles.suggestionsContainer}>
                  {realTimeSuggestions.map((suggestion, index) => (
                    <LinearGradient
                      key={index}
                      colors={['#F59E0B10', '#F59E0B05']}
                      style={styles.suggestionCard}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </LinearGradient>
                  ))}
                </View>
              </View>
            )}

            {/* Start Try-On Button */}
            {selectedMethod && (
              (selectedMethod === 'upload' && userImage && outfitImage) || 
              (selectedMethod === 'link' && userImage && outfitImageUrl) || 
              (selectedMethod === 'camera' && (outfitImage || outfitImageUrl))
            ) && (
              <View style={styles.section}>
                <GradientButton
                  title={selectedMethod === 'camera' ? "Open Camera Overlay" : "Start AI Virtual Try-On"}
                  onPress={handleStartTryOn}
                  variant="primary"
                  size="large"
                  style={styles.startTryOnButton}
                />
              </View>
            )}

            {/* Recent Try-Ons */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Try-Ons</Text>
                <TouchableOpacity onPress={() => router.push('/saved')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {recentTryOns.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.recentCard}>
                    <Image source={{ uri: item.image }} style={styles.recentImage} />
                    <LinearGradient
                      colors={['transparent', '#00000080']}
                      style={styles.recentOverlay}
                    >
                      <View style={styles.recentInfo}>
                        {item.aiEnhanced && (
                          <View style={styles.aiEnhancedBadge}>
                            <Zap color="#8B5CF6" size={10} />
                            <Text style={styles.aiEnhancedText}>AI</Text>
                          </View>
                        )}
                        <Text style={styles.recentTitle}>{item.title}</Text>
                        <View style={styles.recentStats}>
                          <View style={styles.recentScore}>
                            <Star color="#F59E0B" size={12} fill="#F59E0B" />
                            <Text style={styles.recentScoreText}>{item.score}</Text>
                          </View>
                          <View style={styles.recentDate}>
                            <Clock color="#9CA3AF" size={12} />
                            <Text style={styles.recentDateText}>{item.date}</Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AI Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Features</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Zap color="#8B5CF6" size={20} />
                  </View>
                  <Text style={styles.featureTitle}>Pose Adjustment</Text>
                  <Text style={styles.featureDescription}>AI automatically corrects and optimizes your pose</Text>
                </View>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <TrendingUp color="#EC4899" size={20} />
                  </View>
                  <Text style={styles.featureTitle}>Real-time Analysis</Text>
                  <Text style={styles.featureDescription}>Instant style feedback and suggestions</Text>
                </View>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Star color="#06B6D4" size={20} />
                  </View>
                  <Text style={styles.featureTitle}>Smart Fitting</Text>
                  <Text style={styles.featureDescription}>Intelligent size and fit optimization</Text>
                </View>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Camera color="#10B981" size={20} />
                  </View>
                  <Text style={styles.featureTitle}>HD Quality</Text>
                  <Text style={styles.featureDescription}>High-definition AI-enhanced results</Text>
                </View>
              </View>
            </View>
          </TryOnGate>
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
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 12,
  },
  headerTitle: {
    color: '#F9FAFB',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exploreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  aiBanner: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  aiBannerGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  aiBannerContent: {
    alignItems: 'center',
  },
  aiBannerTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 8,
  },
  aiBannerDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
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
  seeAllText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  methodsContainer: {
    gap: 16,
  },
  methodCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  methodCardSelected: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  methodGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#F59E0B',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  methodIcon: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  methodTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  methodDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadLabel: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  uploadSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#10B98120',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  uploadSuccessText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  linkInputContainer: {
    gap: 16,
  },
  linkInputWrapper: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  linkInput: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  extractButton: {
    alignSelf: 'flex-start',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  orText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginHorizontal: 16,
  },
  cameraPreviewSection: {
    marginTop: 16,
  },
  cameraPreviewCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  cameraPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cameraPreviewTitle: {
    color: '#10B981',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  cameraPreviewDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  cameraPreviewImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cameraPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraPreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cameraPreviewOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cameraPreviewNote: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  suggestionsTitle: {
    color: '#F59E0B',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  suggestionText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  startTryOnButton: {
    width: '100%',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  recentCard: {
    width: 140,
    height: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  recentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  recentInfo: {
    gap: 8,
  },
  aiEnhancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiEnhancedText: {
    color: '#8B5CF6',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  recentStats: {
    gap: 4,
  },
  recentScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentScoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  recentDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentDateText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
  },
  featureIcon: {
    backgroundColor: '#8B5CF620',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  featureTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
});