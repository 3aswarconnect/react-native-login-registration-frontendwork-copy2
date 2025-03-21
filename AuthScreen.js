import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStoredLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { userId, username } = JSON.parse(userData);
          navigation.replace('Homes', { userId, username });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };
    checkStoredLogin();
  }, []);

  const storeUserData = async (data) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  const handleSignIn = async () => {
    if (!identifier || !password) {
      return Alert.alert('Error', 'Please enter username/email and password.');
    }
    try {
      const response = await axios.post('http://192.168.159.183:4000/signin', { identifier, password });
      const { userId, username, token } = response.data;

      await storeUserData({ userId, username, token });
      
      Alert.alert('Success', response.data.message);
      navigation.replace('Homes', { userId, username });
    } catch (error) {
      Alert.alert('Error', error.response?.data.message || 'Something went wrong');
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }
    try {
      const response = await axios.post('http://192.168.159.183:4000/register', { username, password });
      const { userId, username: userName, token } = response.data;

      await storeUserData({ userId, username: userName, token });

      Alert.alert('Success', response.data.message);
      navigation.replace('Homes', { userId, username: userName });
    } catch (error) {
      Alert.alert('Error', error.response?.data.message || 'Something went wrong');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>{isRegister ? 'Register' : 'Sign In'}</Text>
      {isRegister ? (
        <>
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ borderBottomWidth: 1 }} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderBottomWidth: 1 }} />
          <TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={{ borderBottomWidth: 1, marginBottom: 10 }} />
          <Button title="Register" onPress={handleRegister} />
          <Button title="Already have an account? Sign In" onPress={() => setIsRegister(false)} />
        </>
      ) : (
        <>
          <TextInput placeholder="Username or Email" value={identifier} onChangeText={setIdentifier} style={{ borderBottomWidth: 1 }} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderBottomWidth: 1, marginVertical: 10 }} />
          <Button title="Sign In" onPress={handleSignIn} />
          <Button title="New User? Register" onPress={() => setIsRegister(true)} />
        </>
      )}
    </View>
  );
};

export default AuthScreen;