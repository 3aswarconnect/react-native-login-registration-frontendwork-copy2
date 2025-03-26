import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions, Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { height, width } = Dimensions.get('window');
const categories = ['All','Entertainment','Kids Corner','Food/cooking','News','Gaming','Motivation/Self Growth','Travel/Nature','Tech/Education', 'Health/Fitness','Personal Thoughts'];

const formatTimestamp = (timestampString) => {
  const date = new Date(timestampString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const monthName = months[date.getMonth()];
  const dayName = days[date.getDay()];
  const dayOfMonth = date.getDate(); // Added this line to get the day of the month
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return ` • ${monthName} ${dayOfMonth}, ${year}, ${dayName}  ${formattedHours}:${formattedMinutes} ${ampm}`;
};

const MemeItem = React.memo(({ item, index }) => {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  
  const userId = item.userId;
  const hasDocFile = !!item.docFileUrl;
  
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);
  
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`http://192.168.234.183:4000/profileget`, {
        params: { userId: userId }
      });
      
      if (response.data) {
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        if (response.data.username) setUsername(response.data.username);
      }
    } catch (error) {
      console.log(`Profile data not found for user ${userId}:`, error);
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
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {profilePic ? (
            <Image 
              source={{ uri: profilePic }} 
              style={styles.profilePic} 
            />
          ) : (
            <View style={styles.defaultProfilePic}>
              <Text style={styles.defaultProfileText}>
                {username ? username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.username}>@{username}</Text>
           
          </View>
        </View>
       
      </View>

      <Image 
        source={{ uri: item.fileUrl }} 
        style={styles.mainImage} 
        resizeMode="cover" 
      />

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.dateText}>
            {item.timestamp ? formatTimestamp(item.timestamp) : ''}
          </Text>
        </View>
        {hasDocFile && (
          <TouchableOpacity 
            style={styles.docButton} 
            onPress={openDocumentFile}
          >
            <FontAwesome name="file-pdf-o" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.attendeeSection}>
        <View style={styles.attendeeIcons}>
          <Image 
            source={{ uri: 'https://example.com/placeholder1.jpg' }} 
            style={styles.attendeeIcon} 
          />
          <Image 
            source={{ uri: 'https://example.com/placeholder2.jpg' }} 
            style={[styles.attendeeIcon, styles.attendeeIconOverlap]} 
          />
          <Image 
            source={{ uri: 'https://example.com/placeholder3.jpg' }} 
            style={[styles.attendeeIcon, styles.attendeeIconOverlap]} 
          />
        </View>
        
      </View>
    </View>
  );
});
const MemesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [memes, setMemes] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMemes(selectedCategory);
  }, [selectedCategory]);

  const fetchMemes = async (category) => {
    try {
      const response = await axios.get(`http://192.168.234.183:4000/memes?category=${category}`);
      console.log('Memes fetched:', response.data);
      setMemes(response.data);
    } catch (error) {
      console.error('Error fetching memes:', error);
    }
  };

  const handleCategorySelect = useCallback((category) => {
    if (category === selectedCategory) return;
    
    setSelectedCategory(category);
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black' 
  },
  filterContainer: { 
    paddingTop: 50, 
    paddingHorizontal: 10,
    backgroundColor: 'black'
  },
  categoryListContent: {
    paddingBottom: 10,
  },
  categoryButton: { 
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 15,
    backgroundColor: 'transparent',
  },
  selectedCategoryButton: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  categoryText: { 
    color: '#666',
    fontWeight: '400',
    fontSize: 16,
  },
  selectedCategoryText: {
    color: 'black',
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 10,
  },
  cardContainer: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  defaultProfilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  defaultProfileText: {
    fontWeight: 'bold',
    color: '#666',
  },
  userInfo: {
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventType: {
    color: '#666',
    fontSize: 14,
  },
  moreIcon: {
    padding: 5,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  footerLeft: {
    flex: 1,
    marginRight: 10,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  docButton: {
    backgroundColor: 'black',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  attendeeIcons: {
    flexDirection: 'row',
  },
  attendeeIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: 'white',
  },
  attendeeIconOverlap: {
    marginLeft: -15,
  },
  interestedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  interestedButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MemesScreen;