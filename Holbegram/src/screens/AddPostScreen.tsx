import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
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

// Use require to load local images
const decorativeImages = [
  { id: '1', src: require('../assets/bird.jpeg') },
  { id: '2', src: require('../assets/flower.jpeg') },
  { id: '3', src: require('../assets/bloom.jpeg') },
];

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

    const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
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

  const resetFields = () => {
    setImageUri(null);
    setCaption('');
  };

  return (
    <View style={styles.container}>
      {/* Show image picker button if no image is selected, otherwise show the selected image */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <>
          <TouchableOpacity style={styles.pickImageButton} onPress={selectImage}>
            <Text style={styles.pickImageText}>Pick an Image</Text>
          </TouchableOpacity>
          <FlatList
            data={decorativeImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Image source={item.src} style={styles.reelImage} />
            )}
            style={styles.reelContainer}
          />
        </>
      )}

      {/* Caption input */}
      <TextInput
        style={styles.input}
        placeholder="Add a caption"
        placeholderTextColor="#aaa"
        value={caption}
        onChangeText={setCaption}
      />

      {/* Save button */}
      <TouchableOpacity style={styles.uploadButton} onPress={uploadPost}>
        <Text style={styles.uploadButtonText}>Save</Text>
      </TouchableOpacity>

      {/* Reset button */}
      <TouchableOpacity onPress={resetFields}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 20,
  },
  pickImageButton: {
    backgroundColor: 'transparent',
    borderColor: '#1ed2af',
    borderWidth: 1,
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickImageText: {
    color: '#1ed2af',
    fontSize: 16,
  },
  reelContainer: {
    marginBottom: 20,
  },
  reelImage: {
    width: 100,
    height: 100,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1ed2af',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  uploadButton: {
    backgroundColor: '#1ed2af',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  resetText: {
    color: '#1ed2af',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AddPostScreen;
