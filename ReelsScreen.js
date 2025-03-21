import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Image, Linking, Alert } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const { height, width } = Dimensions.get('window');

const categories = ['All', 'Entertainment', 'Education', 'Technology', 'Travel', 'Food', 'Fitness', 'Music', 'Comedy', 'Motivation', 'Fashion', 'News', 'Happy', 'Sad', 'Angry'];

const VideoItem = React.memo(({ item, isActive, index, screenFocused }) => {
  const playerRef = useRef(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [socialLinks, setSocialLinks] = useState({});
  const [username, setUsername] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
  // Get userId directly from the item prop
  const userId = item.userId;
  
  // Check if this video has a document file
  const hasDocFile = !!item.docFileUrl;

  // Log for debugging
  console.log(`Video ${index} userId:`, userId);
  console.log(`Video ${index} has doc file:`, hasDocFile);
  if (hasDocFile) {
    console.log(`Doc file URL:`, item.docFileUrl);
  }
  
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);
  
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`http://192.168.159.183:4000/profileget`, {
        params: { userId: userId }
      });
      
      // Only set data if it exists in the response
      if (response.data) {
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        if (response.data.username) setUsername(response.data.username);
      }
      
      console.log(`Profile data for user ${userId}:`, response.data);
    } catch (error) {
      console.log(`Profile data not found for user ${userId}:`, error);
      // Set fallback username if needed
      setUsername(`user_${userId ? userId.substring(0, 5) : 'unknown'}`);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (playerRef.current) {
      playerRef.current.volume = !isMuted ? 0.0 : (isActive && screenFocused) ? 1.0 : 0.0;
    }
  };
  
  const openDocumentFile = () => {
    if (item.docFileUrl) {
      Linking.openURL(item.docFileUrl)
        .catch(err => {
          Alert.alert(
            "Cannot Open Document",
            "There was a problem opening the document file. Please try again later.",
            [{ text: "OK" }]
          );
          console.error("Error opening document URL:", err);
        });
    }
  };
  
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
      <View style={styles.descriptionContainer}>
        {username && <Text style={styles.userUsername}>@{username}</Text>}
        <Text style={styles.description}>{item.description}</Text>
      </View>
      
      {/* Right side icons container */}
      <View style={styles.rightIconsContainer}>
        {/* Profile picture */}
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
        
        {/* Sound icon */}
        <TouchableOpacity style={styles.soundIconContainer} onPress={toggleMute}>
          <FontAwesome 
            name={isMuted ? "volume-off" : "volume-up"} 
            size={24} 
            color="white" 
            style={styles.soundIcon} 
          />
        </TouchableOpacity>
        
        {/* Document file icon - only shown if docFileUrl exists - UPDATED FOR STYLE */}
        {hasDocFile && (
          <TouchableOpacity style={styles.docIconContainer} onPress={openDocumentFile}>
            <View style={styles.docIconInner}>
              <FontAwesome 
                name="file-pdf-o" 
                size={22} 
                color="white" 
                style={styles.docIcon} 
              />
            </View>
            <View style={styles.docIconPulse}></View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const ReelsScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [videos, setVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [screenFocused, setScreenFocused] = useState(true);
  const flatListRef = useRef(null);
  const playerRefs = useRef([]);

  useEffect(() => {
    fetchVideos(selectedCategory);
  }, [selectedCategory]);

  const fetchVideos = async (category) => {
    try {
      const response = await axios.get(`http://192.168.159.183:4000/reels?category=${category}`);
      console.log('Videos fetched:', response.data);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Handle screen focus changes
  useFocusEffect(
    useCallback(() => {
      // When the screen comes into focus
      setScreenFocused(true);
      
      // When navigating away from this screen
      return () => {
        setScreenFocused(false);
      };
    }, [])
  );

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setActiveIndex(0);
    // Scroll back to top when changing category
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setActiveIndex(newIndex);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === item && styles.selectedCategory]}
              onPress={() => handleCategorySelect(item)}
            >
              <Text style={styles.categoryText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <VideoItem 
            item={item} 
            isActive={index === activeIndex} 
            index={index}
            screenFocused={screenFocused}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
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
    top: 50, 
    zIndex: 10, 
    width: '100%', 
    paddingHorizontal: 10 
  },
  categoryButton: { 
    padding: 10, 
    borderRadius: 20, 
    marginRight: 10, 
    backgroundColor: 'rgba(68, 68, 68, 0.7)' 
  },
  selectedCategory: { 
    backgroundColor: '#007bff' 
  },
  categoryText: { 
    color: '#fff', 
    fontWeight: 'bold' 
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
  descriptionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  description: { 
    color: '#fff', 
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 5,
  },
  userUsername: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userBio: {
    color: '#ddd',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rightIconsContainer: {
    position: 'absolute',
    right: 10,
    bottom: 120,
    alignItems: 'center',
  },
  profilePicIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 15,
  },
  defaultProfileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 15,
  },
  defaultProfileIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  soundIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  soundIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Updated doc icon styles
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
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  docIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  docIconPulse: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
    opacity: 0.5,
  },
});

export default ReelsScreen;