import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { TextInput } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

// Custom Alert Component
const CustomAlert = ({ visible, title, message, onDismiss }) => {
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      animation.setValue(0);
    }
  }, [visible]);
  
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.alertContainer,
            { transform: [{ translateY }] }
          ]}
        >
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity 
            style={styles.alertButton} 
            onPress={onDismiss}
          >
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const AuthScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  
  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    const checkStoredLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const { userId, username } = JSON.parse(userData);
          navigation.replace("Homes", { userId, username });
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    checkStoredLogin();
  }, []);

  const storeUserData = async (data) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      showAlert("Error", "Please enter email and password.");
      return;
    }
    try {
      const response = await axios.post("http://192.168.217.183:4000/signin", {
        identifier: email,
        password,
      });
      const { userId, username, token } = response.data;

      await storeUserData({ userId, username, token });

      showAlert("Success", response.data.message);
      setTimeout(() => {
        setAlertVisible(false);
        navigation.replace("Homes", { userId, username });
      }, 1500);
    } catch (error) {
      showAlert("Error", error.response?.data.message || "Something went wrong");
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      showAlert("Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post("http://192.168.217.183:4000/register", {
        username: email.split('@')[0], // Simple username from email
        email: email,
        password,
      });
      const { userId, username: userName, token } = response.data;

      await storeUserData({ userId, username: userName, token });

      showAlert("Success", "Account created successfully!");
      setTimeout(() => {
        setAlertVisible(false);
        navigation.replace("Homes", { userId, username: userName });
      }, 1500);
    } catch (error) {
      showAlert("Error", error.response?.data.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0C15A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#333333" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <MaterialCommunityIcons name="triangle" size={30} color="#FFFFFF" style={styles.logoIcon} />
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, !isSignup && styles.activeTab]}
              onPress={() => setIsSignup(false)}
            >
              <Text style={[styles.tabText, !isSignup && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, isSignup && styles.activeTab]}
              onPress={() => setIsSignup(true)}
            >
              <Text style={[styles.tabText, isSignup && styles.activeTabText]}>Signup</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputsContainer}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#888888" style={styles.inputIcon} />
              <TextInput
                placeholder="Email ID"
                placeholderTextColor="#888888"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF' } }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#888888" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#888888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF' } }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} color="#888888" onPress={() => setPasswordVisible(!passwordVisible)} />}
              />
            </View>
            
            {isSignup && (
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#888888" style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#888888"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  theme={{ colors: { text: '#FFFFFF' } }}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
              </View>
            )}
            
            <TouchableOpacity style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Forgot Password ?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={isSignup ? handleRegister : handleSignIn}
            >
              <Text style={styles.actionButtonText}>
                {isSignup ? "Create Account" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333333",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrapper: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    transform: [{ rotate: '180deg' }],
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#A0C15A",
  },
  tabText: {
    color: "#888888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  inputsContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#555555",
    paddingBottom: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#FFFFFF",
    fontSize: 16,
    height: 40,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
    marginTop: 10,
  },
  forgotText: {
    color: "#888888",
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: "#A0C15A",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Custom Alert Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "80%",
    backgroundColor: "#444444",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#DDDDDD",
  },
  alertButton: {
    backgroundColor: "#A0C15A",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default AuthScreen;