import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch posts and set up real-time listener for posts and user favorites
  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    // Real-time listener for posts
    const unsubscribePosts = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(async snapshot => {
        const postList: any[] = [];

        // Iterate over posts and fetch the latest username from 'users' collection
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const userId = data.userId;
          
          // Fetch the latest user info from Firestore
          const userDoc = await firestore().collection('users').doc(userId).get();
          const authUser = auth().currentUser;
          const email = authUser?.email || 'user@example.com';
          const username = userDoc.data()?.username || email;
          const profileImage = userDoc.data()?.profileImage || 'https://firebasestorage.googleapis.com/v0/b/holbegram-17718.appspot.com/o/default_profile.jpeg?alt=media&token=9f6d2b87-cf94-4e67-bf4f-f79ce3876160';

          postList.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            caption: data.caption,
            username: username,  // Use the latest username
            profileImage: profileImage,
          });
        }

        setPosts(postList);
      });

    // Real-time listener for user's favorites
    const unsubscribeFavorites = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot((doc) => {
        const userData = doc.data();
        if (userData?.favorites) {
          setFavorites(userData.favorites);
        }
      });

    // Clean up listeners when the component unmounts
    return () => {
      unsubscribePosts();
      unsubscribeFavorites();
    };
  }, []);

  // Add or remove post from favorites
  const toggleFavorite = async (postId: string) => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    let updatedFavorites;

    if (favorites.includes(postId)) {
      // Remove from favorites and show the alert
      updatedFavorites = favorites.filter(id => id !== postId);
      Alert.alert('The image has been removed from favorites');
    } else {
      // Add to favorites and show the alert
      updatedFavorites = [...favorites, postId];
      Alert.alert('The image has been added to favorites');
    }

    setFavorites(updatedFavorites);

    // Update Firestore with the new favorites list
    await firestore().collection('users').doc(userId).update({
      favorites: updatedFavorites,
    });
  };

  const isFavorite = (postId: string) => favorites.includes(postId);

  const renderPost = ({ item }: { item: any }) => (
    <GestureHandlerRootView>
      <View style={styles.postContainer}>
        {/* User Info Section */}
        <View style={styles.userInfo}>
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
          <Text style={styles.username}>{item.username}</Text>
        </View>
  
        {/* Post Image with heart icon */}
        <View>
          <TouchableOpacity
            onLongPress={() => Alert.alert('Caption', item.caption)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          </TouchableOpacity>

          {/* Heart Icon on the top-right corner */}
          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => toggleFavorite(item.id)}
          >
            <Icon
              name={isFavorite(item.id) ? 'favorite' : 'favorite-border'}  // Filled heart if favorite
              size={30}
              color={isFavorite(item.id) ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </View>
  
        {/* Caption Section */}
        <View style={styles.captionContainer}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingBottom: 20,
  },
  postContainer: {
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 10,
    borderRadius: 10,
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caption: {
    fontSize: 16,
    color: '#000',
    marginLeft: 5,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default HomeScreen;
