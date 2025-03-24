import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from 'react-query';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

// Define your fetch functions - extract them for reuse
export const fetchReelsData = async (category = 'All') => {
  const response = await axios.get(`http://192.168.159.183:4000/reels?category=${category}`);
  return response.data;
};

const SplashScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [prefetchingComplete, setPrefetchingComplete] = useState(false);

  useEffect(() => {
    const prefetchData = async () => {
      try {
        // Prefetch data for main categories
        await Promise.all([
          // Prefetch the "All" category first which is likely the default view
          queryClient.prefetchQuery(['reels', 'All'], () => fetchReelsData('All')),
          
          // Prefetch a few popular categories
          queryClient.prefetchQuery(['reels', 'Entertainment'], () => 
            fetchReelsData('Entertainment')),
          
          queryClient.prefetchQuery(['reels', 'Motivation/Self Growth'], () => 
            fetchReelsData('Motivation/Self Growth')),
          
          // Add other prefetch queries as needed
        ]);
        
        console.log('Prefetching complete!');
        setPrefetchingComplete(true);
      } catch (error) {
        console.error('Error prefetching data:', error);
        setPrefetchingComplete(true);
      }
    };

    prefetchData();

    const timer = setTimeout(() => {
      if (prefetchingComplete) {
        navigation.replace('Auth');
      } else {
        const checkInterval = setInterval(() => {
          if (prefetchingComplete) {
            navigation.replace('Auth');
            clearInterval(checkInterval);
          }
        }, 100);
        
        // Safety timeout
        setTimeout(() => {
          clearInterval(checkInterval);
          navigation.replace('Auth');
        }, 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, prefetchingComplete]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require('./assets/9029931.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.3,
  },
});

export default SplashScreen;