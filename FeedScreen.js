import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image, ActivityIndicator, Dimensions, Alert, Animated, Platform, StatusBar } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { VideoView, createVideoPlayer, useVideoPlayer } from 'expo-video';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = (width - 40) / numColumns;

// Define API base URL - verify this is correct for your environment
const API_URL = 'http://192.168.217.183:4000';

// VideoItem component for thumbnails in the grid
const VideoItem = ({ videoUri, style }) => {
  // Create a video player instance for this item
  const videoPlayerRef = useRef(null);
  
  useEffect(() => {
    // Create the player when component mounts
    try {
      videoPlayerRef.current = createVideoPlayer(videoUri);
      videoPlayerRef.current.pause();
    } catch (error) {
      console.log(`Error creating video player:`, error);
    }
    
    // Clean up the player when component unmounts
    return () => {
      if (videoPlayerRef.current) {
        try {
          videoPlayerRef.current.release();
        } catch (error) {
          console.log(`Error releasing video player:`, error);
        }
        videoPlayerRef.current = null;
      }
    };
  }, [videoUri]);
  
  if (!videoPlayerRef.current) {
    return (
      <View style={[style, { backgroundColor: '#1A1A1A' }]} />
    );
  }
  
  return (
    <VideoView
      player={videoPlayerRef.current}
      style={style}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

// Progress indicator for reels
const ProgressBar = ({ duration = 30, isActive }) => {
  const animation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive) {
      Animated.timing(animation, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: false
      }).start();
    } else {
      animation.setValue(0);
    }
  }, [isActive, duration]);
  
  return (
    <View style={styles.progressContainer}>
      <Animated.View 
        style={[
          styles.progressBar,
          {
            width: animation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            })
          }
        ]}
      />
    </View>
  );
};

// Reels-style media item component with enhanced UI
const ReelsMediaItem = ({ item, isVisible, index, totalItems }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
  const [comments, setComments] = useState(Math.floor(Math.random() * 50) + 5);
  const [shares, setShares] = useState(Math.floor(Math.random() * 30) + 3);
  const playerRef = useRef(null);
  const isVideo = item.fileType === 'video';
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Auto-hide controls
  useEffect(() => {
    if (isVisible && showControls) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        }).start(() => setShowControls(false));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, showControls]);
  
  // Show controls on tap
  const handleTap = () => {
    if (!showControls) {
      setShowControls(true);
      fadeAnim.setValue(1);
    }
  };
  
  // For videos, create and manage the player
  useEffect(() => {
    if (isVideo) {
      if (isVisible) {
        if (playerRef.current) {
          try {
            playerRef.current.play();
          } catch (error) {
            console.log(`Error playing video:`, error);
          }
        }
      } else {
        if (playerRef.current) {
          try {
            playerRef.current.pause();
          } catch (error) {
            console.log(`Error pausing video:`, error);
          }
        }
      }
    }
  }, [isVisible, isVideo]);
  
  const toggleMute = () => {
    if (isVideo && playerRef.current) {
      setIsMuted(!isMuted);
      try {
        playerRef.current.volume = isMuted ? 1.0 : 0.0;
      } catch (error) {
        console.log(`Error toggling mute:`, error);
      }
    }
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };
  
  const player = isVideo ? useVideoPlayer(
    { uri: item.fileUrl },
    (player) => {
      playerRef.current = player;
      player.loop = true;
      player.volume = isMuted ? 0.0 : 1.0;
      
      if (isVisible) {
        try {
          player.play();
        } catch (error) {
          console.log(`Error playing video:`, error);
        }
      }
    }
  ) : null;
  
  // Format numbers for display
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  return (
    <TouchableOpacity 
      activeOpacity={1}
      style={styles.reelsItem}
      onPress={handleTap}
    >
      {isVideo ? (
        <VideoView 
          style={styles.reelsMedia} 
          player={player} 
          contentFit="contain"
          controls={false}
        />
      ) : (
        <Image
          source={{ uri: item.fileUrl }}
          style={styles.reelsMedia}
          resizeMode="contain"
        />
      )}
      
      {/* Top progress bar for reels navigation */}
      <View style={styles.progressBarContainer}>
        <ProgressBar isActive={isVisible && isVideo} duration={30} />
        <Text style={styles.reelsCounter}>{index + 1}/{totalItems}</Text>
      </View>
      
      {/* Right side interaction buttons */}
      <View style={styles.reelsInteractions}>
        <TouchableOpacity style={styles.reelsButton} onPress={toggleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={28} 
            color={isLiked ? "#FF375F" : "white"} 
          />
          <Text style={styles.reelsButtonText}>{formatCount(likes)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reelsButton}>
          <Ionicons name="chatbubble-outline" size={26} color="white" />
          <Text style={styles.reelsButtonText}>{formatCount(comments)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reelsButton}>
          <Ionicons name="arrow-redo-outline" size={26} color="white" />
          <Text style={styles.reelsButtonText}>{formatCount(shares)}</Text>
        </TouchableOpacity>
        
        {isVideo && (
          <TouchableOpacity style={styles.reelsButton} onPress={toggleMute}>
            <Ionicons 
              name={isMuted ? "volume-mute" : "volume-high"} 
              size={26} 
              color="white" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Bottom content info */}
      <View style={styles.reelsContent}>
        <View style={styles.reelsUserInfo}>
          <View style={styles.reelsAvatar}>
            <Text style={styles.reelsAvatarText}>{item.category ? item.category.charAt(0) : "M"}</Text>
          </View>
          <Text style={styles.reelsUsername}>{item.category || "Media"}</Text>
        </View>
        
        <Text style={styles.reelsDescription} numberOfLines={2}>
          {item.description || "No description available for this media"}
        </Text>
      </View>
      
      {/* Animated controls overlay */}
      {showControls && (
        <Animated.View 
          style={[
            styles.controlsOverlay,
            { opacity: fadeAnim }
          ]}
        >
          {isVideo && (
            <TouchableOpacity style={styles.playPauseButton}>
              <Ionicons name="play" size={50} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const FeedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Use a default userId for testing if none is passed
  const userId = route.params?.userId || '123456';

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All','Entertainment','Kids Corner','Food/cooking','News','Gaming','Motivation/Self Growth','Travel/Nature','Tech/Education', 'Health/Fitness','Personal Thoughts']);
  const [error, setError] = useState(null);
  
  // State for reels view
  const [reelsMode, setReelsMode] = useState(false);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const reelsRef = useRef(null);

  useEffect(() => {
    console.log("FeedScreen mounted with userId:", userId);
    fetchMedia();
    
    return () => {
      // Clean up code if needed
    };
  }, [selectedCategory, userId]);

  // Hide status bar in reels mode
  useEffect(() => {
    if (reelsMode) {
      StatusBar.setHidden(true);
    } else {
      StatusBar.setHidden(false);
    }
    
    return () => {
      StatusBar.setHidden(false);
    };
  }, [reelsMode]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching media with params:", {
        userId: userId,
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      
      const response = await axios.get(`${API_URL}/getUserMedia`, {
        params: {
          userId: userId,
          category: selectedCategory !== 'All' ? selectedCategory : undefined
        },
        timeout: 10000 // Add timeout to detect connection issues
      });
      
      console.log("API Response:", response.status, response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setMedia(response.data);
        console.log(`Found ${response.data.length} media items`);
        
        // Extract unique categories from the data if we're on "All" view
        if (selectedCategory === 'All' && response.data.length > 0) {
          const dataCategories = response.data.map(item => item.category).filter(Boolean);
          const uniqueCategories = ['All', ...new Set(dataCategories)];
          console.log("Unique categories:", uniqueCategories);
          setCategories(uniqueCategories);
        }
      } else {
        console.warn("API returned unexpected data format:", response.data);
        setMedia([]);
        setError("Received invalid data from server");
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
      
      let errorMessage = "Failed to load media";
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Check your network connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request error:", error.message);
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Show alert for better visibility during debugging
      Alert.alert(
        "Error Loading Media",
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle opening a media item in reels mode
  const handleMediaPress = (item, index) => {
    setCurrentReelIndex(index);
    setReelsMode(true);
  };

  // Close reels mode
  const handleCloseReels = () => {
    setReelsMode(false);
  };

  // Render grid item
  const renderGridItem = ({ item, index }) => {
    const isVideo = item.fileType === 'video';
    
    return (
      <TouchableOpacity 
        style={styles.mediaItem}
        onPress={() => handleMediaPress(item, index)}
      >
        {isVideo ? (
          <View style={styles.videoContainer}>
            <VideoItem
              videoUri={item.fileUrl}
              style={styles.mediaContent}
            />
            <View style={styles.playIcon}>
              <Ionicons name="play-circle" size={30} color="white" />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: item.fileUrl }}
            style={styles.mediaContent}
            resizeMode="cover"
            onError={(e) => console.error("Image loading error:", e.nativeEvent.error)}
          />
        )}
        <Text style={styles.description} numberOfLines={1}>
          {item.description || "No description"}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render reels item with visibility check
  const renderReelsItem = ({ item, index }) => {
    const isVisible = index === currentReelIndex;
    
    return (
      <ReelsMediaItem 
        item={item}
        isVisible={isVisible}
        index={index}
        totalItems={media.length}
      />
    );
  };

  // Handle viewable items change in reels mode
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentReelIndex(viewableItems[0].index);
    }
  }).current;

  // Viewability config for reels FlatList
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  // Add a manual refresh button for easier testing
  const renderRefreshButton = () => (
    <TouchableOpacity 
      style={styles.refreshButton}
      onPress={() => {
        Alert.alert(
          "Debug Info",
          `User ID: ${userId}\nCategory: ${selectedCategory}\nAPI URL: ${API_URL}/getUserMedia`,
          [
            { text: "Cancel" },
            { text: "Refresh", onPress: fetchMedia }
          ]
        );
      }}
    >
      <Ionicons name="refresh" size={24} color="#E0E0E0" />
    </TouchableOpacity>
  );

  // Render enter full screen button
  const renderFullScreenButton = () => (
    <TouchableOpacity 
      style={styles.fullScreenButton}
      onPress={() => {
        if (media.length > 0) {
          setCurrentReelIndex(0);
          setReelsMode(true);
        }
      }}
      disabled={media.length === 0}
    >
      <MaterialIcons name="fullscreen" size={24} color="#E0E0E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {!reelsMode ? (
        <View style={styles.container}>
          
          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <FlatList
              key="categoryList"
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === item && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text 
                    style={[
                      styles.categoryText,
                      selectedCategory === item && styles.selectedCategoryText
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E0E0E0" />
              <Text style={styles.loadingText}>Loading media...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={50} color="#E07070" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchMedia}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : media.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={50} color="#85B045" />
              <Text style={styles.emptyText}>No media found for "{selectedCategory}" category</Text>
              {selectedCategory !== 'All' && (
                <TouchableOpacity 
                  style={styles.viewAllButton} 
                  onPress={() => setSelectedCategory('All')}
                >
                  <Text style={styles.viewAllButtonText}>View All Media</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              key="gridView"
              data={media}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.fileId || item._id || String(Math.random())}
              numColumns={numColumns}
              contentContainerStyle={styles.mediaGrid}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={fetchMedia}
            />
          )}
        </View>
      ) : (
        <View style={styles.reelsContainer}>
          {/* Close button for reels mode */}
          <TouchableOpacity style={styles.reelsCloseButton} onPress={handleCloseReels}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Reels FlatList */}
          <FlatList
            key="reelsView"
            ref={reelsRef}
            data={media}
            renderItem={renderReelsItem}
            keyExtractor={(item) => item.fileId || item._id || String(Math.random())}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialScrollIndex={currentReelIndex}
            getItemLayout={(data, index) => ({
              length: height,
              offset: height * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            decelerationRate="fast"
            bounces={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3C3D37',
  },
  container: {
    flex: 1,
    backgroundColor: '#3C3D37',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2B26',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#181C14',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 5,
  },
  fullScreenButton: {
    padding: 5,
    marginRight: 10,
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#181C14',
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#2A2B26',
  },
  selectedCategory: {
    backgroundColor: '#85B045',
  },
  categoryText: {
    color: '#E0E0E0',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  mediaGrid: {
    padding: 10,
  },
  mediaItem: {
    width: itemWidth,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2A2B26',
  },
  mediaContent: {
    width: '100%',
    height: 180,
  },
  videoContainer: {
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  description: {
    padding: 8,
    color: '#E0E0E0',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#E0E0E0',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  viewAllButton: {
    backgroundColor: '#85B045',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E07070',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E07070',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Enhanced Reels mode styles
  reelsContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  reelsCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  reelsItem: {
    height: height,
    width: width,
    position: 'relative',
  },
  reelsMedia: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  
  // Progress bar at top
  progressBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    flex: 1,
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#85B045',
    borderRadius: 2,
  },
  reelsCounter: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  
  // Right side interaction buttons
  reelsInteractions: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
    zIndex: 5,
  },
  reelsButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  reelsButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  
  // Bottom content container
  reelsContent: {
    position: 'absolute',
    left: 15,
    right: 80,
    bottom: 30,
    zIndex: 5,
  },
  reelsUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reelsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#85B045',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reelsAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  reelsUsername: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reelsDescription: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Controls overlay
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedScreen;