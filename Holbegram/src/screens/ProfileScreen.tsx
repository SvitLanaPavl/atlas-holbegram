import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Image, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState({
    username: '',
    profileImage: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(''); // Initial value is empty

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth / 4 - 10;  // Calculate image size based on screen width (4 images per row)

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth().currentUser?.uid;
      const userEmail = auth().currentUser?.email; // Fetch the email for default display
      if (!userId) return;
  
      try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();
  
        if (userData) {
          const fetchedUsername = userData.username || userEmail || 'User';
          setUserProfile({
            username: fetchedUsername,
            profileImage: userData.profileImage || 'https://firebasestorage.googleapis.com/v0/b/holbegram-17718.appspot.com/o/default_profile.jpeg?alt=media&token=9f6d2b87-cf94-4e67-bf4f-f79ce3876160',
          });
  
          setDisplayName(fetchedUsername);
        } else {
          setDisplayName(userEmail || 'User');
        }

        // Real-time listener for posts
        const unsubscribePosts = firestore()
          .collection('posts')
          .where('userId', '==', userId)
          .onSnapshot((snapshot) => {
            const postList: any[] = [];
            snapshot.forEach(doc => {
              postList.push({ id: doc.id, imageUrl: doc.data().imageUrl, caption: doc.data().caption });
            });
            setPosts(postList);  // Update state with new posts
          });

        return () => unsubscribePosts(); // Unsubscribe when component unmounts
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchUserProfile();
  }, []);
  

  const changeProfileImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      const imageUri = response.assets ? response.assets[0].uri : undefined;
      if (!imageUri) {
        Alert.alert('Error', 'No image selected.');
        return;
      }

      try {
        const userId = auth().currentUser?.uid;
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const task = storage().ref(`profileImages/${filename}`).putFile(imageUri);

        await task;
        const downloadUrl = await storage().ref(`profileImages/${filename}`).getDownloadURL();

        await firestore().collection('users').doc(userId).update({
          profileImage: downloadUrl,
        });

        setUserProfile((prevProfile) => ({
          ...prevProfile,
          profileImage: downloadUrl,
        }));

        Alert.alert('Success', 'Profile image updated!');
      } catch (error) {
        console.error('Error uploading profile image:', error);
        Alert.alert('Error', 'Failed to upload profile image.');
      }
    });
  };

  const updateDisplayName = async () => {
    const userId = auth().currentUser?.uid;
    
    if (!userId || !displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }
  
    try {
      const batch = firestore().batch();
  
      const userRef = firestore().collection('users').doc(userId);
      batch.update(userRef, {
        username: displayName,
      });
  
      const postsSnapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId)
        .get();
  
      postsSnapshot.forEach((postDoc) => {
        const postRef = firestore().collection('posts').doc(postDoc.id);
        batch.update(postRef, {
          username: displayName,
        });
      });
  
      await batch.commit();
  
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        username: displayName,
      }));
  
      Alert.alert('Success', 'Display name and all posts updated!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      Alert.alert('Error', 'Failed to update display name.');
    }
  };
  

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => Alert.alert('Caption', item.caption)}>
      <Image source={{ uri: item.imageUrl }} style={[styles.gridImage, { width: imageSize, height: imageSize }]} />
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={() => { setIsEditing(false); Keyboard.dismiss(); }}>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={changeProfileImage}>
            <Image
              source={{
                uri: userProfile.profileImage || 'https://firebasestorage.googleapis.com/v0/b/holbegram-17718.appspot.com/o/default_profile.jpeg?alt=media&token=9f6d2b87-cf94-4e67-bf4f-f79ce3876160',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          {isEditing ? (
            <View style={styles.editSection}>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.usernameInput}
                placeholder="Enter your display name"
              />
              <TouchableOpacity onPress={updateDisplayName}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.username}>{displayName}</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={4}
          key={4}
          renderItem={renderPost}
          contentContainerStyle={styles.gridContainer}
        />

      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  usernameInput: {
    borderColor: 'rgba(30, 210, 175, 0.5)',
    borderWidth: 1,
    padding: 3,
    width: 200,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 5,
    marginLeft: 10,
    color: '#1ed2af',
    fontWeight: 'bold',
  },
  gridContainer: {
    paddingBottom: 20,
  },
  gridImage: {
    margin: 5,
    borderRadius: 10,
  },
  editSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileScreen;
