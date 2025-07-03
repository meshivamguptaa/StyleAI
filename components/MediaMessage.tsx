import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Play, Pause, Download, Share, Volume2 } from 'lucide-react-native';
import { Platform } from 'react-native';

interface MediaMessageProps {
  imageUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  isUser: boolean;
  timestamp: Date;
  onImagePress?: (imageUrl: string) => void;
}

export function MediaMessage({
  imageUrl,
  voiceUrl,
  voiceDuration = 0,
  isUser,
  timestamp,
  onImagePress,
}: MediaMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [duration, setDuration] = useState(voiceDuration * 1000); // Convert to milliseconds
  const soundRef = useRef<Audio.Sound | null>(null);

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    try {
      if (!voiceUrl) return;

      if (isPlaying) {
        // Pause audio
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        }
      } else {
        // Play audio
        if (soundRef.current) {
          // Resume existing sound
          await soundRef.current.playAsync();
          setIsPlaying(true);
        } else {
          // Create new sound
          const { sound } = await Audio.Sound.createAsync(
            { uri: voiceUrl },
            { shouldPlay: true },
            (status) => {
              if (status.isLoaded) {
                if (status.didJustFinish) {
                  setIsPlaying(false);
                  setPlaybackPosition(0);
                  soundRef.current?.unloadAsync();
                  soundRef.current = null;
                } else if (status.positionMillis !== undefined) {
                  setPlaybackPosition(status.positionMillis);
                  if (status.durationMillis && duration === 0) {
                    setDuration(status.durationMillis);
                  }
                }
              }
            }
          );
          
          soundRef.current = sound;
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Error', 'Failed to play audio message');
      setIsPlaying(false);
    }
  };

  const handleImagePress = () => {
    if (imageUrl && onImagePress) {
      onImagePress(imageUrl);
    }
  };

  const handleDownload = async () => {
    if (Platform.OS === 'web') {
      // For web, open in new tab
      const url = imageUrl || voiceUrl;
      if (url) {
        window.open(url, '_blank');
      }
    } else {
      // For mobile, you could implement actual download functionality
      Alert.alert('Download', 'Download functionality would be implemented here');
    }
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      // For web, copy URL to clipboard
      const url = imageUrl || voiceUrl;
      if (url && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(url);
          Alert.alert('Success', 'URL copied to clipboard');
        } catch (error) {
          Alert.alert('Error', 'Failed to copy URL');
        }
      }
    } else {
      // For mobile, you could implement native sharing
      Alert.alert('Share', 'Share functionality would be implemented here');
    }
  };

  if (imageUrl) {
    return (
      <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
        <TouchableOpacity onPress={handleImagePress} style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          >
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
                <Download color="#FFFFFF" size={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  }

  if (voiceUrl) {
    const progressPercentage = duration > 0 ? (playbackPosition / duration) * 100 : 0;

    return (
      <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
        <LinearGradient
          colors={isUser ? ['#8B5CF6', '#A855F7'] : ['#1F2937', '#374151']}
          style={styles.voiceContainer}
        >
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause color="#FFFFFF" size={20} />
            ) : (
              <Play color="#FFFFFF" size={20} />
            )}
          </TouchableOpacity>

          <View style={styles.voiceContent}>
            <View style={styles.waveformContainer}>
              <View style={styles.waveform}>
                {Array.from({ length: 20 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      {
                        height: Math.random() * 20 + 8,
                        backgroundColor: i < (progressPercentage / 5) 
                          ? (isUser ? '#FFFFFF' : '#8B5CF6')
                          : (isUser ? '#FFFFFF60' : '#6B728060'),
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressPercentage}%`,
                      backgroundColor: isUser ? '#FFFFFF' : '#8B5CF6',
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.voiceInfo}>
              <View style={styles.voiceIcon}>
                <Volume2 color={isUser ? '#FFFFFF' : '#8B5CF6'} size={14} />
              </View>
              <Text style={[styles.voiceDuration, isUser ? styles.userText : styles.aiText]}>
                {formatDuration(playbackPosition)} / {formatDuration(duration)}
              </Text>
            </View>
          </View>

          <View style={styles.voiceActions}>
            <TouchableOpacity style={styles.voiceActionButton} onPress={handleDownload}>
              <Download color={isUser ? '#FFFFFF' : '#8B5CF6'} size={14} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.voiceActionButton} onPress={handleShare}>
              <Share color={isUser ? '#FFFFFF' : '#8B5CF6'} size={14} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 250,
    maxHeight: 300,
  },
  image: {
    width: 250,
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 6,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 200,
    maxWidth: 280,
    gap: 12,
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  voiceContent: {
    flex: 1,
    gap: 6,
  },
  waveformContainer: {
    position: 'relative',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  voiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voiceIcon: {
    opacity: 0.8,
  },
  voiceDuration: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#D1D5DB',
  },
  voiceActions: {
    flexDirection: 'column',
    gap: 4,
  },
  voiceActionButton: {
    padding: 4,
    opacity: 0.7,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    marginHorizontal: 8,
  },
  userTimestamp: {
    color: '#94A3B8',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#6B7280',
    textAlign: 'left',
  },
});