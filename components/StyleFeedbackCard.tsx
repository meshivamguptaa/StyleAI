import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, TrendingUp, Palette, Users } from 'lucide-react-native';

interface StyleFeedbackCardProps {
  feedback: string;
  score?: number;
  colorMatch?: string;
  fitRating?: string;
  recommendations?: string[];
}

export function StyleFeedbackCard({
  feedback,
  score = 0,
  colorMatch = 'Good',
  fitRating = 'Perfect',
  recommendations = [],
}: StyleFeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < rating ? '#F59E0B' : '#374151'}
        fill={i < rating ? '#F59E0B' : 'transparent'}
      />
    ));
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Style Analysis</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: getScoreColor(score) }]}>
            {score}/10
          </Text>
        </View>
      </View>

      <Text style={styles.feedback}>{feedback}</Text>

      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Palette color="#8B5CF6" size={16} />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Color Match</Text>
            <Text style={styles.metricValue}>{colorMatch}</Text>
          </View>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <TrendingUp color="#EC4899" size={16} />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Fit Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars(score >= 8 ? 5 : score >= 6 ? 4 : 3)}
            </View>
          </View>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Users color="#06B6D4" size={16} />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Style Trend</Text>
            <Text style={styles.metricValue}>93% Match</Text>
          </View>
        </View>
      </View>

      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={styles.recommendationDot} />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  scoreContainer: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  score: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  feedback: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 20,
  },
  metricsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIcon: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 8,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  metricValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  recommendationsTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  recommendationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    marginTop: 6,
  },
  recommendationText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});