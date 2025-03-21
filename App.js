import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './AuthScreen';
import ReelsScreen from './ReelsScreen';
import BottomBar from './BottomBar';
import UploadScreen from './UploadScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import EditProfile from './EditProfile';
import TermsAndConditionsScreen from './TermsAndConditionsScreen';
import AboutScreen from './About';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Sign In / Register' }} />
        <Stack.Screen name="Homes" component={BottomBar} options={{ headerShown: false }} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Reels" component={ReelsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
     
    </NavigationContainer>
  );
}
