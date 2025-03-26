import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

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
      const response = await axios.get(`http://192.168.234.183:4000/profileget`, {
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
      
    } catch (error) {
      console.log('No profile data found for this user yet.');
      // Keep default values (empty strings and null for profilePic)
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
      <StatusBar barStyle="light-content" backgroundColor="#0F1626" />
      
      <LinearGradient
        colors={['#1A2639', '#0F1626']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={navigateToFeed}>
            <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Profile</Text>
          
          <TouchableOpacity style={styles.iconButton} onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Profile Picture with gradient border */}
          <View style={styles.profileImageOuterContainer}>
            <LinearGradient
              colors={['#3D5AFE', '#00E5FF']}
              style={styles.profileImageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileImageContainer}>
                {profilePic ? (
                  <Image source={{ uri: profilePic }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profileImage, styles.placeholderImage]}>
                    <Ionicons name="person" size={50} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
          
          {/* Name and Username */}
          <View style={styles.userInfoContainer}>
            {name ? (
              <Text style={styles.name}>{name}</Text>
            ) : (
              <Text style={styles.noInfoText}>Add your name</Text>
            )}
            <Text style={styles.username}>@{username}</Text>
            
            {/* Account Age with nicer design */}
            {accountAgeDays !== null && (
              <View style={styles.accountAgeContainer}>
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.accountAgeText}>
                  {accountAgeDays} {accountAgeDays === 1 ? 'day' : 'days'} with us
                </Text>
              </View>
            )}
          </View>
          
          {/* Bio section with subtle background */}
          <LinearGradient
            colors={['rgba(26, 38, 57, 0.8)', 'rgba(15, 22, 38, 0.8)']}
            style={styles.bioGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bioContainer}>
              {bio ? (
                <Text style={styles.bio}>{bio}</Text>
              ) : (
                <Text style={styles.noInfoText}>Add a bio to tell people about yourself</Text>
              )}
            </View>
          </LinearGradient>
          
          {/* Call-to-action buttons with gradient */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity onPress={navigateToSettings} activeOpacity={0.8}>
              <LinearGradient
                colors={['#3D5AFE', '#2979FF']}
                style={styles.editProfileButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareProfileButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['#1A2639', '#2A3649']}
                style={styles.shareGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Social Links Section with more polish */}
          <View style={styles.sectionDivider} />
          <View style={styles.sectionHeader}>
            <Ionicons name="link-outline" size={22} color="#3D5AFE" />
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
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(26, 38, 57, 0.9)', 'rgba(15, 22, 38, 0.9)']}
                    style={styles.socialLinkGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={getIconName(link.platform)} size={20} color={getIconColor(link.platform)} />
                    <Text style={styles.socialLinkText}>{link.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addSocialButton}
              onPress={navigateToSettings}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(26, 38, 57, 0.9)', 'rgba(15, 22, 38, 0.9)']}
                style={styles.addSocialGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add-circle-outline" size={18} color="#3D5AFE" />
                <Text style={styles.addSocialText}>Add social links</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {/* Footer space */}
          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1626',
  },
  headerGradient: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 54, 73, 0.8)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 38, 57, 0.6)',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#0F1626',
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  profileImageOuterContainer: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  profileImageGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    backgroundColor: '#1A2639',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  username: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 10,
  },
  accountAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 90, 254, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(61, 90, 254, 0.3)',
  },
  accountAgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  bioGradient: {
    width: '100%',
    borderRadius: 16,
    padding: 1,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(42, 54, 73, 0.8)',
  },
  bioContainer: {
    width: '100%',
    padding: 18,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 22, 38, 0.5)',
  },
  bio: {
    fontSize: 15,
    color: '#EEEEEE',
    textAlign: 'center',
    lineHeight: 22,
  },
  noInfoText: {
    fontSize: 15,
    color: '#888888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ctaContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  editProfileButton: {
    flex: 1,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#3D5AFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  shareProfileButton: {
    borderRadius: 28,
    overflow: 'hidden',
    width: 48,
    height: 48,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  shareGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D5AFE',
    borderRadius: 28,
  },
  sectionDivider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(42, 54, 73, 0.8)',
    marginBottom: 20,
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
  },
  socialLink: {
    margin: 6,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  socialLinkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(42, 54, 73, 0.8)',
    borderRadius: 24,
  },
  socialLinkText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  addSocialButton: {
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addSocialGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(42, 54, 73, 0.8)',
    borderRadius: 24,
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