import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
}

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // Set up real-time listener for the user's favorites
  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    // Real-time listener for the favorites array in the users collection
    const unsubscribeFavorites = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot((doc) => {
        const userData = doc.data();
        if (userData?.favorites) {
          setFavorites(userData.favorites);
        }
      });

    // Fetch posts
    const fetchPosts = async () => {
      const postList: Post[] = [];
      const snapshot = await firestore().collection('posts').get();
      snapshot.forEach(doc => {
        postList.push({ id: doc.id, imageUrl: doc.data().imageUrl, caption: doc.data().caption });
      });
      setPosts(postList);
    };

    fetchPosts();

    // Clean up listener when the component unmounts
    return () => {
      unsubscribeFavorites();
    };
  }, []);

  // Filter posts based on favorites
  const favoritePosts = posts.filter(post => favorites.includes(post.id));

  // Function to remove a post from favorites
  const removeFavorite = async (postId: string) => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    // Remove the post from the favorites list
    const updatedFavorites = favorites.filter(id => id !== postId);
    setFavorites(updatedFavorites);

    // Update Firestore with the new favorites list
    await firestore().collection('users').doc(userId).update({
      favorites: updatedFavorites,
    });

    Alert.alert('The image has been removed from favorites');
  };

  const handleLongPress = (caption: string) => {
    Alert.alert('Caption', caption);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <GestureHandlerRootView>
      <View style={styles.postContainer}>
        {/* Post Image */}
        <TouchableOpacity onLongPress={() => handleLongPress(item.caption)}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </TouchableOpacity>

        {/* Heart Icon for removing from favorites */}
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => removeFavorite(item.id)}
        >
          <Icon name="favorite" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritePosts}
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
  image: {
    width: '100%',
    height: 250,
    marginBottom: 10,
    borderRadius: 10,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default FavoritesScreen;
