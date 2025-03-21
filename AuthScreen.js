import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState(''); // Username or Email for Sign In
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSignIn = async () => {
    if (!identifier || !password) {
      return Alert.alert('Error', 'Please enter username/email and password.');
    }
    try {
      const response = await axios.post('http://192.168.159.183:4000/signin', { identifier, password });
      Alert.alert(response.data.message);
      console.log('SignIn Response:', response.data); // Debugging

      navigation.navigate('Homes', { 
        userId: response.data.userId, 
        email: response.data.email, 
        username: response.data.username 
      });
    } catch (error) {
      Alert.alert('Error', error.response?.data.message || 'Something went wrong');
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }
    try {
      const response = await axios.post('http://192.168.159.183:4000/register', { username, email, password });
      
      Alert.alert(response.data.message);
      navigation.navigate('Homes', { 
        userId: response.data.userId, 
        email, 
        username 
      });
    } catch (error) {
      Alert.alert('Error', error.response?.data.message || 'Something went wrong');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>{isRegister ? 'Register' : 'Sign In'}</Text>
      {isRegister ? (
        <>
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ borderBottomWidth: 1 }} />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderBottomWidth: 1 }} />
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
