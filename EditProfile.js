import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const EditProfile = ({ route, navigation }) => {
  const { userId, username, initialName, initialBio, initialProfilePic, initialSocialLinks, initialEmail } = route.params;
  const [name, setName] = useState(initialName || '');
  const [bio, setBio] = useState(initialBio || '');
  const [email, setEmail] = useState(initialEmail || 'example@gmail.com');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks || []);
  const [newSocialLink, setNewSocialLink] = useState({ name: '', url: '', platform: '' });
  
  const pickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: ['image/*'] });
    if (!result.canceled) setFile(result.assets[0]);
  };

  const uploadToServer = async () => {
    if (!file && !name && !bio && !email && socialLinks.length === 0) {
      return Alert.alert('Error', 'Please update at least one field');
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('name', name);
    formData.append('bio', bio);
    formData.append('email', email);
    formData.append('socialLinks', JSON.stringify(socialLinks));
    
    if (file) {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });
    }
    
    try {
      const response = await axios.post('http://192.168.132.183:4000/profile-send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', response.data.message);
      // Navigate back to profile screen with updated data
      navigation.navigate('Profile', {
        refreshProfile: true,
        userId: userId,
        username: username
      });
    } catch (error) {
      Alert.alert('Error', 'Upload failed: ' + (error.response?.data.message || 'Something went wrong'));
    } finally {
      setUploading(false);
    }
  };

  const addSocialLink = () => {
    // Validate inputs
    if (!newSocialLink.name.trim() || !newSocialLink.url.trim() || !newSocialLink.platform.trim()) {
      Alert.alert("Error", "Please fill all social link fields");
      return;
    }

    // Check if we already have 5 links
    if (socialLinks.length >= 5) {
      Alert.alert("Limit Reached", "You can add up to 5 social links");
      return;
    }

    // Check if URL is valid
    try {
      new URL(newSocialLink.url);
    } catch (e) {
      Alert.alert("Invalid URL", "Please enter a valid URL (including http:// or https://)");
      return;
    }

    // Add the new link
    setSocialLinks([...socialLinks, {...newSocialLink}]);
    // Clear the form
    setNewSocialLink({ name: '', url: '', platform: '' });
  };

  const removeSocialLink = (index) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
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
          {/* Header with back button */}
        
          
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TextInput 
              placeholder="Enter name" 
              value={name} 
              onChangeText={setName} 
              style={styles.input} 
              placeholderTextColor="#777777" 
            />
            <TextInput 
              placeholder="Enter Email" 
              value={email} 
              onChangeText={setEmail} 
              style={styles.input} 
              placeholderTextColor="#777777"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput 
              placeholder="Enter Bio" 
              value={bio} 
              onChangeText={setBio} 
              style={styles.bioInput}
              multiline
              placeholderTextColor="#777777"
            />
            
            <Text style={styles.sectionTitle}>Change Profile Photo</Text>
            <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
              <Text style={styles.fileButtonText}>Choose Profile Photo</Text>
            </TouchableOpacity>
            {file && <Text style={styles.fileText}>Selected: {file.name}</Text>}
            
            <Text style={styles.sectionTitle}>Social Links (Max 5)</Text>
            <View style={styles.socialLinkForm}>
              <TextInput 
                placeholder="Display Name (e.g. Follow me on YouTube)" 
                value={newSocialLink.name} 
                onChangeText={(text) => setNewSocialLink({...newSocialLink, name: text})} 
                style={styles.input}
                placeholderTextColor="#777777" 
              />
              <TextInput 
                placeholder="URL (e.g. https://youtube.com/c/mychannel)" 
                value={newSocialLink.url} 
                onChangeText={(text) => setNewSocialLink({...newSocialLink, url: text})} 
                style={styles.input}
                placeholderTextColor="#777777" 
              />
              <TextInput 
                placeholder="Platform (e.g. YouTube, Twitter, Instagram)" 
                value={newSocialLink.platform} 
                onChangeText={(text) => setNewSocialLink({...newSocialLink, platform: text})} 
                style={styles.input}
                placeholderTextColor="#777777" 
              />
              <TouchableOpacity 
                style={styles.addLinkButton} 
                onPress={addSocialLink}
                disabled={socialLinks.length >= 5}
              >
                <Text style={styles.addLinkButtonText}>Add Link</Text>
              </TouchableOpacity>
            </View>
            
            {/* Display existing social links with delete button */}
            {socialLinks.length > 0 && (
              <View style={styles.currentLinksContainer}>
                <Text style={styles.currentLinksTitle}>Current Links:</Text>
                {socialLinks.map((link, index) => (
                  <View key={index} style={styles.currentLinkItem}>
                    <View style={styles.currentLinkInfo}>
                      <Ionicons name={getIconName(link.platform)} size={20} color="#FFFFFF" />
                      <Text style={styles.currentLinkText} numberOfLines={1} ellipsizeMode="tail">
                        {link.name} - {link.url}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeLinkButton} 
                      onPress={() => removeSocialLink(index)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity style={styles.uploadButton} onPress={uploadToServer} disabled={uploading}>
              <Text style={styles.uploadButtonText}>{uploading ? 'Updating Profile...' : 'Update Profile'}</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <View style={styles.bottomDivider} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1626', // Dark navy background to match SettingsScreen
  },
  scrollView: {
    backgroundColor: '#0F1626',
  },
  container: {
    flex: 1,
    paddingBottom: 30,
    backgroundColor: '#0F1626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0F1626',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#FFFFFF',
  },
  formContainer: {
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#1E293B', // Darker input background
    width: '100%',
    fontSize: 15,
    color: '#FFFFFF',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#1E293B',
    width: '100%',
    fontSize: 15,
    height: 100,
    textAlignVertical: 'top',
    color: '#FFFFFF',
  },
  fileButton: {
    padding: 14,
    backgroundColor: '#4A90E2', // Blue button color
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  fileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  fileText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  socialLinkForm: {
    width: '100%',
    marginBottom: 15,
  },
  addLinkButton: {
    padding: 14,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addLinkButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  currentLinksContainer: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#1E293B',
  },
  currentLinksTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
  },
  currentLinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  currentLinkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currentLinkText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  removeLinkButton: {
    padding: 5,
  },
  uploadButton: {
    padding: 14,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    color: '#777777',
    fontSize: 14,
    marginBottom: 10,
  },
  bottomDivider: {
    width: 40,
    height: 5,
    backgroundColor: '#333333',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default EditProfile;