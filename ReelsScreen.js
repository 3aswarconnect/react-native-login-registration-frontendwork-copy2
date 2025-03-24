import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Image, Linking, Alert, Animated } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useQueryClient } from 'react-query';

const { height, width } = Dimensions.get('window');

const categories = ['All','Entertainment','Kids Corner','Food/cooking','News','Gaming','Motivation/Self Growth','Travel/Nature','Tech/Education', 'Health/Fitness','Personal Thoughts'];

// Export this function to be available for prefetching in SplashScreen
export const fetchReelsData = async (category = 'All') => {
  const response = await axios.get(`http://192.168.159.183:4000/reels?category=${category}`);
  return response.data;
};

const VideoItem = React.memo(({ item, isActive, index, screenFocused, navigation }) => {
  const playerRef = useRef(null);
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Animation value for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Get userId directly from the item prop
  const userId = item.userId;
  
  // Check if this video has a document file
  const hasDocFile = !!item.docFileUrl;
  
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
    
    // Start pulsing animation for doc icon
    if (hasDocFile) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    }
    
    return () => {
      // Clean up animations when component unmounts
      pulseAnim.stopAnimation();
    };
  }, [userId, hasDocFile]);
  
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`http://192.168.159.183:4000/profileget`, {
        params: { userId }
      });
      
      // Only set data if it exists in the response
      if (response.data) {
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        if (response.data.username) setUsername(response.data.username);
      }
    } catch (error) {
      // Set fallback username if needed
      setUsername(`user_${userId ? userId.substring(0, 5) : 'unknown'}`);
    }
  };
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuteState = !prev;
      if (playerRef.current) {
        playerRef.current.volume = !newMuteState ? 0.0 : (isActive && screenFocused) ? 1.0 : 0.0;
      }
      return newMuteState;
    });
  }, [isActive, screenFocused]);

  const navigateToProfile = useCallback(() => {
    // Using the navigation prop passed from parent
    navigation.navigate('ProfileView', { 
      userId: userId,
      username: username 
    });
  }, [navigation, userId, username]);

  const openDocumentFile = useCallback(() => {
    if (item.docFileUrl) {
      Linking.openURL(item.docFileUrl)
        .catch(err => {
          Alert.alert(
            "Cannot Open Document",
            "There was a problem opening the document file. Please try again later.",
            [{ text: "OK" }]
          );
        });
    }
  }, [item.docFileUrl]);
  
  const player = useVideoPlayer(
    { uri: item.fileUrl },
    (player) => {
      playerRef.current = player;
      player.loop = true;
      
      // Set initial volume based on active state and screen focus and mute state
      player.volume = (isActive && screenFocused && !isMuted) ? 1.0 : 0.0;
      
      // Always play the video, but control volume instead
      try {
        player.play();
      } catch (error) {
        console.log(`Error playing video ${index}:`, error);
      }
    }
  );

  // Effect for handling active item changes
  useEffect(() => {
    if (playerRef.current) {
      try {
        // Set volume based on both active state AND screen focus AND mute state
        playerRef.current.volume = (isActive && screenFocused && !isMuted) ? 1.0 : 0.0;
        
        // Ensure the video is playing if it's active
        if (isActive && screenFocused) {
          playerRef.current.play();
        }
      } catch (error) {
        console.log(`Error updating volume for video ${index}:`, error);
      }
    }
  }, [isActive, screenFocused, index, isMuted]);

  return (
    <View style={styles.videoContainer}>
      <VideoView 
        style={styles.video} 
        player={player} 
        allowsFullscreen={false} 
        allowsPictureInPicture={false} 
        controls={false} 
      />
       
      {/* Gradient overlay at the bottom for better text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradientOverlay}
      />
      
      <View style={styles.descriptionContainer}>
        {username && <Text style={styles.userUsername}>@{username}</Text>}
        <Text style={styles.description}>{item.description}</Text>
      </View>
      
      {/* Right side icons container */}
      <View style={styles.rightIconsContainer}>
        {/* Profile picture */}
        <TouchableOpacity
          onPress={navigateToProfile}
          activeOpacity={0.7}
          style={styles.profileButton}
        >
          {profilePic ? (
            <Image 
              source={{ uri: profilePic }} 
              style={styles.profilePicIcon} 
            />
          ) : (
            <View style={styles.defaultProfileIcon}>
              <Text style={styles.defaultProfileIconText}>
                {username ? username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Sound icon */}
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={toggleMute}
          activeOpacity={0.7}
        >
          <FontAwesome 
            name={isMuted ? "volume-off" : "volume-up"} 
            size={24} 
            color="#ffffff" 
            style={styles.soundIcon} 
          />
        </TouchableOpacity>
        
        {/* Document file icon - only shown if docFileUrl exists */}
        {hasDocFile && (
          <TouchableOpacity 
            style={styles.docIconContainer} 
            onPress={openDocumentFile}
            activeOpacity={0.7}
          >
            <View style={styles.docIconInner}>
              <FontAwesome 
                name="file-pdf-o" 
                size={22} 
                color="white" 
                style={styles.docIcon} 
              />
            </View>
            <Animated.View 
              style={[
                styles.docIconPulse,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const ReelsScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const [screenFocused, setScreenFocused] = useState(true);
  const navigation = useNavigation();
  
  const flatListRef = useRef(null);
  const queryClient = useQueryClient();

  // Use React Query to fetch and cache data
  const { data: videos = [], isLoading } = useQuery(
    ['reels', selectedCategory],
    () => fetchReelsData(selectedCategory),
    {
      // Use stale data while fetching new data
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep cached data for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Enable prefetched data usage
      initialData: () => {
        return queryClient.getQueryData(['reels', selectedCategory]);
      }
    }
  );

  // Handle screen focus changes
  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => {
        setScreenFocused(false);
      };
    }, [])
  );

  const handleCategorySelect = useCallback((category) => {
    if (category === selectedCategory) return;
    
    setSelectedCategory(category);
    setActiveIndex(0);
    // Scroll back to top when changing category
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedCategory]);

  const viewabilityConfig = useMemo(() => ({ 
    itemVisiblePercentThreshold: 50 
  }), []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setActiveIndex(newIndex);
    }
  }, []);

  const getItemLayout = useCallback((_, index) => ({
    length: height,
    offset: height * index,
    index
  }), []);

  const renderCategoryButton = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton, 
        selectedCategory === item ? styles.selectedCategoryButton : {}
      ]}
      onPress={() => handleCategorySelect(item)}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item ? styles.selectedCategoryText : {}
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategorySelect]);

  const keyExtractor = useCallback((_, index) => `video-${index}`, []);
  const categoryKeyExtractor = useCallback((item) => `category-${item}`, []);

  const renderVideoItem = useCallback(({ item, index }) => (
    <VideoItem 
      item={item} 
      isActive={index === activeIndex} 
      index={index}
      screenFocused={screenFocused}
      navigation={navigation}
    />
  ), [activeIndex, screenFocused, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={categoryKeyExtractor}
          renderItem={renderCategoryButton}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={keyExtractor}
        renderItem={renderVideoItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        windowSize={5}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={height}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  filterContainer: { 
    position: 'absolute', 
    top: 20, 
    zIndex: 10, 
    width: '100%', 
    paddingHorizontal: 10,
    
  },
  categoryListContent: {
    paddingVertical: 9,
  },
  categoryButton: { 
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 2,
  },
  selectedCategoryButton: {
    backgroundColor: 'white',
    borderColor: 'white',
    elevation: 4,
  },
  categoryText: { 
    color: '#d3d3d3',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#000',
    fontWeight: '600',
  },
  videoContainer: { 
    height: height,
    width: width,
    position: 'relative',
  },
  video: { 
    width: '100%', 
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 70, // Make space for the right icons
    padding: 12,
  },
  userUsername: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: { 
    color: '#ffffff', 
    fontSize: 16,
    marginTop: 5,
    lineHeight: 22,
  },
  profileButton: {
    marginBottom: 15,
  },
  profilePicIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  defaultProfileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  defaultProfileIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rightIconsContainer: {
    position: 'absolute',
    right: 10,
    bottom: 200,
    alignItems: 'center',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  soundIcon: {
  },
  docIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  docIconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 16, 17, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  docIconPulse: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(221, 228, 235, 0.3)',
  },
  docIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default ReelsScreen;