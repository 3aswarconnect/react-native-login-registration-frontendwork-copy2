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
          {/* Settings Button */}
          <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
            <Ionicons name="settings" size={24} color="#E0E0E0" />
          </TouchableOpacity>
          
          {/* Username at top */}
          <Text style={styles.username}>@{username}</Text>
          
          {/* Profile Picture below username */}
          <View style={styles.profileImageContainer}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Ionicons name="person" size={50} color="#697565" />
              </View>
            )}
          </View>
          
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
                  <Ionicons name={getIconName(link.platform)} size={22} color="#E0E0E0" />
                  <Text style={styles.socialLinkText}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addSocialButton}
              onPress={navigateToSettings}
            >
              <Ionicons name="add-circle-outline" size={20} color="#E0E0E0" />
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
    backgroundColor: '#3C3D37',
  },
  scrollView: {
    backgroundColor: '#3C3D37',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: '#3C3D37',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    padding: 10,
    zIndex: 10,
    backgroundColor: '#181C14',
    borderRadius: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginTop: 120,
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#697565',
  },
  placeholderImage: {
    backgroundColor: '#2A2B26',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  noProfileText: {
    fontSize: 16,
    color: '#888',
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
    backgroundColor: '#181C14',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#697565',
  },
  socialLinkText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginLeft: 5,
  },
  addSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C14',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#697565',
  },
  addSocialText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginLeft: 5,
  },
});

export default ProfileScreen;