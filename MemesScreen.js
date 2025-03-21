import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions, Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const { height, width } = Dimensions.get('window');
const categories = ['All', 'Entertainment', 'Education', 'Technology', 'Travel', 'Food', 'Fitness', 'Music', 'Comedy', 'Motivation', 'Fashion', 'News', 'Happy', 'Sad', 'Angry'];

const MemeItem = React.memo(({ item, index }) => {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  
  // Get userId directly from the item prop
  const userId = item.userId;
  
  // Check if this meme has a document file
  const hasDocFile = !!item.docFileUrl;

  // Log for debugging
  console.log(`Meme ${index} userId:`, userId);
  console.log(`Meme ${index} has doc file:`, hasDocFile);
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

  return (
    <View style={styles.memeContainer}>
      <Image source={{ uri: item.fileUrl }} style={styles.meme} resizeMode="contain" />
      
      {/* Description container with username */}
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
        
        {/* Document file icon - only shown if docFileUrl exists */}
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
    setSelectedCategory(category);
    // Scroll back to top when changing category
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
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
        data={memes}
        keyExtractor={(item, index) => index.toString()}
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
  memeContainer: { 
    height: height,
    width: width,
    position: 'relative',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  meme: { 
    width: '100%', 
    height: '80%' 
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

export default MemesScreen;