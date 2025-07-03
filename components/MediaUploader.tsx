import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, Mic, Upload, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { MediaUploadService } from '@/lib/media-upload';

interface MediaUploaderProps {
  onMediaSelect: (type: 'image' | 'voice', uri: string, duration?: number) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (url: string, type: 'image' | 'voice') => void;
  onUploadError?: (error: string) => void;
  userId: string;
  disabled?: boolean;
}

export function MediaUploader({
  onMediaSelect,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  userId,
  disabled = false,
}: MediaUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted' || audioStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera, media library, and microphone permissions to use this feature.'
        );
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async () => {
    if (disabled || isUploading) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleMediaUpload(result.assets[0].uri, 'image');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleMediaUpload(result.assets[0].uri, 'image');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const startRecording = async () => {
    if (disabled || isUploading || isRecording) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store interval reference for cleanup
      (newRecording as any).durationInterval = interval;
    } catch (error) {
      console.error('Recording start error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording || !isRecording) return;

    try {
      setIsRecording(false);
      
      // Clear duration timer
      if ((recording as any).durationInterval) {
        clearInterval((recording as any).durationInterval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        await handleMediaUpload(uri, 'voice', recordingDuration);
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Recording stop error:', error);
      Alert.alert('Error', 'Failed to stop recording');
      setIsRecording(false);
      setRecording(null);
      setRecordingDuration(0);
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      
      // Clear duration timer
      if ((recording as any).durationInterval) {
        clearInterval((recording as any).durationInterval);
      }

      await recording.stopAndUnloadAsync();
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Recording cancel error:', error);
    }
  };

  const handleMediaUpload = async (uri: string, type: 'image' | 'voice', duration?: number) => {
    try {
      setIsUploading(true);
      onUploadStart?.();

      // Validate file
      const validation = await MediaUploadService.validateFile(uri, type);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Upload to Supabase
      const result = await MediaUploadService.uploadMediaToSupabase(uri, userId, type);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Notify parent components
      onMediaSelect(type, uri, duration);
      onUploadComplete?.(result.url, type);

    } catch (error) {
      console.error('Media upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <View style={styles.recordingContainer}>
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.recordingGradient}
        >
          <View style={styles.recordingContent}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
            <Text style={styles.recordingDuration}>{formatDuration(recordingDuration)}</Text>
          </View>
          <View style={styles.recordingActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
              <X color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.stopButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.mediaButton, disabled && styles.disabledButton]}
        onPress={handleImagePicker}
        disabled={disabled || isUploading}
      >
        <LinearGradient
          colors={disabled ? ['#6B7280', '#6B7280'] : ['#8B5CF6', '#A855F7']}
          style={styles.buttonGradient}
        >
          {isUploading ? (
            <Upload color="#FFFFFF" size={20} />
          ) : (
            <ImageIcon color="#FFFFFF" size={20} />
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mediaButton, disabled && styles.disabledButton]}
        onPress={startRecording}
        disabled={disabled || isUploading}
      >
        <LinearGradient
          colors={disabled ? ['#6B7280', '#6B7280'] : ['#EC4899', '#F472B6']}
          style={styles.buttonGradient}
        >
          <Mic color="#FFFFFF" size={20} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  recordingContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 200,
  },
  recordingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  recordingContent: {
    flex: 1,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  recordingDuration: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 6,
  },
  stopButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stopButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});