import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsAndConditionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms and Conditions</Text>
      </View>
      
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.lastUpdated}>Last Updated: March 19, 2025</Text>
          
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to our application. These Terms and Conditions govern your use of our application and provide
            information about our Service, outlined below. When you use our Service, you agree to these terms.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using our application, you confirm that you accept these Terms and Conditions
            and that you agree to comply with them. If you do not agree to these terms, you must not use our application.
          </Text>
          
          <Text style={styles.sectionTitle}>3. Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Our Privacy Policy describes how we handle the information you provide to us when you use our Service.
            You understand that through your use of the Service, you consent to the collection and use of this information.
          </Text>
          
          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.paragraph}>
            You are responsible for the content you post through our Service. Content must comply with our community guidelines
            and must not violate others' rights or applicable laws.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Service Changes and Availability</Text>
          <Text style={styles.paragraph}>
            We may change our Service and policies, and we may need to terminate our Service. We are not committed to storing or keeping
            your content or other information. You agree that we have no obligation to store, maintain or provide you a copy of any content
            that you or others provide, except to the extent required by applicable law.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the Service.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction in which the company is incorporated, without regard to its conflict of law principles.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms and Conditions at any time. If we make material changes to these Terms, we will notify you by email or through our Service. Your continued use of the Service after such modifications will constitute your acknowledgment of the modified Terms and agreement to abide and be bound by the modified Terms.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us at support@example.com.
          </Text>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.buttonText}>Back to Home</Text>
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
  lastUpdated: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 15,
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default TermsAndConditionsScreen;