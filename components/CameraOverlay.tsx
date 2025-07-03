import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, Camera as FlipCamera, Sparkles } from 'lucide-react-native';

interface CameraOverlayProps {
  outfitImageUrl: string;
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
}

export function CameraOverlay({ outfitImageUrl, onCapture, onCancel }: CameraOverlayProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [outfitPosition, setOutfitPosition] = useState({ x: 0, y: 0, scale: 1 });
  const cameraRef = useRef<any>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      
      onCapture(photo.uri);
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
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
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionDescription}>
          We need camera access to enable the virtual try-on feature.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.permissionButtonGradient}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.cameraContent}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={handleFlipCamera}>
              <FlipCamera color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>
          
          {/* Outfit Overlay */}
          <View style={styles.overlayContainer}>
            <Image 
              source={{ uri: outfitImageUrl }} 
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
            <View style={styles.adjustmentControls}>
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
            
            <Text style={styles.captureHint}>
              Position yourself and tap to capture
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 20,
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
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  permissionButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  captureHint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  adjustmentControls: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  adjustmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  adjustmentButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  adjustmentButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
});