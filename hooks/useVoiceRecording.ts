import { useState, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';

export interface VoiceRecordingHook {
  isRecording: boolean;
  isPlaying: boolean;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  playRecording: (uri: string) => Promise<void>;
  stopPlayback: () => Promise<void>;
  transcribeAudio: (uri: string) => Promise<string>;
  requestPermissions: () => Promise<boolean>;
}

export function useVoiceRecording(): VoiceRecordingHook {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Web-specific permission handling
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
          } catch (error) {
            console.error('Web audio permission denied:', error);
            Alert.alert('Permission Required', 'Please allow microphone access to use voice features.');
            return false;
          }
        } else {
          Alert.alert('Not Supported', 'Voice recording is not supported in this browser.');
          return false;
        }
      } else {
        // Mobile permission handling
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow microphone access to use voice features.');
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      if (Platform.OS === 'web') {
        // Web-specific recording implementation
        await startWebRecording();
      } else {
        // Mobile recording implementation
        await startMobileRecording();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  }, []);

  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        // Store the URL for later use
        (recording.current as any) = { uri: audioUrl, blob };
      };

      mediaRecorder.start();
      (recording.current as any) = { mediaRecorder, chunks };
      
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Web recording failed:', error);
      throw error;
    }
  };

  const startMobileRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording.current = newRecording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Mobile recording failed:', error);
      throw error;
    }
  };

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (!recording.current) return null;

      // Clear duration timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      setIsRecording(false);

      if (Platform.OS === 'web') {
        return await stopWebRecording();
      } else {
        return await stopMobileRecording();
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      return null;
    }
  }, []);

  const stopWebRecording = async (): Promise<string | null> => {
    try {
      const rec = recording.current as any;
      if (rec?.mediaRecorder) {
        rec.mediaRecorder.stop();
        
        // Stop all tracks
        rec.mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });

        // Wait a bit for the onstop event to process
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return rec.uri || null;
      }
      return null;
    } catch (error) {
      console.error('Web recording stop failed:', error);
      return null;
    }
  };

  const stopMobileRecording = async (): Promise<string | null> => {
    try {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        const uri = recording.current.getURI();
        recording.current = null;
        return uri;
      }
      return null;
    } catch (error) {
      console.error('Mobile recording stop failed:', error);
      return null;
    }
  };

  const playRecording = useCallback(async (uri: string) => {
    try {
      if (Platform.OS === 'web') {
        // Web audio playback
        const audio = new Audio(uri);
        audio.onended = () => setIsPlaying(false);
        await audio.play();
        setIsPlaying(true);
      } else {
        // Mobile audio playback
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        sound.current = newSound;
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        await newSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  }, []);

  const stopPlayback = useCallback(async () => {
    try {
      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
        sound.current = null;
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  }, []);

  const transcribeAudio = useCallback(async (uri: string): Promise<string> => {
    try {
      // For now, return a placeholder transcription
      // In production, you would integrate with a speech-to-text service
      // like Google Speech-to-Text, Azure Speech, or OpenAI Whisper
      
      console.log('Transcribing audio from:', uri);
      
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a realistic transcription based on common voice messages
      const sampleTranscriptions = [
        "What do you think about this outfit?",
        "Can you help me choose colors that match?",
        "I need styling advice for a formal event",
        "How does this look on me?",
        "What accessories would go well with this?",
        "I'm looking for a casual weekend outfit",
        "Can you suggest some trendy pieces?",
        "Help me put together a professional look"
      ];
      
      return sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
    } catch (error) {
      console.error('Transcription failed:', error);
      return "Voice message (transcription unavailable)";
    }
  }, []);

  return {
    isRecording,
    isPlaying,
    recordingDuration,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    transcribeAudio,
    requestPermissions,
  };
}