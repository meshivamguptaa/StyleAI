import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, Upload } from 'lucide-react-native';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploaderProps {
  onImageSelect: (uri: string) => void;
  placeholder?: string;
  aspectRatio?: [number, number];
  className?: string;
}

export function ImageUploader({
  onImageSelect,
  placeholder = "Upload your image",
  aspectRatio = [1, 1],
}: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      setLoading(true);
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log('Image selected:', uri);
        setSelectedImage(uri);
        onImageSelect(uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log('Photo taken:', uri);
        setSelectedImage(uri);
        onImageSelect(uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setLoading(false);
    }
  };

  const showOptions = () => {
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose how you want to add your image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showOptions} disabled={loading}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.uploadArea}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.iconContainer}>
                <Upload color="#8B5CF6" size={32} />
              </View>
              <Text style={styles.placeholderText}>
                {loading ? 'Loading...' : placeholder}
              </Text>
              <Text style={styles.subText}>
                {Platform.OS === 'web' ? 'Click to browse' : 'Tap to select from camera or gallery'}
              </Text>
              {!loading && (
                <View style={styles.optionsContainer}>
                  <View style={styles.option}>
                    <Camera color="#6B7280" size={16} />
                    <Text style={styles.optionText}>Camera</Text>
                  </View>
                  <View style={styles.option}>
                    <ImageIcon color="#6B7280" size={16} />
                    <Text style={styles.optionText}>Gallery</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
      
      {selectedImage && !loading && (
        <TouchableOpacity onPress={showOptions} style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Change Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  uploadArea: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: '#8B5CF620',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  placeholderText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  subText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  changeButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  changeButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});