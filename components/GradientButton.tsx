import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#8B5CF6', '#A855F7'];
      case 'secondary':
        return ['#EC4899', '#F472B6'];
      case 'accent':
        return ['#06B6D4', '#0891B2'];
      default:
        return ['#8B5CF6', '#A855F7'];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 40, paddingHorizontal: 16 };
      case 'medium':
        return { height: 48, paddingHorizontal: 24 };
      case 'large':
        return { height: 56, paddingHorizontal: 32 };
      default:
        return { height: 48, paddingHorizontal: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: 14 };
      case 'medium':
        return { fontSize: 16 };
      case 'large':
        return { fontSize: 18 };
      default:
        return { fontSize: 16 };
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchableOpacity
      style={[animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#64748B', '#64748B'] : getGradientColors()}
        style={[styles.button, getSizeStyles()]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.text, getTextSize(), textStyle]}>
          {title}
        </Text>
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
});