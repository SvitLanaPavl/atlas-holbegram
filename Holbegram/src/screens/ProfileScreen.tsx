import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Image, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth().currentUser?.uid;
      const userEmail = auth().currentUser?.email; // Fetch the email for default display
      if (!userId) return;
  
      try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();
  
        // If user data is present, set the profile and displayName.
        if (userData) {
          const fetchedUsername = userData.username || userEmail || 'User';
          setUserProfile({
            username: fetchedUsername,
            profileImage: userData.profileImage || 'https://firebasestorage.googleapis.com/v0/b/holbegram-17718.appspot.com/o/default_profile.jpeg?alt=media&token=9f6d2b87-cf94-4e67-bf4f-f79ce3876160',
          });
  
          // Initialize displayName here, so it reflects the username or email
          setDisplayName(fetchedUsername);
        } else {
          // If no user data is found, still set the displayName to email
          setDisplayName(userEmail || 'User');
        }
  
        const postList: any[] = [];
        const snapshot = await firestore().collection('posts').where('userId', '==', userId).get();
        snapshot.forEach(doc => {
          postList.push({ id: doc.id, imageUrl: doc.data().imageUrl, caption: doc.data().caption });
        });
        setPosts(postList);
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

        // Update profile image URL in Firestore
        await firestore().collection('users').doc(userId).update({
          profileImage: downloadUrl,
        });

        // Update state
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
  
      // Update the username in the 'users' collection
      const userRef = firestore().collection('users').doc(userId);
      batch.update(userRef, {
        username: displayName,
      });
  
      // Get all posts by the current user
      const postsSnapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId)
        .get();
  
      // Update username in all posts
      postsSnapshot.forEach((postDoc) => {
        const postRef = firestore().collection('posts').doc(postDoc.id);
        batch.update(postRef, {
          username: displayName,  // This updates the username in the post
        });
      });
  
      // Commit the batch update
      await batch.commit();
  
      // Update local state
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        username: displayName,
      }));
  
      Alert.alert('Success', 'Display name and all posts updated!');
      setIsEditing(false); // Exit editing mode after success
    } catch (error) {
      console.error('Error updating display name:', error);
      Alert.alert('Error', 'Failed to update display name.');
    }
  };
  
  

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => Alert.alert('Caption', item.caption)}>
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
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
          {/* Username Display */}
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

        {/* Posts */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={3}
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
    width: '30%',
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  editSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileScreen;
