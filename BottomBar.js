import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/native';

// Import your screens
import ReelsScreen from './ReelsScreen';
import MemesScreen from './MemesScreen';
import UploadScreen from './UploadScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomBar = () => {
  const route = useRoute();
  const { userId, email, username } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Reels"   
        component={ReelsScreen} 
       
        options={{ 
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name="film" 
              color={focused ? "#FFD700" : "#B0B0B0"} 
              size={focused ? 20 : 18} 
              style={styles.icon}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Memes" 
        component={MemesScreen} 
       
        options={{ 
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name="picture-o" 
              color={focused ? "#FFD700" : "#B0B0B0"} 
              size={focused ? 20 : 18} 
              style={styles.icon}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen} 
        initialParams={{ userId, username }}  
        options={{ 
          tabBarIcon: () => (
            <View style={styles.uploadButton}>
              <Icon name="plus" color="#FFF" size={16} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ userId, username }}
        options={{ 
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name="user" 
              color={focused ? "#FFD700" : "#B0B0B0"} 
              size={focused ? 20 : 18} 
              style={styles.icon}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    bottom: 5,
    left: 30,
    right: 30,
    backgroundColor: '#2C2C2C',
    borderRadius: 15,
    height: 50,
    borderTopWidth: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    marginBottom: -3,
  },
  uploadButton: {
    backgroundColor: '#FFD700',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -10,
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});

export default BottomBar;
