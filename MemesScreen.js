import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions, Linking, Alert, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');
const categories = ['All','Entertainment','Kids Corner','Food/cooking','News','Gaming','Motivation/Self Growth','Travel/Nature','Tech/Education', 'Health/Fitness','Personal Thoughts'];

const MemeItem = React.memo(({ item, index }) => {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  
  // Animation value for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Get userId directly from the item prop
  const userId = item.userId;
  
  // Check if this meme has a document file
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
        params: { userId: userId }
      });
      
      // Only set data if it exists in the response
      if (response.data) {
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        if (response.data.username) setUsername(response.data.username);
      }
    } catch (error) {
      console.log(`Profile data not found for user ${userId}:`, error);
      // Set fallback username if needed
      setUsername(`user_${userId ? userId.substring(0, 5) : 'unknown'}`);
    }
  };
  
  const openDocumentFile = useCallback(() => {
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
  }, [item.docFileUrl]);

  return (
    <View style={styles.memeContainer}>
      <Image source={{ uri: item.fileUrl }} style={styles.meme} resizeMode="contain" />
      
      {/* Gradient overlay at the bottom for better text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradientOverlay}
      />
      
      {/* Description container with username */}
      <View style={styles.descriptionContainer}>
        {username && <Text style={styles.userUsername}>@{username}</Text>}
        <Text style={styles.description}>{item.description}</Text>
      </View>
      
      {/* Right side icons container */}
      <View style={styles.rightIconsContainer}>
        {/* Profile picture */}
        <TouchableOpacity>
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

const MemesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [memes, setMemes] = useState([]);
  const [screenFocused, setScreenFocused] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMemes(selectedCategory);
  }, [selectedCategory]);

  const fetchMemes = async (category) => {
    try {
      const response = await axios.get(`http://192.168.159.183:4000/memes?category=${category}`);
      console.log('Memes fetched:', response.data);
      setMemes(response.data);
    } catch (error) {
      console.error('Error fetching memes:', error);
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
    if (category === selectedCategory) return;
    
    setSelectedCategory(category);
    // Scroll back to top when changing category
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedCategory]);

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

  const keyExtractor = useCallback((_, index) => `meme-${index}`, []);
  const categoryKeyExtractor = useCallback((item) => `category-${item}`, []);

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
        data={memes}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => <MemeItem item={item} index={index} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
        windowSize={5}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
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
    paddingHorizontal: 10
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
  memeContainer: { 
    height: height,
    width: width,
    position: 'relative',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  meme: { 
    width: '100%', 
    height: '100%' 
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
  description: { 
    color: '#ffffff', 
    fontSize: 16,
    marginTop: 5,
    lineHeight: 22,
  },
  userUsername: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rightIconsContainer: {
    position: 'absolute',
    right: 10,
    bottom: 200,
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
    backgroundColor: 'rgba(16, 16, 17, 0.9)',
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
    borderColor: 'white',
    elevation: 9,
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
    backgroundColor: 'rgba(221, 228, 235, 0.3)',
  },
});

export default MemesScreen;