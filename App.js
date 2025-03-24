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
import FeedScreen from './FeedScreen';
import SplashScreen from './SplashScreen';
import { QueryClient, QueryClientProvider } from 'react-query';
import ProfileView from './ProfileView';
const Stack = createStackNavigator();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Homes" component={BottomBar} options={{ headerShown: false }} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Reels" component={ReelsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Feed" component={FeedScreen} />
        <Stack.Screen name="ProfileView" component={ProfileView} />

        
      </Stack.Navigator>
     
    </NavigationContainer>
    </QueryClientProvider>

  );
}
