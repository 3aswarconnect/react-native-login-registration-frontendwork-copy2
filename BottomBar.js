import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

// Import your screens
import ReelsScreen from './ReelsScreen';
import MemesScreen from './MemesScreen';
import UploadScreen from './UploadScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom tab button component with animation
const TabButton = ({ children, onPress, accessibilityLabel }) => {
  const animation = new Animated.Value(0);
  
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomBar = () => {
  const route = useRoute();
  const { userId, email, username } = route.params || {};
  const insets = useSafeAreaInsets();
  
  // Adjust bottom padding based on device safe area
  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 5) : 5;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBarStyle,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'white' }]} />
        ),
      }}
    >
      <Tab.Screen 
        name="Reels"   
        component={ReelsScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name="play-circle-outline" 
                color={focused ? "#000000" : "#909090"} 
                size={40} 
              />
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Reels tab" />
          ),
        }}
      />
      <Tab.Screen 
        name="Memes" 
        component={MemesScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name="images-outline" 
                color={focused ? "#000000" : "#909090"} 
                size={35}
              />
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Memes tab" />
          ),
        }}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen} 
        initialParams={{ userId, username }}  
        options={{ 
          tabBarIcon: () => (
            <View style={styles.uploadButtonWrapper}>
              <View style={styles.uploadButton}>
                <Ionicons name="add-outline" color="#FFFFFF" size={26} />
              </View>
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Upload content" />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ userId, username }}
        options={{ 
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name="person-outline" 
                color={focused ? "#000000" : "#909090"} 
                size={35}
              />
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Profile tab" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    borderRadius: 30,
    height: 10,
    borderTopWidth: 0,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 5 },
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    bottom:0,
    top:20,
    left:20,
    width:48,
    // backgroundColor: '#000000',
    borderRadius: 24,
    // elevation: 8,
  },
  uploadButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    top:20,
    left:30,
  },
  uploadButton: {
    backgroundColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 0,
  },
});

export default BottomBar;