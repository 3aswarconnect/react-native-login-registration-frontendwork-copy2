import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView>
        <View style={styles.container}>
          {/* Section: Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={navigateToEditProfile}
            >
              <View style={styles.settingTextContainer}>
                <Ionicons name="person-circle-outline" size={24} color="#555" />
                <Text style={styles.settingText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
          
          {/* Section: App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Ionicons name="cellular-outline" size={24} color="#555" />
                <Text style={styles.settingText}>Use Less Data</Text>
              </View>
              <Switch
                trackColor={{ false: "#ddd", true: "#4a90e2" }}
                thumbColor="#fff"
                ios_backgroundColor="#ddd"
                onValueChange={toggleUseLessData}
                value={useLessData}
              />
            </View>
          </View>
          
          {/* Section: Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={navigateToTermsAndConditions}
            >
              <View style={styles.settingTextContainer}>
                <Ionicons name="document-text-outline" size={24} color="#555" />
                <Text style={styles.settingText}>Terms and Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={navigateToAbout}
            >
              <View style={styles.settingTextContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#555" />
                <Text style={styles.settingText}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
          
          {/* Log Out Button */}
         {/* Log Out Button */}
<TouchableOpacity style={styles.logoutButton} onPress={logoutFunction}>
  <Text style={styles.logoutButtonText}>Log Out</Text>
</TouchableOpacity>
          
          {/* App Version */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#333',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
});

export default SettingsScreen;