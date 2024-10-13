import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  AddPost: undefined;
  Login: undefined;
};

type AddPostScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddPost'>;

type Props = {
  navigation: AddPostScreenNavigationProp;
};

const AddPostScreen: React.FC<Props> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      } else {
        setImageUri(null);
      }
    });
  };

  const uploadPost = async () => {
    if (!imageUri) return;

    const filename = imageUri?.substring(imageUri.lastIndexOf('/') + 1);
    const task = storage().ref(filename).putFile(imageUri);

    try {
      await task;
      const url = await storage().ref(filename).getDownloadURL();
      await firestore().collection('posts').add({
        imageUrl: url,
        caption: caption,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', 'Post uploaded successfully!');
      navigation.navigate('Home');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to upload post');
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={selectImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <TextInput
        style={styles.input}
        placeholder="Write a caption..."
        placeholderTextColor="#aaa"
        value={caption}
        onChangeText={setCaption}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={uploadPost}>
        <Text style={styles.uploadButtonText}>Upload Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1ed2af',
    padding: 10,
    marginVertical: 10,
  },
  uploadButton: {
    backgroundColor: '#1ed2af',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
  },
});

export default AddPostScreen;
