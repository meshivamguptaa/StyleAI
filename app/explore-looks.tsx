import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, Star, Heart, TrendingUp, Clock } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 2; // Account for padding and gap

export default function ExploreLooksScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', count: 1247 },
    { id: 'trending', label: 'Trending', count: 89 },
    { id: 'casual', label: 'Casual', count: 324 },
    { id: 'formal', label: 'Formal', count: 156 },
    { id: 'party', label: 'Party', count: 98 },
    { id: 'summer', label: 'Summer', count: 234 },
  ];

  const trendingLooks = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Summer Elegance',
      category: 'Summer',
      rating: 4.8,
      tries: '2.1k',
      likes: 1234,
      isLiked: false,
      user: 'Sarah M.',
      timeAgo: '2h ago',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Business Chic',
      category: 'Formal',
      rating: 4.9,
      tries: '1.8k',
      likes: 987,
      isLiked: true,
      user: 'Emma L.',
      timeAgo: '4h ago',
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1559113/pexels-photo-1559113.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Evening Glam',
      category: 'Party',
      rating: 4.7,
      tries: '3.2k',
      likes: 2156,
      isLiked: false,
      user: 'Jessica R.',
      timeAgo: '6h ago',
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Weekend Vibes',
      category: 'Casual',
      rating: 4.6,
      tries: '1.5k',
      likes: 876,
      isLiked: true,
      user: 'Maya K.',
      timeAgo: '8h ago',
    },
    {
      id: 5,
      image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Street Style',
      category: 'Casual',
      rating: 4.8,
      tries: '2.7k',
      likes: 1543,
      isLiked: false,
      user: 'Alex T.',
      timeAgo: '12h ago',
    },
    {
      id: 6,
      image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Date Night',
      category: 'Party',
      rating: 4.9,
      tries: '1.9k',
      likes: 1098,
      isLiked: true,
      user: 'Zoe W.',
      timeAgo: '1d ago',
    },
    {
      id: 7,
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Boho Chic',
      category: 'Casual',
      rating: 4.5,
      tries: '1.2k',
      likes: 654,
      isLiked: false,
      user: 'Luna P.',
      timeAgo: '1d ago',
    },
    {
      id: 8,
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Classic Elegance',
      category: 'Formal',
      rating: 4.7,
      tries: '2.3k',
      likes: 1432,
      isLiked: true,
      user: 'Grace H.',
      timeAgo: '2d ago',
    },
    {
      id: 9,
      image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Urban Cool',
      category: 'Casual',
      rating: 4.6,
      tries: '1.7k',
      likes: 923,
      isLiked: false,
      user: 'Kai R.',
      timeAgo: '2d ago',
    },
    {
      id: 10,
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Vintage Vibes',
      category: 'Party',
      rating: 4.8,
      tries: '2.0k',
      likes: 1234,
      isLiked: true,
      user: 'Ivy S.',
      timeAgo: '3d ago',
    },
  ];

  const getFilteredLooks = () => {
    let filtered = trendingLooks;
    
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'trending') {
        filtered = filtered.filter(look => look.tries.includes('k') && parseFloat(look.tries) > 2);
      } else {
        filtered = filtered.filter(look => 
          look.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(look =>
        look.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        look.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleLookPress = (look: typeof trendingLooks[0]) => {
    router.push('/tryon-results');
  };

  const toggleLike = (lookId: number) => {
    // Toggle like functionality
  };

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#F9FAFB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explore Looks</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#6B7280" size={20} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.searchWrapper}
          >
            <Search color="#6B7280" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search looks, styles, categories..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </LinearGradient>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <LinearGradient
                colors={
                  selectedCategory === category.id
                    ? ['#8B5CF6', '#A855F7']
                    : ['#374151', '#374151']
                }
                style={styles.categoryGradient}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
                <Text
                  style={[
                    styles.categoryCount,
                    selectedCategory === category.id && styles.categoryCountActive,
                  ]}
                >
                  {category.count}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <TrendingUp color="#8B5CF6" size={16} />
            <Text style={styles.statText}>
              {getFilteredLooks().length} looks found
            </Text>
          </View>
          <View style={styles.statItem}>
            <Clock color="#EC4899" size={16} />
            <Text style={styles.statText}>Updated 5 min ago</Text>
          </View>
        </View>

        {/* Looks Grid */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.contentContainer}
        >
          {getFilteredLooks().length === 0 ? (
            <View style={styles.emptyState}>
              <Search color="#6B7280" size={48} />
              <Text style={styles.emptyTitle}>No looks found</Text>
              <Text style={styles.emptyDescription}>
                Try adjusting your search or browse different categories.
              </Text>
            </View>
          ) : (
            <View style={styles.looksGrid}>
              {getFilteredLooks().map((look) => (
                <TouchableOpacity
                  key={look.id}
                  style={[styles.lookCard, { width: cardWidth }]}
                  onPress={() => handleLookPress(look)}
                >
                  <View style={styles.lookImageContainer}>
                    <Image source={{ uri: look.image }} style={styles.lookImage} />
                    <LinearGradient
                      colors={['transparent', '#00000080']}
                      style={styles.lookOverlay}
                    >
                      <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => toggleLike(look.id)}
                      >
                        <Heart
                          color={look.isLiked ? '#EC4899' : '#FFFFFF'}
                          size={16}
                          fill={look.isLiked ? '#EC4899' : 'transparent'}
                        />
                      </TouchableOpacity>
                      <View style={styles.lookStats}>
                        <View style={styles.lookRating}>
                          <Star color="#F59E0B" size={12} fill="#F59E0B" />
                          <Text style={styles.lookRatingText}>{look.rating}</Text>
                        </View>
                        <Text style={styles.lookTries}>{look.tries}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.lookInfo}>
                    <Text style={styles.lookTitle} numberOfLines={1}>{look.title}</Text>
                    <Text style={styles.lookCategory}>{look.category}</Text>
                    <View style={styles.lookMeta}>
                      <Text style={styles.lookUser}>by {look.user}</Text>
                      <Text style={styles.lookTime}>{look.timeAgo}</Text>
                    </View>
                    <View style={styles.lookEngagement}>
                      <View style={styles.lookLikes}>
                        <Heart color="#EC4899" size={12} />
                        <Text style={styles.lookLikesText}>{look.likes}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryButtonActive: {},
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryCount: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#4B5563',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  categoryCountActive: {
    color: '#FFFFFF',
    backgroundColor: '#FFFFFF30',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  looksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  lookCard: {
    marginBottom: 20,
  },
  lookImageContainer: {
    position: 'relative',
    aspectRatio: 3/4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  lookImage: {
    width: '100%',
    height: '100%',
  },
  lookOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    justifyContent: 'space-between',
  },
  likeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#00000050',
    borderRadius: 16,
    padding: 6,
  },
  lookStats: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    gap: 4,
  },
  lookRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00000050',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lookRatingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  lookTries: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#00000050',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lookInfo: {
    paddingHorizontal: 4,
    gap: 2,
  },
  lookTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  lookCategory: {
    color: '#8B5CF6',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  lookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lookUser: {
    color: '#9CA3AF',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  lookTime: {
    color: '#6B7280',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  lookEngagement: {
    marginTop: 4,
  },
  lookLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lookLikesText: {
    color: '#EC4899',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});