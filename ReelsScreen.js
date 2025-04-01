import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Image, Linking, Alert, Animated, ActivityIndicator, Modal } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useQueryClient } from 'react-query';
import * as VideoThumbnails from "expo-video-thumbnails";
import { debounce } from 'lodash';

const { height, width } = Dimensions.get('window');

const categories = ['All','Entertainment','Kids Corner','Food/cooking','News','Gaming','Motivation/Self Growth','Travel/Nature','Tech/Education', 'Health/Fitness','Personal Thoughts'];

// Export this function to be available for prefetching in SplashScreen
export const fetchReelsData = async (category = 'All') => {
  try {
    const response = await axios.get(`http://192.168.217.183:4000/reels?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reels:', error);
    return [];
  }
};

const ThumbnailItem = React.memo(({ item, onPress, index }) => {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [thumbnailUri, setThumbnailUri] = useState(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    if (item.userId) fetchProfileData(item.userId);

    if (item.thumbnailUrl) {
      setThumbnailUri(item.thumbnailUrl);
      setLoadingThumbnail(false);
    } else {
      generateThumbnail(item.fileUrl);
    }
  }, [item]);

  const fetchProfileData = async (userId) => {
    try {
      const response = await axios.get(`http://192.168.217.183:4000/profileget`, {
        params: { userId },
      });

      if (response.data) {
        setProfilePic(response.data.profilePic || null);
        setUsername(response.data.username || `user_${userId?.substring(0, 5)}`);
      }
    } catch (error) {
     
      setUsername(`user_${userId?.substring(0, 5) || "unknown"}`);
    }
  };

  const generateThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0,
      });
      setThumbnailUri(uri);
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      setThumbnailUri(null);
    } finally {
      setLoadingThumbnail(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.thumbnailContainer} 
      onPress={() => onPress(index)}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailImageContainer}>
        {loadingThumbnail ? (
          <ActivityIndicator size="large" color="white" />
        ) : thumbnailUri && !imageLoadError ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnailImage}
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <View style={[styles.thumbnailImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Preview</Text>
          </View>
        )}
      </View>

      <View style={styles.thumbnailDetailsContainer}>
        <View style={styles.thumbnailProfileContainer}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.thumbnailProfilePic} />
          ) : (
            <View style={styles.thumbnailDefaultProfileIcon}>
              <Text style={styles.thumbnailDefaultProfileText}>
                {username ? username.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
          <Text style={styles.thumbnailUsername}>@{username || "anonymous"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const VideoItem = React.memo(({ item, isActive, index, screenFocused, navigation }) => {
  const playerRef = useRef(null);
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const userId = item.userId;
  const hasDocFile = !!item.docFileUrl;

  // Format view count for display
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
    
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
      pulseAnim.stopAnimation();
    };
  }, [userId, hasDocFile]);
  
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`http://192.168.217.183:4000/profileget`, {
        params: { userId }
      });
      
      if (response.data) {
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        if (response.data.username) setUsername(response.data.username);
      }
    } catch (error) {
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
      
      player.volume = (isActive && screenFocused && !isMuted) ? 1.0 : 0.0;
      
      try {
        player.play();
      } catch (error) {
        console.log(`Error playing video ${index}:`, error);
      }
    }
  );

  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.volume = (isActive && screenFocused && !isMuted) ? 1.0 : 0.0;
        
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
       
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradientOverlay}
      />
      
      <View style={styles.descriptionContainer}>
        {username && <Text style={styles.userUsername}>@{username}</Text>}
        <Text style={styles.description}>{item.description}</Text>
      </View>
      
      <View style={styles.rightIconsContainer}>
        <View style={styles.profileContainer}>
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
          
          {/* View count display */}
          <View style={styles.viewCountContainer}>
            <FontAwesome name="eye" size={14} color="white" />
            <Text style={styles.viewCountText}>
              {item.views ? formatViewCount(item.views) : '0'}
            </Text>
          </View>
        </View>
        
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [initialScrollIndex, setInitialScrollIndex] = useState(0);
  const [focusLocked, setFocusLocked] = useState(false);
  const [lockedCategory, setLockedCategory] = useState('');
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [focusModalVisible, setFocusModalVisible] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [viewedVideoIds, setViewedVideoIds] = useState([]);
  
  const timerRef = useRef(null);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const queryClient = useQueryClient();
  const viewedVideoIdsRef = useRef([]);
  const sendViewsTimeoutRef = useRef(null);

  const { data: videos = [], isLoading } = useQuery(
    ['reels', selectedCategory],
    () => fetchReelsData(selectedCategory),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      initialData: () => {
        return queryClient.getQueryData(['reels', selectedCategory]);
      },
      onError: (error) => {
        console.error('Error fetching reels data:', error);
        Alert.alert('Error', 'Unable to fetch reels. Please try again later.');
      }
    }
  );

  const sendViewedVideosToBackend = useCallback(debounce(async (ids) => {
    try {
      if (ids.length === 0) return;
      
      const response = await axios.post('http://192.168.217.183:4000/increment-views', {
        videoIds: ids
      });
      
      console.log('Views updated:', response.data);
      setViewedVideoIds([]);
      viewedVideoIdsRef.current = [];
    } catch (error) {
      console.error('Error updating views:', error);
    }
  }, 5000), []);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => {
        setScreenFocused(false);
        if (viewedVideoIdsRef.current.length > 0) {
          sendViewedVideosToBackend(viewedVideoIdsRef.current);
        }
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sendViewsTimeoutRef.current) {
        clearTimeout(sendViewsTimeoutRef.current);
      }
      if (viewedVideoIdsRef.current.length > 0) {
        sendViewedVideosToBackend(viewedVideoIdsRef.current);
      }
    };
  }, []);

  const startFocusLock = useCallback((category, minutes) => {
    setFocusLocked(true);
    setLockedCategory(category);
    setSelectedCategory(category);
    setLockTimeRemaining(minutes * 60);
    
    Alert.alert(
      "Focus Mode Activated",
      `You're now focused on ${category} for ${minutes} minutes. Other categories are locked.`,
      [{ text: "OK" }]
    );
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setLockTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setFocusLocked(false);
          
          Alert.alert(
            "Focus Time Complete",
            `Your ${minutes} minute focus time on ${category} is complete!`,
            [{ text: "Great!" }]
          );
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setFocusModalVisible(false);
  }, []);

  const cancelFocusLock = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setFocusLocked(false);
    setLockTimeRemaining(0);
    
    Alert.alert(
      "Focus Mode Canceled",
      "You've canceled focus mode. All categories are now available.",
      [{ text: "OK" }]
    );
  }, []);
  
  const handleCategorySelect = useCallback((category) => {
    if (focusLocked && category !== lockedCategory) {
      const minutes = Math.ceil(lockTimeRemaining / 60);
      Alert.alert(
        "Focus Mode Active",
        `You're focused on ${lockedCategory} for ${minutes} more minutes. Cancel focus mode to change categories.`,
        [
          { text: "Stay Focused", style: "cancel" },
          { text: "Cancel Focus Mode", onPress: cancelFocusLock }
        ]
      );
      return;
    }
    
    if (category === selectedCategory) return;
    
    setSelectedCategory(category);
    setActiveIndex(0);
    setIsFullScreen(false);
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedCategory, focusLocked, lockedCategory, lockTimeRemaining, cancelFocusLock]);

  const handleLockPress = useCallback((category) => {
    setModalCategory(category);
    setFocusModalVisible(true);
  }, []);

  const handleThumbnailPress = useCallback((index) => {
    setActiveIndex(index);
    setInitialScrollIndex(index);
    setIsFullScreen(true);
  }, []);

  const handleGoBackToThumbnails = useCallback(() => {
    setIsFullScreen(false);
  }, []);

  const viewabilityConfig = useMemo(() => ({ 
    itemVisiblePercentThreshold: 50 
  }), []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setActiveIndex(newIndex);
      
      const currentVideo = videos[newIndex];
      if (currentVideo && currentVideo.fileId) {
        if (!viewedVideoIdsRef.current.includes(currentVideo.fileId)) {
          const newViewedIds = [...viewedVideoIdsRef.current, currentVideo.fileId];
          viewedVideoIdsRef.current = newViewedIds;
          setViewedVideoIds(newViewedIds);
          
          if (sendViewsTimeoutRef.current) {
            clearTimeout(sendViewsTimeoutRef.current);
          }
          
          if (newViewedIds.length >= 10) {
            sendViewedVideosToBackend(newViewedIds);
          } else {
            sendViewsTimeoutRef.current = setTimeout(() => {
              sendViewedVideosToBackend(newViewedIds);
            }, 30000);
          }
        }
      }
    }
  }, [videos]);

  const getItemLayout = useCallback((_, index) => ({
    length: height,
    offset: height * index,
    index
  }), []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderCategoryButton = useCallback(({ item }) => {
    const isLocked = focusLocked && item !== lockedCategory;
    
    return (
      <View style={styles.categoryButtonContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton, 
            selectedCategory === item ? styles.selectedCategoryButton : {},
            isLocked ? styles.lockedCategoryButton : {}
          ]}
          onPress={() => handleCategorySelect(item)}
          activeOpacity={0.7}
          disabled={isLocked}
        >
          <Text 
            style={[
              styles.categoryText,
              selectedCategory === item ? styles.selectedCategoryText : {},
              isLocked ? styles.lockedCategoryText : {}
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.lockButton,
            focusLocked && item === lockedCategory ? styles.activeLockedButton : {}
          ]}
          onPress={() => handleLockPress(item)}
          disabled={focusLocked && item !== lockedCategory}
        >
          <FontAwesome 
            name={focusLocked && item === lockedCategory ? "lock" : "unlock"} 
            size={16} 
            color={focusLocked && item === lockedCategory ? "#FFD700" : "white"} 
          />
        </TouchableOpacity>
      </View>
    );
  }, [selectedCategory, handleCategorySelect, focusLocked, lockedCategory, handleLockPress]);

  const keyExtractor = useCallback((_, index) => `video-${index}`, []);
  const categoryKeyExtractor = useCallback((item) => `category-${item}`, []);

  const renderThumbnailItem = useCallback(({ item, index }) => (
    <ThumbnailItem 
      item={item} 
      onPress={handleThumbnailPress}
      index={index}
    />
  ), [handleThumbnailPress]);

  const renderVideoItem = useCallback(({ item, index }) => (
    <VideoItem 
      item={item} 
      isActive={index === activeIndex} 
      index={index}
      screenFocused={screenFocused}
      navigation={navigation}
    />
  ), [activeIndex, screenFocused, navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Reels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {focusLocked && (
        <View style={styles.focusTimerBanner}>
          <Text style={styles.focusTimerText}>
            Focus Mode: {formatTime(lockTimeRemaining)}
          </Text>
        </View>
      )}
      
      <View style={[styles.filterContainer, focusLocked && styles.filterContainerWithBanner]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={categoryKeyExtractor}
          renderItem={renderCategoryButton}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      {!isFullScreen ? (
        <FlatList
          ref={flatListRef}
          data={videos}
          keyExtractor={keyExtractor}
          renderItem={renderThumbnailItem}
          numColumns={2}
          columnWrapperStyle={styles.thumbnailColumnWrapper}
          contentContainerStyle={[
            styles.thumbnailContentContainer,
            focusLocked && styles.thumbnailContentContainerWithBanner
          ]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No reels found</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.fullScreenContainer}>
          <FlatList
            ref={flatListRef}
            data={videos}
            keyExtractor={keyExtractor}
            renderItem={renderVideoItem}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={true}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            snapToInterval={height}
            decelerationRate="fast"
            snapToAlignment="start"
            getItemLayout={getItemLayout}
            initialScrollIndex={initialScrollIndex}
          />
        </View>
      )}
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={focusModalVisible}
        onRequestClose={() => setFocusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lock on {modalCategory}</Text>
            <Text style={styles.modalSubtitle}>Select a focus time to lock in</Text>
            
            <View style={styles.timeButtonsContainer}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => startFocusLock(modalCategory, 10)}
              >
                <Text style={styles.timeButtonText}>10 mins</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => startFocusLock(modalCategory, 15)}
              >
                <Text style={styles.timeButtonText}>15 mins</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => startFocusLock(modalCategory, 30)}
              >
                <Text style={styles.timeButtonText}>30 mins</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
 
  filterContainer: { 
    position: 'absolute', 
    top: 20, 
    zIndex: 10, 
    width: '100%',
  },
  filterContainerWithBanner: {
    top: 60,
  },
  categoryListContent: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryButton: { 
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  lockedCategoryButton: {
    opacity: 0.5,
  },
  categoryText: { 
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
  lockedCategoryText: {
    color: 'rgba(255,255,255,0.4)',
  },
  lockButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeLockedButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderColor: '#FFD700',
  },
  focusTimerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#3498db',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    zIndex: 50,
  },
  focusTimerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  thumbnailColumnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  thumbnailContentContainer: {
    paddingTop: 80,
    paddingBottom: 20,
  },
  thumbnailContentContainerWithBanner: {
    paddingTop: 120,
  },
  thumbnailContainer: {
    width: width / 2 - 15,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    height: 220,
  },
  thumbnailImageContainer: {
    height: 270,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  thumbnailProfilePic: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 20,
    bottom: 150,
    left: 50,
  },
  thumbnailDefaultProfileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  thumbnailDefaultProfileText: {
    color: 'white',
    fontWeight: 'bold',
  },
  thumbnailUsername: {
    color: 'white',
    fontWeight: '500',
    bottom: 100,
    fontSize: 15,
    left: -30,
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
    right: 70,
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
  rightIconsContainer: {
    position: 'absolute',
    right: 10,
    bottom: 200,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileButton: {
    marginBottom: 8,
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
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewCountText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
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
  fullScreenContainer: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  placeholderImage: {
    backgroundColor: '#2c2c2c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  timeButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ReelsScreen;