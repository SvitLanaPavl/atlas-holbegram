import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Header from './Header';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  EditProfile: undefined;
  Login: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
}

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState({
    username: '',
    profileImage: ''
  });

  // Fetch user's posts and profile info from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth().currentUser?.uid;
      if (!userId) return;

      try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (userData) {
          setUserProfile({
            username: userData.username || 'User',
            profileImage: userData.profileImage || null  // Null if no profile image
          });
        }

        const postList: Post[] = [];
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

  // Log out function
  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
    }
  };

  // Navigate to Edit Profile
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  // Render post in a grid format (3 columns)
  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity onPress={() => Alert.alert('Caption', item.caption)}>
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Reusable Header */}
      <Header title="Profile" onLogout={handleLogout} />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={handleEditProfile}>
          <Image
            source={userProfile.profileImage ? { uri: userProfile.profileImage } : require('../assets/default.jpeg')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.username}>{userProfile.username}</Text>
      </View>

      {/* User's Posts in Grid Layout */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={renderPost}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5', // Grayish background color
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circle
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
});

export default ProfileScreen;
