import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ route, navigation }) => {
  const { userId, username, initialName, initialBio, initialProfilePic, initialSocialLinks } = route.params;
  const [useLessData, setUseLessData] = React.useState(false);

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile', {
      userId,
      username,
      initialName,
      initialBio,
      initialProfilePic,
      initialSocialLinks
    });
  };

  const toggleUseLessData = () => {
    setUseLessData(previousState => !previousState);
  };

  const navigateToTermsAndConditions = () => {
    navigation.navigate('TermsAndConditions');
  };

  const navigateToAbout = () => {
    navigation.navigate('About');
  };

  const logoutFunction = async () => {
    console.log("hello");
    try {
      // Clear the user data from AsyncStorage
      await AsyncStorage.removeItem('userData');
      console.log("User data cleared successfully");
      
      // Reset the entire navigation stack and go to Auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Failed to clear user data:', error);
      Alert.alert('Logout Failed', 'There was a problem logging out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
         
          
          {/* Main Settings List */}
          <View style={styles.settingsList}>
           
            
            
            
           
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={navigateToEditProfile}
            >
              <View style={styles.settingLeftContent}>
                <Ionicons name="person-outline" size={22} color="#ffffff" />
                <Text style={styles.settingText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
            
            
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeftContent}>
                <Ionicons name="information-circle-outline" size={22} color="#ffffff" />
                <Text style={styles.settingText}>Copyright Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={navigateToTermsAndConditions}
            >
              <View style={styles.settingLeftContent}>
                <Ionicons name="document-text-outline" size={22} color="#ffffff" />
                <Text style={styles.settingText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
            
            
            
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={navigateToAbout}
            >
              <View style={styles.settingLeftContent}>
                <Ionicons name="alert-circle-outline" size={22} color="#ffffff" />
                <Text style={styles.settingText}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
          </View>
          
          {/* Log Out Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={logoutFunction}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          {/* Keep UseLessData functionality but hidden */}
          <View style={{ display: 'none' }}>
            <Switch
              trackColor={{ false: "#ddd", true: "#4a90e2" }}
              thumbColor="#fff"
              ios_backgroundColor="#ddd"
              onValueChange={toggleUseLessData}
              value={useLessData}
            />
          </View>
          
          {/* Version indicator at bottom */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <View style={styles.bottomDivider} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1626', // Dark navy background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0F1626',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 20,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  premiumText: {
    color: '#FFFFFF',
    marginLeft: 14,
    fontSize: 14,
  },
  premiumBold: {
    fontWeight: 'bold',
  },
  settingsList: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  settingLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    color: '#FFFFFF',
    fontSize: 15,
    marginLeft: 16,
  },
  settingDetailText: {
    color: '#777777',
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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

export default SettingsScreen;