import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark, Star, Clock, Grid2x2 as Grid, List, Filter, Search, Heart, Share, Shirt, Trash2 } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 2; // Account for padding and gap

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [savedLooks, setSavedLooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved looks data
  useEffect(() => {
    if (user) {
      loadSavedLooks();
    } else {
      setSavedLooks([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadSavedLooks = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your backend
      // For now, we'll use mock data
      const mockLooks = [
        {
          id: 1,
          image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Summer Casual Look',
          category: 'Casual',
          score: 9.2,
          date: '2024-01-15',
          isFavorite: true,
          tags: ['Summer', 'Casual', 'Comfort'],
        },
        {
          id: 2,
          image: 'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Professional Outfit',
          category: 'Business',
          score: 8.8,
          date: '2024-01-14',
          isFavorite: false,
          tags: ['Business', 'Professional', 'Formal'],
        },
        {
          id: 3,
          image: 'https://images.pexels.com/photos/1559113/pexels-photo-1559113.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Evening Elegance',
          category: 'Formal',
          score: 9.5,
          date: '2024-01-13',
          isFavorite: true,
          tags: ['Evening', 'Elegant', 'Party'],
        },
        {
          id: 4,
          image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Weekend Vibes',
          category: 'Casual',
          score: 8.5,
          date: '2024-01-12',
          isFavorite: false,
          tags: ['Weekend', 'Relaxed', 'Comfortable'],
        },
        {
          id: 5,
          image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Chic Street Style',
          category: 'Street',
          score: 9.0,
          date: '2024-01-11',
          isFavorite: true,
          tags: ['Street', 'Trendy', 'Urban'],
        },
        {
          id: 6,
          image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Date Night Ready',
          category: 'Date',
          score: 8.9,
          date: '2024-01-10',
          isFavorite: false,
          tags: ['Date', 'Romantic', 'Stylish'],
        },
        {
          id: 7,
          image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Boho Chic',
          category: 'Casual',
          score: 8.7,
          date: '2024-01-09',
          isFavorite: true,
          tags: ['Boho', 'Casual', 'Artistic'],
        },
        {
          id: 8,
          image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
          title: 'Classic Elegance',
          category: 'Formal',
          score: 9.1,
          date: '2024-01-08',
          isFavorite: false,
          tags: ['Classic', 'Elegant', 'Timeless'],
        },
      ];
      
      setSavedLooks(mockLooks);
    } catch (error) {
      console.error('Error loading saved looks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.authPrompt}>
            <Bookmark color="#8B5CF6" size={48} />
            <Text style={styles.authTitle}>Saved Looks</Text>
            <Text style={styles.authDescription}>
              Sign in to save your favorite virtual try-on results and create your personal style collection.
            </Text>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth')}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.authButtonGradient}>
                <Text style={styles.authButtonText}>Sign In to Save Looks</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const filters = [
    { id: 'all', label: 'All Looks', count: savedLooks.length },
    { id: 'favorites', label: 'Favorites', count: savedLooks.filter(look => look.isFavorite).length },
    { id: 'recent', label: 'Recent', count: savedLooks.filter(look => new Date(look.date) > new Date('2024-01-14')).length },
  ];

  const getFilteredLooks = () => {
    switch (selectedFilter) {
      case 'favorites':
        return savedLooks.filter(look => look.isFavorite);
      case 'recent':
        return savedLooks.filter(look => new Date(look.date) > new Date('2024-01-14'));
      default:
        return savedLooks;
    }
  };

  const handleLookPress = (look: typeof savedLooks[0]) => {
    router.push('/tryon-results');
  };

  const toggleFavorite = (lookId: number) => {
    setSavedLooks(prevLooks => 
      prevLooks.map(look => 
        look.id === lookId ? { ...look, isFavorite: !look.isFavorite } : look
      )
    );
  };

  const shareLook = (look: typeof savedLooks[0]) => {
    // Share functionality
  };

  const deleteLook = (lookId: number) => {
    setSavedLooks(prevLooks => prevLooks.filter(look => look.id !== lookId));
  };

  const SwipeableGridItem = ({ look, index }: { look: typeof savedLooks[0], index: number }) => {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(cardWidth * 1.5); // Height based on aspect ratio
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const isDeleting = useSharedValue(false);

    const panGestureHandler = (event: any) => {
      if (isDeleting.value) return;
      
      if (event.translationX < -80) {
        // Show delete button
        translateX.value = withSpring(-80);
      } else if (event.translationX > 0) {
        // Don't allow swiping right
        translateX.value = withSpring(0);
      } else {
        // Follow finger
        translateX.value = event.translationX;
      }
    };

    const panGestureEnd = (event: any) => {
      if (isDeleting.value) return;
      
      if (event.translationX < -100) {
        // Delete threshold reached
        translateX.value = withTiming(-screenWidth, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        isDeleting.value = true;
        
        // Actually delete after animation
        setTimeout(() => {
          runOnJS(deleteLook)(look.id);
        }, 300);
      } else if (event.translationX < -40) {
        // Show delete button
        translateX.value = withSpring(-80);
      } else {
        // Reset position
        translateX.value = withSpring(0);
      }
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { scale: scale.value }
        ],
        opacity: opacity.value,
      };
    });

    const deleteButtonStyle = useAnimatedStyle(() => {
      const showDelete = translateX.value < -20;
      return {
        opacity: showDelete ? withTiming(1) : withTiming(0),
        right: 10,
      };
    });

    return (
      <View style={[styles.gridItemContainer, { width: cardWidth }]}>
        <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteLook(look.id)}
          >
            <Trash2 color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </Animated.View>
        
        <AnimatedTouchableOpacity
          style={[styles.gridItem, { width: cardWidth }, animatedStyle]}
          onPress={() => handleLookPress(look)}
          onLongPress={() => translateX.value = withSpring(-80)}
          onPressOut={() => {}}
        >
          <View style={styles.gridImageContainer}>
            <Image source={{ uri: look.image }} style={styles.gridImage} />
            <LinearGradient
              colors={['transparent', '#00000060']}
              style={styles.gridOverlay}
            >
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(look.id)}
              >
                <Heart
                  color={look.isFavorite ? '#EC4899' : '#FFFFFF'}
                  size={16}
                  fill={look.isFavorite ? '#EC4899' : 'transparent'}
                />
              </TouchableOpacity>
              <View style={styles.gridInfo}>
                <View style={styles.gridScore}>
                  <Star color="#F59E0B" size={12} fill="#F59E0B" />
                  <Text style={styles.gridScoreText}>{look.score}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.gridContent}>
            <Text style={styles.gridTitle} numberOfLines={1}>{look.title}</Text>
            <Text style={styles.gridCategory}>{look.category}</Text>
          </View>
        </AnimatedTouchableOpacity>
      </View>
    );
  };

  const SwipeableListItem = ({ look }: { look: typeof savedLooks[0] }) => {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(120);
    const opacity = useSharedValue(1);
    const isDeleting = useSharedValue(false);

    const panGestureHandler = (event: any) => {
      if (isDeleting.value) return;
      
      if (event.translationX < -100) {
        // Show delete button
        translateX.value = withSpring(-100);
      } else if (event.translationX > 0) {
        // Don't allow swiping right
        translateX.value = withSpring(0);
      } else {
        // Follow finger
        translateX.value = event.translationX;
      }
    };

    const panGestureEnd = (event: any) => {
      if (isDeleting.value) return;
      
      if (event.translationX < -150) {
        // Delete threshold reached
        translateX.value = withTiming(-screenWidth, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        itemHeight.value = withTiming(0, { duration: 300 });
        isDeleting.value = true;
        
        // Actually delete after animation
        setTimeout(() => {
          runOnJS(deleteLook)(look.id);
        }, 300);
      } else if (event.translationX < -50) {
        // Show delete button
        translateX.value = withSpring(-100);
      } else {
        // Reset position
        translateX.value = withSpring(0);
      }
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
        height: itemHeight.value,
      };
    });

    const deleteButtonStyle = useAnimatedStyle(() => {
      const showDelete = translateX.value < -20;
      return {
        opacity: showDelete ? withTiming(1) : withTiming(0),
        right: 20,
      };
    });

    return (
      <View style={styles.listItemContainer}>
        <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteLook(look.id)}
          >
            <Trash2 color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => handleLookPress(look)}
            onLongPress={() => translateX.value = withSpring(-100)}
          >
            <LinearGradient
              colors={['#1F2937', '#374151']}
              style={styles.listItemGradient}
            >
              <Image source={{ uri: look.image }} style={styles.listImage} />
              <View style={styles.listContent}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{look.title}</Text>
                  <TouchableOpacity onPress={() => toggleFavorite(look.id)}>
                    <Heart
                      color={look.isFavorite ? '#EC4899' : '#6B7280'}
                      size={16}
                      fill={look.isFavorite ? '#EC4899' : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.listCategory}>{look.category}</Text>
                <View style={styles.listMeta}>
                  <View style={styles.listScore}>
                    <Star color="#F59E0B" size={12} fill="#F59E0B" />
                    <Text style={styles.listScoreText}>{look.score}/10</Text>
                  </View>
                  <View style={styles.listDate}>
                    <Clock color="#6B7280" size={12} />
                    <Text style={styles.listDateText}>{new Date(look.date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={styles.tagContainer}>
                  {look.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={() => shareLook(look)}>
                <Share color="#6B7280" size={16} />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderGridView = () => {
    const filteredLooks = getFilteredLooks();
    
    return (
      <FlatList
        data={filteredLooks}
        renderItem={({ item, index }) => <SwipeableGridItem look={item} index={index} />}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={renderEmptyState}
      />
    );
  };

  const renderListView = () => {
    const filteredLooks = getFilteredLooks();
    
    return (
      <FlatList
        data={filteredLooks}
        renderItem={({ item }) => <SwipeableListItem look={item} />}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Shirt color="#6B7280" size={48} />
      <Text style={styles.emptyTitle}>No saved looks yet</Text>
      <Text style={styles.emptyDescription}>
        Start trying on clothes and save your favorite looks to see them here.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/tryon')}
      >
        <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.emptyButtonGradient}>
          <Text style={styles.emptyButtonText}>Try On Clothes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1F2937']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Looks</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.searchButton}>
              <Search color="#6B7280" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewModeButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <List color="#6B7280" size={20} />
              ) : (
                <Grid color="#6B7280" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id as 'all' | 'favorites' | 'recent')}
            >
              <LinearGradient
                colors={
                  selectedFilter === filter.id
                    ? ['#8B5CF6', '#A855F7']
                    : ['#374151', '#374151']
                }
                style={styles.filterGradient}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
                <Text
                  style={[
                    styles.filterCount,
                    selectedFilter === filter.id && styles.filterCountActive,
                  ]}
                >
                  {filter.count}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>Loading saved looks...</Text>
            </View>
          ) : viewMode === 'grid' ? renderGridView() : renderListView()}
        </View>
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
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    color: '#F9FAFB',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  authDescription: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  authButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#F9FAFB',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    padding: 8,
  },
  viewModeButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterButtonActive: {},
  filterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
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
  filterCountActive: {
    color: '#FFFFFF',
    backgroundColor: '#FFFFFF30',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  gridContainer: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItemContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  gridItem: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: '40%',
    zIndex: 0,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridImageContainer: {
    position: 'relative',
    aspectRatio: 3/4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    justifyContent: 'space-between',
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#00000050',
    borderRadius: 16,
    padding: 8,
  },
  gridInfo: {
    alignSelf: 'flex-end',
  },
  gridScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00000050',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridScoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  gridContent: {
    paddingHorizontal: 4,
  },
  gridTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  gridCategory: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  listContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  listItemContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  listItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 16,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
    gap: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  listCategory: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  listMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  listScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listScoreText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  listDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listDateText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: '#8B5CF6',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  shareButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#F9FAFB',
    fontSize: 20,
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
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});