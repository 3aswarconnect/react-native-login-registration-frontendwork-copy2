import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Linking, 
  Alert,
  Modal,
  Animated,
  PanResponder,
  TouchableWithoutFeedback 
} from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const { height, width } = Dimensions.get('window');
const categories = ['All','Entertainment','Kids Corner','Food/cooking','News','Gaming','Motivation/Self Growth','Travel/Nature','Tech/Education', 'Health/Fitness','Personal Thoughts'];

const formatTimestamp = (timestampString) => {
  const date = new Date(timestampString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const monthName = months[date.getMonth()];
  const dayName = days[date.getDay()];
  const dayOfMonth = date.getDate();
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
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  
  // Animated values for scaling, translation, and pinch zoom
  const scaleValue = useRef(new Animated.Value(1)).current;
  const translateXValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(0)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  
  const userId = item.userId;
  const hasDocFile = !!item.docFileUrl;
  
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);
  
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`http://192.168.132.183:4000/profileget`, {
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

  // Pinch gesture handler
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // When pinch gesture ends, update last scale and reset pinch scale
      lastScale.current *= event.nativeEvent.scale;
      pinchScale.setValue(1);
      
      // Limit zoom
      const newScale = Math.max(1, Math.min(lastScale.current, 3));
      lastScale.current = newScale;
      
      Animated.spring(scaleValue, {
        toValue: newScale,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      }).start();
    }
  };

  // Image press and animation handlers
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 1.05,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const openImageModal = () => {
    setIsImageModalVisible(true);
  };

  // Reset zoom when modal closes
  const closeImageModal = () => {
    setIsImageModalVisible(false);
    lastScale.current = 1;
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
    
    // Reset translations
    Animated.spring(translateXValue, { toValue: 0, useNativeDriver: true }).start();
    Animated.spring(translateYValue, { toValue: 0, useNativeDriver: true }).start();
  };

  // Pan responder for modal image interaction
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => lastScale.current > 1,
      onPanResponderMove: Animated.event(
        [
          null,
          { 
            dx: translateXValue,
            dy: translateYValue 
          }
        ],
        { useNativeDriver: true }
      ),
      onPanResponderRelease: () => {
        Animated.spring(translateXValue, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true
        }).start();
        Animated.spring(translateYValue, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true
        }).start();
      }
    })
  ).current;

  return (
    <View style={styles.cardContainer}>
      {/* Main Image with Press Animation */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={openImageModal}
      >
        <Animated.Image 
          source={{ uri: item.fileUrl }} 
          style={[
            styles.mainImage, 
            { 
              transform: [
                { scale: scaleValue }
              ] 
            }
          ]} 
          resizeMode="cover" 
        />
      </TouchableOpacity>

      {/* Full Screen Modal for Image with Pinch Zoom */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <TouchableWithoutFeedback onPress={closeImageModal}>
          <View style={styles.modalContainer}>
            <PinchGestureHandler
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchHandlerStateChange}
            >
              <Animated.Image
                {...panResponder.panHandlers}
                source={{ uri: item.fileUrl }}
                style={[
                  styles.fullScreenImage,
                  { 
                    transform: [
                      { scale: Animated.multiply(scaleValue, pinchScale) },
                      { translateX: translateXValue },
                      { translateY: translateYValue }
                    ] 
                  }
                ]}
                resizeMode="contain"
              />
            </PinchGestureHandler>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
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
      const response = await axios.get(`http://192.168.132.183:4000/memes?category=${category}`);
      
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
    backgroundColor: '#1D1D1D' 
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
    backgroundColor: 'transparent',
  },
  selectedCategoryButton: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  categoryText: { 
    color: '#666',
    fontWeight: '500',
    fontSize: 16,
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 10,
  },
  cardContainer: {
    backgroundColor: 'black',
    marginBottom: 25,
    borderRadius: 4,
    marginHorizontal: 14,
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
    padding: 5,
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
    color:'white',
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
    color:'white',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

export default MemesScreen;