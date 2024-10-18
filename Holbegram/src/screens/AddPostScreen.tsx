import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import storage from '@react-native-firebase/storage';
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

// Use `require()` to load local images from assets
const decorativeImages = [
  { id: '1', src: require('../assets/bird.jpeg') },
  { id: '2', src: require('../assets/flower.jpeg') },
  { id: '3', src: require('../assets/bloom.jpeg') },
  { id: '4', src: require('../assets/forest.jpg') },
  { id: '5', src: require('../assets/mountain.jpg') },
  { id: '6', src: require('../assets/lake.jpg') },
  { id: '7', src: require('../assets/butterfly.jpeg') },
  { id: '8', src: require('../assets/waterfall.jpeg') },
  { id: '9', src: require('../assets/lavender.jpeg') },
  { id: '10', src: require('../assets/bird.jpeg') },
  { id: '11', src: require('../assets/flower.jpeg') },
  { id: '12', src: require('../assets/bloom.jpeg') },
  { id: '13', src: require('../assets/forest.jpg') },
  { id: '14', src: require('../assets/mountain.jpg') },
  { id: '15', src: require('../assets/lake.jpg') },
  { id: '16', src: require('../assets/butterfly.jpeg') },
  { id: '17', src: require('../assets/waterfall.jpeg') },
  { id: '18', src: require('../assets/lavender.jpeg') },
];

const AddPostScreen: React.FC<Props> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  // Function to select image from the user's local device
  const selectImageFromDevice = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      } else {
        setImageUri(null);
      }
    });
  };

  // Function to handle when the user clicks on a placeholder image
  const selectImageFromPlaceholder = (src: any) => {
    const resolvedUri = Image.resolveAssetSource(src).uri;
    setImageUri(resolvedUri); // Resolve the local image path and set it as the image URI
  };

  // Function to upload post to Firebase
  const uploadPost = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first!');
      return;
    }

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
      console.error('Error uploading post: ', e);
      Alert.alert('Error', 'Failed to upload post');
    }
  };

  // Function to reset the selected image and caption
  const resetFields = () => {
    setImageUri(null);
    setCaption('');
  };

  return (
    <View style={styles.container}>
      {/* If image is selected, display it larger, otherwise show the placeholder images */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.selectedImage} />
      ) : (
        <ScrollView
          horizontal={false}
          style={styles.imageScrollView} // Scrollable view for images
          contentContainerStyle={styles.imageScrollContainer}
        >
          {/* Render images in rows */}
          {decorativeImages.map((item, index) => (
            <TouchableOpacity key={item.id} onPress={() => selectImageFromPlaceholder(item.src)} style={styles.placeholderWrapper}>
              <Image source={item.src} style={styles.placeholderImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Button to select image from local device */}
      {!imageUri &&(
      <TouchableOpacity style={styles.pickImageButton} onPress={selectImageFromDevice}>
        <Text style={styles.pickImageText}>Pick Image from Device</Text>
      </TouchableOpacity>
      )}
      {/* Caption input */}
      {imageUri && (
        <>
      <TextInput
        style={styles.input}
        placeholder="Add a caption"
        placeholderTextColor="#aaa"
        value={caption}
        onChangeText={setCaption}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={uploadPost}>
        <Text style={styles.uploadButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetFields}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
      </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  imageScrollView: {
    maxHeight: 610,
  },
  imageScrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  placeholderWrapper: {
    width: '31%', // Each image takes 30% of the row
    marginBottom: 10,
  },
  placeholderImage: {
    width: '100%', // Full width of the container (30% of the row)
    height: 100,
    borderRadius: 10,
  },
  pickImageButton: {
    backgroundColor: '#1ed2af',
    borderColor: '#1ed2af',
    borderWidth: 1,
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  pickImageText: {
    color: '#fff',
    fontSize: 16,
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
