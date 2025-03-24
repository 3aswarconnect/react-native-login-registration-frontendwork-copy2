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
  Image,
  BlurView,
} from "react-native";
import { TextInput } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

// Glass Black Theme Colors
const COLORS = {
  primary: "#000000",     // Pure black
  secondary: "#333333",   // Dark gray
  tertiary: "#666666",    // Medium gray
  background: "rgba(15, 15, 15, 0.9)",  // Almost black background with slight transparency
  glass: "rgba(30, 30, 30, 0.65)",      // Glass effect color
  glassBorder: "rgba(255, 255, 255, 0.15)", // Glass border glow
  white: "#FFFFFF",
  text: "#FFFFFF",        // White text
  lightText: "#AAAAAA",   // Light gray text
  accent: "#6B7DFF",      // Accent color (blue-purple)
};

// Custom Alert Component
const CustomAlert = ({ visible, title, message, onDismiss, autoClose = false }) => {
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
      
      if (autoClose) {
        const timer = setTimeout(() => {
          onDismiss();
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else {
      animation.setValue(0);
    }
  }, [visible, autoClose]);
  
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
          {!autoClose && (
            <TouchableOpacity 
              style={styles.alertButton} 
              onPress={onDismiss}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          )}
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
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertAutoClose, setAlertAutoClose] = useState(false);
  const [redirectData, setRedirectData] = useState(null);
  
  const showAlert = (title, message, autoClose = false, redirectInfo = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertAutoClose(autoClose);
    setRedirectData(redirectInfo);
    setAlertVisible(true);
  };

  const handleAlertDismiss = () => {
    setAlertVisible(false);
    if (redirectData) {
      navigation.replace("Homes", redirectData);
      setRedirectData(null);
    }
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
      // Show loading indicator
      setLoading(true);
      
      const response = await axios.post("http://192.168.159.183:4000/signin", {
        identifier: email,
        password,
      });
      
      const { userId, username, token } = response.data;
      await storeUserData({ userId, username, token });
      
      // Hide loading indicator
      setLoading(false);
      
      // Show success message with auto-close and redirect
      showAlert("Success", "Signing in...", true, { userId, username });
      
    } catch (error) {
      setLoading(false);
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
      // Show loading indicator
      setLoading(true);
      
      const response = await axios.post("http://192.168.159.183:4000/register", {
        username: email.split('@')[0], // Simple username from email
        email: email,
        password,
      });
      
      const { userId, username: userName, token } = response.data;
      await storeUserData({ userId, username: userName, token });
      
      // Hide loading indicator
      setLoading(false);
      
      // Show success message with auto-close and redirect
      showAlert("Success", "Account created successfully!", true, { userId, username: userName });
      
    } catch (error) {
      setLoading(false);
      showAlert("Error", error.response?.data.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Logo at the top */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPUtHFjkVCeqMlfZcelOQgJJrk1QSgjY9Lsw&s" }} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>{isSignup ? "Sign Up" : "Login"}</Text>
          
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="username"
                placeholderTextColor={COLORS.lightText}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                theme={{ colors: { text: COLORS.text, primary: COLORS.accent } }}
                underlineColor="transparent"
                activeUnderlineColor={COLORS.accent}
                left={<TextInput.Icon icon="email-outline" color={COLORS.lightText} />}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="password"
                placeholderTextColor={COLORS.lightText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                style={styles.input}
                theme={{ colors: { text: COLORS.text, primary: COLORS.accent } }}
                underlineColor="transparent"
                activeUnderlineColor={COLORS.accent}
                left={<TextInput.Icon icon="lock-outline" color={COLORS.lightText} />}
                right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} color={COLORS.lightText} onPress={() => setPasswordVisible(!passwordVisible)} />}
              />
            </View>
            
            {isSignup && (
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="repeat password"
                  placeholderTextColor={COLORS.lightText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  theme={{ colors: { text: COLORS.text, primary: COLORS.accent } }}
                  underlineColor="transparent"
                  activeUnderlineColor={COLORS.accent}
                  left={<TextInput.Icon icon="lock-outline" color={COLORS.lightText} />}
                />
              </View>
            )}
            
            {isSignup && (
              <View style={styles.rememberContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <MaterialCommunityIcons name="check" size={14} color={COLORS.white} />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={isSignup ? handleRegister : handleSignIn}
            >
              <Text style={styles.actionButtonText}>
                {isSignup ? "Sign up" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.switchModeContainer}
            onPress={() => {
              setIsSignup(!isSignup);
              setPassword("");
              setConfirmPassword("");
            }}
          >
            <Text style={styles.switchModeText}>
              {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Wellkin Name at the bottom */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>Wellkin</Text>
        </View>
      </KeyboardAvoidingView>
      
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onDismiss={handleAlertDismiss}
        autoClose={alertAutoClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  // Logo styles
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: COLORS.glass,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: COLORS.white,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backdropFilter: "blur(10px)",
  },
  // Brand styles
  brandContainer: {
    marginTop: 20,
    paddingBottom: 10,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 30,
    alignSelf: "flex-start",
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  inputsContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(30, 30, 30, 0.5)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 16,
    height: 56,
    color: COLORS.white,
    borderRadius: 12,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  checkboxActive: {
    backgroundColor: COLORS.accent,
  },
  rememberText: {
    color: COLORS.white,
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    borderWidth: 0,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  switchModeContainer: {
    marginTop: 30,
  },
  switchModeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  // Custom Alert Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(5px)",
  },
  alertContainer: {
    width: "80%",
    backgroundColor: COLORS.glass,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: COLORS.white,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.white,
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: "center",
    color: COLORS.lightText,
  },
  alertButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    borderWidth: 0,
  },
  alertButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AuthScreen;