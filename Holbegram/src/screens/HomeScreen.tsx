import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import RNFS from 'react-native-fs';

type RootStackParamList = {
  Home: undefined;
  AddPost: undefined;
  Login: undefined;
};

type AddPostScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddPost'
>;

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
  const selectImageFromPlaceholder = async (src: any) => {
    try {
      const resolvedUri = Image.resolveAssetSource(src).uri;

      // Define a path in the app's cache directory
      const fileName = resolvedUri.split('/').pop();
      const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // Check if the file already exists to avoid unnecessary copying
      const fileExists = await RNFS.exists(destPath);
      if (!fileExists) {
        // Copy the asset image to the destination path
        await RNFS.copyFile(resolvedUri, destPath);
      }

      setImageUri(`file://${destPath}`);
    } catch (error) {
      console.error('Error copying asset image:', error);
      Alert.alert('Error', 'Failed to select image from placeholders.');
    }
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
      resetFields();
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
      {/* Scrollable section for images */}
      <ScrollView
        style={styles.imageScrollView}
        contentContainerStyle={styles.imageScrollContainer}
      >
        {/* Render images in rows */}
        {decorativeImages.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => selectImageFromPlaceholder(item.src)}
            style={styles.placeholderWrapper}
          >
            <Image source={item.src} style={styles.placeholderImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fixed buttons and inputs */}
      <View style={styles.buttonsContainer}>
        {/* Button to select image from local device */}
        <TouchableOpacity style={styles.pickImageButton} onPress={selectImageFromDevice}>
          <Text style={styles.pickImageText}>Pick Image from Device</Text>
        </TouchableOpacity>

        {/* Caption input only visible when image is selected */}
        {imageUri && (
          <>
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
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageScrollView: {
    flex: 1,
    padding: 10,
  },
  imageScrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  placeholderWrapper: {
    width: '31%', // Each image takes approximately 31% of the row
    marginBottom: 10,
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  buttonsContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  pickImageButton: {
    backgroundColor: '#1ed2af',
    borderColor: '#1ed2af',
    borderWidth: 1,
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },
  uploadButton: {
    backgroundColor: '#1ed2af',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
