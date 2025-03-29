import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, Alert, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

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
      const response = await axios.get(`http://192.168.132.183:4000/profileget`, {
        params: { userId: userId }
      });
      
      if (response.data) {
        if (response.data.name) setName(response.data.name);
        if (response.data.bio) setBio(response.data.bio);
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        
        if (response.data.socialLinks) {
          setSocialLinks(response.data.socialLinks);
        }

        if (response.data.registeredAt) {
          setRegisteredAt(response.data.registeredAt);
          
          if (response.data.accountAgeDays !== undefined) {
            setAccountAgeDays(response.data.accountAgeDays);
          } else {
            const registrationDate = new Date(response.data.registeredAt);
            const currentDate = new Date();
            const differenceInTime = currentDate.getTime() - registrationDate.getTime();
            const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
            
            setAccountAgeDays(differenceInDays);
          }
        }
      }
      
    } catch (error) {
      console.log('No profile data found for this user yet.');
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

  const getIconColor = (platform) => {
    const platform_lower = platform.toLowerCase();
    if (platform_lower.includes('youtube')) return '#FF0000';
    if (platform_lower.includes('twitter') || platform_lower.includes('x')) return '#1DA1F2';
    if (platform_lower.includes('instagram')) return '#E1306C';
    if (platform_lower.includes('facebook')) return '#4267B2';
    if (platform_lower.includes('linkedin')) return '#0077B5';
    if (platform_lower.includes('github')) return '#6e5494';
    if (platform_lower.includes('tiktok')) return '#69C9D0';
    return '#FFFFFF';
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      
      {/* Wellkin Header */}
      <View style={styles.wellkinHeader}>
        <Text style={styles.wellkinTitle}>Wellkin</Text>
        <View style={styles.headerLeftIcon}>
          <TouchableOpacity onPress={navigateToFeed}>
            <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRightIcon}>
          <TouchableOpacity onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Absolutely Positioned Profile Image */}
      <View style={styles.absoluteProfileImageContainer}>
        {profilePic ? (
          <Image 
            source={{ uri: profilePic }} 
            style={styles.absoluteProfileImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.absoluteProfileImage, styles.placeholderImage]}>
            <Ionicons name="person" size={80} color="#FFFFFF" />
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer to push content below fixed profile image */}
        <View style={styles.scrollContentSpacer} />
        
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          {name ? (
            <Text style={styles.name}>{name}</Text>
          ) : (
            <Text style={styles.noInfoText}>Add your name</Text>
          )}
          <Text style={styles.username}>@{username}</Text>
          
          {accountAgeDays !== null && (
            <View style={styles.accountAgeContainer}>
              <Ionicons name="time-outline" size={16} color="#FFFFFF" />
              <Text style={styles.accountAgeText}>
                {accountAgeDays} {accountAgeDays === 1 ? 'day' : 'days'} with us
              </Text>
            </View>
          )}
        </View>
        
        {/* Rest of the content remains the same */}
        {/* Bio section */}
        <View style={styles.bioContainer}>
          {bio ? (
            <Text style={styles.bio}>{bio}</Text>
          ) : (
            <Text style={styles.noInfoText}>Add a bio to tell people about yourself</Text>
          )}
        </View>
        
        {/* Edit Profile Button */}
        <TouchableOpacity onPress={navigateToSettings} style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
        
        {/* Social Links Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="link-outline" size={22} color="#FFFFFF" />
          <Text style={styles.sectionTitle}>Social Links</Text>
        </View>
        
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
                <Ionicons name={getIconName(link.platform)} size={20} color={getIconColor(link.platform)} />
                <Text style={styles.socialLinkText}>{link.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addSocialButton}
            onPress={navigateToSettings}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.addSocialText}>Add social links</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  wellkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
    zIndex: 10,
  },
  headerLeftIcon: {
    width: 50,  
    alignItems: 'flex-start',
    left: 100,
  },
  headerRightIcon: {
    width: 50,  
    alignItems: 'flex-end',
  },
  wellkinTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  absoluteProfileImageContainer: {
    position: 'absolute',
    top: 65, // Adjust this value to position the image correctly
    width: width,
    height: height * 0.5,
    zIndex: 5,
    paddingHorizontal: 12,
    paddingVertical:10,
    borderRadius:28,

  },
  absoluteProfileImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:8,
  },
  // Spacer to push content below fixed profile image
  scrollContentSpacer: {
    height: height * 0.5, // Same height as the profile image
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#2C2C2E',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 10,
  },
  accountAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 6,
  },
  accountAgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  bioContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bio: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  noInfoText: {
    fontSize: 15,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  editProfileButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    marginBottom: 28,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  socialLinksContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 28,
    justifyContent: 'center',
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    margin: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  socialLinkText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  addSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginBottom: 28,
  },
  addSocialText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  footerSpace: {
    height: 20,
  }
});

export default ProfileScreen;