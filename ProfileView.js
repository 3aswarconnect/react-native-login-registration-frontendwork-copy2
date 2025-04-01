import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, Alert, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { VideoView, createVideoPlayer } from 'expo-video';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = (width - 40) / numColumns;

// VideoItem component for thumbnails in the grid
const VideoItem = ({ videoUri, style }) => {
  const [playerRef, setPlayerRef] = useState(null);
  
  useEffect(() => {
    // Create the player when component mounts
    try {
      const player = createVideoPlayer(videoUri);
      player.pause();
      setPlayerRef(player);
    } catch (error) {
      console.log(`Error creating video player:`, error);
    }
    
    // Clean up the player when component unmounts
    return () => {
      if (playerRef) {
        try {
          playerRef.release();
        } catch (error) {
          console.log(`Error releasing video player:`, error);
        }
      }
    };
  }, [videoUri]);
  
  if (!playerRef) {
    return (
      <View style={[style, { backgroundColor: '#1A1A1A' }]} />
    );
  }
  
  return (
    <VideoView
      player={playerRef}
      style={style}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

const ProfileView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const userId = route.params?.userId || '';
  const username = route.params?.username || '';
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredAt, setRegisteredAt] = useState(null);
  const [accountAgeDays, setAccountAgeDays] = useState(null);
  
  // Media feed states
  const [media, setMedia] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All','Entertainment','Kids Corner','Food/cooking','News','Gaming','Motivation/Self Growth','Travel/Nature','Tech/Education', 'Health/Fitness','Personal Thoughts']);
 
  useEffect(() => {
    fetchProfileData();
    fetchMedia();
  }, [userId]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching profile for userId: ${userId}`);
      const response = await axios.get(`http://192.168.217.183:4000/profileget`, {
        params: { userId: userId }
      });
      
      // Only set values if they exist in the response data
      if (response.data) {
        if (response.data.name) setName(response.data.name);
        if (response.data.bio) setBio(response.data.bio);
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        if (response.data.socialLinks) setSocialLinks(response.data.socialLinks);
        
        // Get registration timestamp and account age
        if (response.data.registeredAt) {
          setRegisteredAt(response.data.registeredAt);
          
          if (response.data.accountAgeDays !== undefined) {
            setAccountAgeDays(response.data.accountAgeDays);
          } else {
            // Calculate account age as fallback
            const registrationDate = new Date(response.data.registeredAt);
            const currentDate = new Date();
            const differenceInTime = currentDate.getTime() - registrationDate.getTime();
            const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
            
            setAccountAgeDays(differenceInDays);
          }
        }
      }
    } catch (error) {
      console.log('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setFeedLoading(true);
      setFeedError(null);
      
      console.log("Fetching media with params:", {
        userId: userId,
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      
      const response = await axios.get(`http://192.168.217.183:4000/getUserMedia`, {
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
        setFeedError("Received invalid data from server");
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
      
      let errorMessage = "Failed to load media";
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Check your network connection.";
      } else {
        console.error("Request error:", error.message);
        errorMessage = error.message;
      }
      
      setFeedError(errorMessage);
    } finally {
      setFeedLoading(false);
    }
  };

  const handleMediaPress = (item, index) => {
    // Navigate to full feed/reels view with the selected item
    navigation.navigate('Feed', {
      userId: userId,
      initialMediaIndex: index
    });
  };

  const renderMediaItem = ({ item, index }) => {
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
        <Text style={styles.mediaDescription} numberOfLines={1}>
          {item.description || "No description"}
        </Text>
      </TouchableOpacity>
    );
  };

  const getIconName = (platform) => {
    const platform_lower = platform.toLowerCase();
    if (platform_lower.includes('youtube')) return 'logo-youtube';
    if (platform_lower.includes('twitter') || platform_lower.includes('x')) return 'logo-twitter';
    if (platform_lower.includes('instagram')) return 'logo-instagram';
    if (platform_lower.includes('facebook')) return 'logo-facebook';
    if (platform_lower.includes('linkedin')) return 'logo-linkedin';
    if (platform_lower.includes('github')) return 'logo-github';
    if (platform_lower.includes('tiktok')) return 'logo-tiktok';
    return 'link-outline';
  };

  const goBack = () => {
    navigation.goBack();
  };

  const viewAllMedia = () => {
    navigation.navigate('Feed', { userId: userId });
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Back Button */}
          
          
          {/* Username at top */}
          <Text style={styles.username}>@{username}</Text>
          
          {/* Profile Picture below username */}
          <View style={styles.profileImageContainer}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Ionicons name="person" size={50} color="#000000" />
              </View>
            )}
          </View>
          
          {/* Registration info */}
          {accountAgeDays !== null && (
            <View style={styles.registrationInfo}>
              <Ionicons name="calendar" size={20} color="#000000" style={styles.calendarIcon} />
              <Text style={styles.registrationText}>
                Member for {accountAgeDays} {accountAgeDays === 1 ? 'day' : 'days'}
              </Text>
            </View>
          )}
          
          {/* Name below profile picture */}
          {name ? (
            <Text style={styles.name}>{name}</Text>
          ) : (
            <Text style={styles.noProfileText}>No name provided</Text>
          )}
          
          {/* Bio below name */}
          {bio ? (
            <Text style={styles.bio}>{bio}</Text>
          ) : (
            <Text style={styles.noProfileText}>No bio available</Text>
          )}
          
          {/* Social Links Section */}
          {socialLinks && socialLinks.length > 0 ? (
            <View style={styles.socialLinksContainer}>
              {socialLinks.map((link, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.socialLink}
                  onPress={() => {
                    Alert.alert("Opening Link", `Opening ${link.url}`);
                  }}
                >
                  <Ionicons name={getIconName(link.platform)} size={22} color="#000000" />
                  <Text style={styles.socialLinkText}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noLinksText}>No social links available</Text>
          )}
          
          {/* Media Feed Section */}
          <View style={styles.feedSection}>
            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Media Gallery</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={viewAllMedia}
              >
                <Text style={styles.viewAllButtonText}>View All</Text>
                <Ionicons name="arrow-forward" size={16} color="#000000" />
              </TouchableOpacity>
            </View>
            
            {/* Category Filter */}
            <View style={styles.categoryContainer}>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      selectedCategory === item && styles.selectedCategory
                    ]}
                    onPress={() => {
                      setSelectedCategory(item);
                      fetchMedia();
                    }}
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
            
            {/* Media Feed Content */}
            {feedLoading ? (
              <View style={styles.feedLoadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.feedLoadingText}>Loading media...</Text>
              </View>
            ) : feedError ? (
              <View style={styles.feedErrorContainer}>
                <Ionicons name="alert-circle" size={40} color="#FF3B30" />
                <Text style={styles.feedErrorText}>{feedError}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={fetchMedia}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : media.length === 0 ? (
              <View style={styles.emptyFeedContainer}>
                <Ionicons name="images-outline" size={40} color="#8E8E93" />
                <Text style={styles.emptyFeedText}>
                  {selectedCategory === 'All' 
                    ? 'No media available'
                    : `No ${selectedCategory} media available`}
                </Text>
              </View>
            ) : (
              <View style={styles.mediaGrid}>
                <FlatList
                  data={media.slice(0, 4)} // Show only the first 4 items
                  renderItem={renderMediaItem}
                  keyExtractor={(item) => item.fileId || item._id || String(Math.random())}
                  numColumns={numColumns}
                  scrollEnabled={false} // Disable scrolling since we're inside a ScrollView
                />
                
                {media.length > 4 && (
                  <TouchableOpacity 
                    style={styles.seeMoreButton}
                    onPress={viewAllMedia}
                  >
                    <View style={styles.seeMoreContainer}>
                      <Text style={styles.seeMoreText}>
                        See {media.length - 4} more
                      </Text>
                      <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    padding: 10,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 5 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 80,
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 5 },
    elevation: 5,
  },
  placeholderImage: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 5 },
    elevation: 5,
  },
  calendarIcon: {
    marginRight: 8,
  },
  registrationText: {
    fontSize: 14,
    color: '#000000',
    fontStyle: 'italic',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  noProfileText: {
    fontSize: 16,
    color: '#888888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 5 },
    elevation: 5,
  },
  socialLinkText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 5,
  },
  noLinksText: {
    fontSize: 16,
    color: '#888888',
    fontStyle: 'italic',
    marginBottom: 30,
  },
  
  // Feed Section Styles
  feedSection: {
    width: '100%',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#000000',
    marginRight: 5,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedCategory: {
    backgroundColor: '#000000',
  },
  categoryText: {
    color: '#000000',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  feedLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedLoadingText: {
    marginTop: 10,
    color: '#888888',
  },
  feedErrorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedErrorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyFeedContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFeedText: {
    color: '#8E8E93',
    marginTop: 10,
  },
  mediaGrid: {
    width: '100%',
  },
  mediaItem: {
    flex: 1,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  videoContainer: {
    position: 'relative',
  },
  mediaContent: {
    width: '100%',
    height: 150,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  mediaDescription: {
    padding: 8,
    fontSize: 12,
    color: '#333333',
  },
  seeMoreButton: {
    marginTop: 10,
    width: '100%',
  },
  seeMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
  },
  seeMoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 5,
  }
});

export default ProfileView;