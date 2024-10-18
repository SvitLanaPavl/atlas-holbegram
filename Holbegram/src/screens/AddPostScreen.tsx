import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

// Define navigation prop types
type RootStackParamList = {
  Home: undefined;
  "Home Feed": undefined;
  AddPost: undefined;
  Login: undefined;
};
type AddPostScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddPost'>;
type Props = { navigation: AddPostScreenNavigationProp };

// Function to fetch images from Firebase Storage
const fetchDecorativeImages = async () => {
  try {
    const folderPath = 'decorativeImages/';
    const listResult = await storage().ref(folderPath).listAll();
    const imageUrls = await Promise.all(
      listResult.items.map(async (itemRef) => {
        const url = await itemRef.getDownloadURL();
        return { id: itemRef.name, url };
      })
    );
    return imageUrls;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

const AddPostScreen: React.FC<Props> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [imageFromFirebase, setImageFromFirebase] = useState(false); // Add flag to track image source (Firebase or device)
  const [decorativeImages, setDecorativeImages] = useState<any[]>([]);

  // Fetch decorative images from Firebase when the component mounts
  useEffect(() => {
    const loadImages = async () => {
      const images = await fetchDecorativeImages();
      setDecorativeImages(images);
    };
    loadImages();
  }, []);

  // Function to select image from the user's local device
  const selectImageFromDevice = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
        setImageFromFirebase(false); // Set flag to false when selecting from the device
      } else {
        setImageUri(null);
      }
    });
  };

  // Function to handle when the user clicks on a placeholder image
  const selectImageFromPlaceholder = (url: string) => {
    setImageUri(url); // Set selected image URI from Firebase Storage
    setImageFromFirebase(true); // Set flag to true for Firebase images
  };

  // Function to upload post to Firebase
  const uploadPost = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first!');
      return;
    }
  
    const userId = auth().currentUser?.uid; // Get the current user's ID
    if (!userId) {
      Alert.alert('Error', 'User is not logged in.');
      return;
    }
  
    // Fetch user data (username and profile image) from Firestore
    const userDoc = await firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const username = userData?.username || 'User';
    const profileImage = userData?.profileImage || 'https://firebasestorage.googleapis.com/v0/b/holbegram-17718.appspot.com/o/default_profile.jpeg?alt=media&token=9f6d2b87-cf94-4e67-bf4f-f79ce3876160';
  
    let imageUrl = imageUri;
  
    // If the image is from the local device, upload it to Firebase Storage first
    if (!imageFromFirebase) {
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const task = storage().ref(`userPosts/${filename}`).putFile(imageUri);
  
      try {
        await task;
        imageUrl = await storage().ref(`userPosts/${filename}`).getDownloadURL();
      } catch (e) {
        console.error('Error uploading post: ', e);
        Alert.alert('Error', 'Failed to upload post');
        return;
      }
    }
  
    // Now that we have the image URL (either from Firebase or uploaded), save the post
    try {
      await firestore().collection('posts').add({
        imageUrl: imageUrl,
        caption: caption,
        userId: userId,         // Associate the post with the user's ID
        username: username,     // Include the username in the post
        profileImage: profileImage, // Include the user's profile image
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', 'Post uploaded successfully!');
      
      // Reset the form fields after successful upload
      resetFields();
  
      // Navigate to Home Feed
      navigation.navigate('Home Feed');
    } catch (e) {
      console.error('Error saving post to Firestore: ', e);
      Alert.alert('Error', 'Failed to save post');
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
          {/* Render decorative images fetched from Firebase */}
          {decorativeImages.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => selectImageFromPlaceholder(item.url)} style={styles.placeholderWrapper}>
              <Image source={{ uri: item.url }} style={styles.placeholderImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Button to select image from local device */}
      {!imageUri && (
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
    width: '31%',
    marginBottom: 10,
  },
  placeholderImage: {
    width: '100%',
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
