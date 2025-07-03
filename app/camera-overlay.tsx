import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { GradientButton } from '@/components/GradientButton';
import { MediaUploadService } from '@/lib/media-upload';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Camera, Camera as FlipCamera, Sparkles, Zap, Lightbulb, Download, Shirt } from 'lucide-react-native';

export default function CameraOverlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [outfitPosition, setOutfitPosition] = useState({ x: 0, y: 0, scale: 1 });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<any>(null);

  const outfitImage = params.outfitImage as string;
  const outfitImageUrl = params.outfitImageUrl as string;
  
  // Use the provided outfit image or URL
  const outfitSource = outfitImage || outfitImageUrl;

  useEffect(() => {
    // Request camera permission if not granted
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      
      setCapturedImage(photo.uri);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSave = async () => {
    if (!capturedImage) return;
    
    try {
      setIsUploading(true);
      
      // Upload the captured image to Supabase
      const userId = user?.id || 'anonymous';
      const uploadResult = await MediaUploadService.uploadTryOnImage(
        capturedImage,
        userId,
        'user'
      );
      
      if (uploadResult.error) {
        throw new Error(`Failed to upload image: ${uploadResult.error}`);
      }
      
      // Navigate to results page with the captured image
      router.push({
        pathname: '/virtual-tryon-processing',
        params: {
          userImage: uploadResult.url,
          outfitImage: outfitImage || '',
          outfitImageUrl: outfitImageUrl || '',
          method: 'camera-overlay'
        }
      });
    } catch (error) {
      console.error('Failed to save and process image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFlipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const adjustOutfitPosition = (direction: 'up' | 'down' | 'left' | 'right' | 'bigger' | 'smaller') => {
    setOutfitPosition(prev => {
      const step = 10;
      const scaleStep = 0.1;
      
      switch (direction) {
        case 'up':
          return { ...prev, y: prev.y - step };
        case 'down':
          return { ...prev, y: prev.y + step };
        case 'left':
          return { ...prev, x: prev.x - step };
        case 'right':
          return { ...prev, x: prev.x + step };
        case 'bigger':
          return { ...prev, scale: prev.scale + scaleStep };
        case 'smaller':
          return { ...prev, scale: Math.max(0.5, prev.scale - scaleStep) };
        default:
          return prev;
      }
    });
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading camera...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.permissionContainer}>
            <Camera color="#8B5CF6" size={48} />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionDescription}>
              We need camera access to enable the virtual try-on feature. Your photos stay on your device unless you choose to save them.
            </Text>
            <GradientButton
              title="Grant Camera Permission"
              onPress={requestPermission}
              variant="primary"
              size="large"
              style={styles.permissionButton}
            />
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!outfitSource) {
    // No outfit image provided
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Shirt color="#EF4444" size={48} />
            <Text style={styles.errorTitle}>No Outfit Selected</Text>
            <Text style={styles.errorDescription}>
              Please select an outfit image or provide a product link before using the camera overlay feature.
            </Text>
            <GradientButton
              title="Go Back and Select Outfit"
              onPress={() => router.back()}
              variant="primary"
              size="large"
              style={styles.errorButton}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (capturedImage) {
    // Show captured image with outfit overlay
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F9FAFB" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Capture</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <View style={styles.captureReviewContainer}>
            <View style={styles.capturedImageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
              <Image 
                source={{ uri: outfitSource }} 
                style={[
                  styles.outfitOverlay,
                  {
                    transform: [
                      { translateX: outfitPosition.x },
                      { translateY: outfitPosition.y },
                      { scale: outfitPosition.scale }
                    ]
                  }
                ]} 
              />
            </View>
            
            <View style={styles.captureActions}>
              <GradientButton
                title={isUploading ? "Processing..." : "Save & Process"}
                onPress={handleSave}
                variant="primary"
                size="large"
                disabled={isUploading}
                style={styles.saveButton}
              />
              
              <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                <Text style={styles.retakeButtonText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.adjustmentControls}>
              <Text style={styles.adjustmentTitle}>Adjust Outfit Position</Text>
              <View style={styles.adjustmentGrid}>
                <TouchableOpacity 
                  style={styles.adjustmentButton}
                  onPress={() => adjustOutfitPosition('up')}
                >
                  <Text style={styles.adjustmentButtonText}>↑</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adjustmentButton}
                  onPress={() => adjustOutfitPosition('down')}
                >
                  <Text style={styles.adjustmentButtonText}>↓</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adjustmentButton}
                  onPress={() => adjustOutfitPosition('left')}
                >
                  <Text style={styles.adjustmentButtonText}>←</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adjustmentButton}
                  onPress={() => adjustOutfitPosition('right')}
                >
                  <Text style={styles.adjustmentButtonText}>→</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adjustmentButton}
                  onPress={() => adjustOutfitPosition('bigger')}
                >
                  <Text style={styles.adjustmentButtonText}>+</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adjustmentButton}
                  onPress={() => adjustOutfitPosition('smaller')}
                >
                  <Text style={styles.adjustmentButtonText}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Camera view with outfit overlay
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <SafeAreaView style={styles.cameraContent}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity style={styles.cameraBackButton} onPress={() => router.back()}>
              <ArrowLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Camera Overlay</Text>
            <TouchableOpacity style={styles.flipButton} onPress={handleFlipCamera}>
              <FlipCamera color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>
          
          {/* Outfit Overlay */}
          <View style={styles.overlayContainer}>
            <Image 
              source={{ uri: outfitSource }} 
              style={[
                styles.outfitOverlay,
                {
                  transform: [
                    { translateX: outfitPosition.x },
                    { translateY: outfitPosition.y },
                    { scale: outfitPosition.scale }
                  ]
                }
              ]}
              resizeMode="contain"
            />
          </View>
          
          {/* Capture Button */}
          <View style={styles.captureContainer}>
            <View style={styles.captureTips}>
              <LinearGradient
                colors={['#00000080', '#00000060']}
                style={styles.captureTipsGradient}
              >
                <Lightbulb color="#F59E0B" size={16} />
                <Text style={styles.captureTipsText}>Position yourself to align with the outfit</Text>
              </LinearGradient>
            </View>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.captureButtonGradient}
              >
                {isCapturing ? (
                  <Sparkles color="#FFFFFF" size={24} />
                ) : (
                  <Camera color="#FFFFFF" size={24} />
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.adjustmentControls}>
              <View style={styles.adjustmentGrid}>
                <TouchableOpacity 
                  style={styles.cameraAdjustmentButton}
                  onPress={() => adjustOutfitPosition('up')}
                >
                  <Text style={styles.cameraAdjustmentButtonText}>↑</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cameraAdjustmentButton}
                  onPress={() => adjustOutfitPosition('down')}
                >
                  <Text style={styles.cameraAdjustmentButtonText}>↓</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cameraAdjustmentButton}
                  onPress={() => adjustOutfitPosition('left')}
                >
                  <Text style={styles.cameraAdjustmentButtonText}>←</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cameraAdjustmentButton}
                  onPress={() => adjustOutfitPosition('right')}
                >
                  <Text style={styles.cameraAdjustmentButtonText}>→</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cameraAdjustmentButton}
                  onPress={() => adjustOutfitPosition('bigger')}
                >
                  <Text style={styles.cameraAdjustmentButtonText}>+</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cameraAdjustmentButton}
                  onPress={() => adjustOutfitPosition('smaller')}
                >
                  <Text style={styles.cameraAdjustmentButtonText}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorButton: {
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  cameraContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraBackButton: {
    padding: 8,
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  flipButton: {
    padding: 8,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  outfitOverlay: {
    width: 300,
    height: 300,
    opacity: 0.8,
    resizeMode: 'contain',
  },
  captureContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  captureTips: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  captureTipsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  captureTipsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  captureButton: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  captureButtonGradient: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustmentControls: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  adjustmentTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  adjustmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  adjustmentButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  adjustmentButtonText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  cameraAdjustmentButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cameraAdjustmentButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  captureReviewContainer: {
    flex: 1,
    padding: 20,
  },
  capturedImageContainer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  captureActions: {
    marginTop: 24,
    gap: 16,
  },
  saveButton: {
    width: '100%',
  },
  retakeButton: {
    alignSelf: 'center',
  },
  retakeButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});