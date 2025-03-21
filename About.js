import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>
      
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            {/* Replaced with a placeholder icon instead of an image */}
            <View style={styles.logoPlaceholder}>
              <Ionicons name="apps" size={60} color="#007AFF" />
            </View>
            <Text style={styles.appName}>Our Application</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            We are dedicated to creating intuitive and powerful tools that help people connect, create, and accomplish their goals. 
            Our team is passionate about delivering exceptional user experiences and innovative solutions to everyday challenges.
          </Text>
          
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.paragraph}>
            Founded in 2023, our company began with a simple idea: to build technology that makes life better. 
            Since then, we've grown into a team of dedicated professionals working together to bring you the best possible products.
            Our journey is just beginning, and we're excited to have you along for the ride.
          </Text>
          
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.paragraph}>
            Our diverse team brings together expertise in design, development, and user experience. 
            We believe in collaboration, innovation, and putting users first in everything we do.
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#555" />
            <Text style={styles.contactText}>support@example.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#555" />
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.contactText}>123 App Street, San Francisco, CA 94107</Text>
          </View>
          
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={24} color="#C13584" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('TermsAndConditions')}
            >
              <Text style={styles.buttonText}>Terms and Conditions</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <Text style={styles.secondaryButtonText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
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
    fontWeight: '600',
    marginLeft: 15,
  },
  container: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#444',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  socialButton: {
    marginHorizontal: 12,
    padding: 10,
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default AboutScreen;