import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#697565" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Section: Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={navigateToEditProfile}
            >
              <View style={styles.settingTextContainer}>
                <Ionicons name="person-circle-outline" size={24} color="#697565" />
                <Text style={styles.settingText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#697565" />
            </TouchableOpacity>
          </View>
          
          {/* Section: App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Ionicons name="cellular-outline" size={24} color="#697565" />
                <Text style={styles.settingText}>Use Less Data</Text>
              </View>
              <Switch
                trackColor={{ false: "#3C3D37", true: "#697565" }}
                thumbColor="#f5f5f5"
                ios_backgroundColor="#3C3D37"
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
                <Ionicons name="document-text-outline" size={24} color="#697565" />
                <Text style={styles.settingText}>Terms and Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#697565" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={navigateToAbout}
            >
              <View style={styles.settingTextContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#697565" />
                <Text style={styles.settingText}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#697565" />
            </TouchableOpacity>
          </View>
          
          {/* Log Out Button */}
          <TouchableOpacity style={styles.logoutButton}>
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
    backgroundColor: '#f5f5f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0d5',
    backgroundColor: '#f5f5f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#181C14',
  },
  scrollView: {
    backgroundColor: '#f5f5f0',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#181C14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#f5f5f0',
    backgroundColor: '#3C3D37',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0d5',
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
    color: '#181C14',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#697565',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#181C14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#3C3D37',
    fontSize: 14,
    marginBottom: 20,
  },
});

export default SettingsScreen;