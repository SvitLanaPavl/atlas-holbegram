import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import logo from '../assets/atlas-school.png';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};



const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      navigation.navigate('MainApp');
    })
    .catch(error => {
      setErrorMessage(error.message);
      console.log(error);
  });
  };
  const createUserProfileIfNotExists = async () => {
    const userId = auth().currentUser?.uid;
    const userEmail = auth().currentUser?.email;
  
    if (!userId) return;
  
    const userDocRef = firestore().collection('users').doc(userId);
    const userDoc = await userDocRef.get();
  
    if (!userDoc.exists) {
      await userDocRef.set({
        username: userEmail,  // Default to email if no username is provided
        email: userEmail,
        profileImage: 'https://firebasestorage.googleapis.com/v0/b/holbegram-17718.appspot.com/o/default_profile.jpeg?alt=media&token=9f6d2b87-cf94-4e67-bf4f-f79ce3876160',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    }
  };
  
  // Call this after the user logs in or signs up
  createUserProfileIfNotExists();

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder='Email'
        placeholderTextColor='#ffffff'
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        placeholderTextColor='#ffffff'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null }
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')} >Create a new account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#00003c',
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#1ed2af',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#ffffff',
  },
  error: {
    color: 'red',
  },
  button: {
    backgroundColor: '#1ed2af',
    height: 40,
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    
  },
  link: {
    marginTop: 20,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default LoginScreen;