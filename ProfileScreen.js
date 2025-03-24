import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const ProfileScreen = () => {
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
 
  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
    }, [route.params?.refreshProfile])
  );

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      console.log(userId);
      const response = await axios.get(`http://192.168.159.183:4000/profileget`, {
        params: { userId: userId }
      });
      
      // Only set values if they exist in the response data
      if (response.data) {
        if (response.data.name) setName(response.data.name);
        if (response.data.bio) setBio(response.data.bio);
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        
        // If socialLinks exist in the response, set them
        if (response.data.socialLinks) {
          setSocialLinks(response.data.socialLinks);
        }

        // Get registration timestamp and account age
        if (response.data.registeredAt) {
          setRegisteredAt(response.data.registeredAt);
          
          // Use the accountAgeDays from the backend if available
          if (response.data.accountAgeDays !== undefined) {
            setAccountAgeDays(response.data.accountAgeDays);
          } else {
            // Calculate only as fallback
            const registrationDate = new Date(response.data.registeredAt);
            const currentDate = new Date();
            const differenceInTime = currentDate.getTime() - registrationDate.getTime();
            const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
            
            setAccountAgeDays(differenceInDays);
          }
        }
      }
      
      console.log(profilePic);
    } catch (error) {
      console.log('No profile data found for this user yet.');
      // Keep default values (empty strings and null for profilePic)
      // No need to show error to the user - they'll just see the default UI
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings', {
      userId: userId,
      username: username,
      initialName: name,
      initialBio: bio,
      initialProfilePic: profilePic,
      initialSocialLinks: socialLinks
    });
  };

  const navigateToFeed = () => {
    navigation.navigate('Feed',{
      userId: userId,
    });
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
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Feed Button - Added at top left */}
          <TouchableOpacity style={styles.feedButton} onPress={navigateToFeed} >
            <Ionicons name="image" size={24} color="#000000" />
          </TouchableOpacity>
          
          {/* Settings Button */}
          <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
            <Ionicons name="settings" size={24} color="#000000" />
          </TouchableOpacity>
          
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
                Our relation is started {accountAgeDays} {accountAgeDays === 1 ? 'day' : 'days'} back
              </Text>
            </View>
          )}
          
          {/* Name below profile picture */}
          {name ? (
            <Text style={styles.name}>{name}</Text>
          ) : (
            <Text style={styles.noProfileText}>Add your name</Text>
          )}
          
          {/* Bio below name */}
          {bio ? (
            <Text style={styles.bio}>{bio}</Text>
          ) : (
            <Text style={styles.noProfileText}>Add a bio to tell people about yourself</Text>
          )}
          
          {/* Social Links Section */}
          {socialLinks && socialLinks.length > 0 ? (
            <View style={styles.socialLinksContainer}>
              {socialLinks.map((link, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.socialLink}
                  onPress={() => {
                    // In a real app, you would open the URL here
                    Alert.alert("Opening Link", `Opening ${link.url}`);
                  }}
                >
                  <Ionicons name={getIconName(link.platform)} size={22} color="#000000" />
                  <Text style={styles.socialLinkText}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addSocialButton}
              onPress={navigateToSettings}
            >
              <Ionicons name="add-circle-outline" size={20} color="#000000" />
              <Text style={styles.addSocialText}>Add social links</Text>
            </TouchableOpacity>
          )}
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
  feedButton: {
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
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 20,
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
    marginTop: 120,
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
  addSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 5 },
    elevation: 5,
  },
  addSocialText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 5,
  },
});

export default ProfileScreen;