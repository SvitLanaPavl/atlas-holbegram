// /src/utils/uploadImagesToFirebase.js

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';

// Define local image paths
const images = [
  { id: '1', src: require('../assets/bird.jpeg') },
  { id: '2', src: require('../assets/flower.jpeg') },
  { id: '3', src: require('../assets/bloom.jpeg') },
  { id: '4', src: require('../assets/forest.jpg') },
  { id: '5', src: require('../assets/mountain.jpg') },
  { id: '6', src: require('../assets/lake.jpg') },
  { id: '7', src: require('../assets/butterfly.jpeg') },
  { id: '8', src: require('../assets/waterfall.jpeg') },
  { id: '9', src: require('../assets/lavender.jpeg') },
];

export const uploadImagesToFirebase = async () => {
  try {
    for (const image of images) {
      const fileName = `decorativeImages/${image.id}.jpeg`; // File name on Firebase

      // Upload image to Firebase Storage
      const uploadUri = Image.resolveAssetSource(image.src).uri; // resolve local image URI
      const task = await storage().ref(fileName).putFile(uploadUri);
      
      // Get the download URL
      const downloadUrl = await storage().ref(fileName).getDownloadURL();

      // Save the image URL to Firestore
      await firestore().collection('decorativeImages').add({
        imageUrl: downloadUrl,
        id: image.id,
      });

      console.log(`Uploaded ${image.id} successfully!`);
    }
  } catch (error) {
    console.error('Error uploading images: ', error);
  }
};

// Call the function in your component or run it once
uploadImagesToFirebase();
