import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX } from 'lucide-react-native';

interface VoiceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function VoiceToggle({ enabled, onToggle, disabled = false }: VoiceToggleProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => onToggle(!enabled)}
      disabled={disabled}
    >
      <LinearGradient
        colors={enabled ? ['#8B5CF6', '#A855F7'] : ['#6B7280', '#6B7280']}
        style={styles.gradient}
      >
        {enabled ? (
          <Volume2 color="#FFFFFF" size={16} />
        ) : (
          <VolumeX color="#FFFFFF" size={16} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});