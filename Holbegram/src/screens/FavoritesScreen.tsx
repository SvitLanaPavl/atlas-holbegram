import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
}
type RootStackParamList = {
  Home: undefined;
  Favorites: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Favorites'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postList: Post[] = [];
      const snapshot = await firestore().collection('posts').get();
      snapshot.forEach(doc => {
        postList.push({ id: doc.id, imageUrl: doc.data().imageUrl, caption: doc.data().caption });
      });
      setPosts(postList);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = auth().currentUser?.uid;
      if (!userId) return;
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      if (userData?.favorites) setFavorites(userData.favorites);
    };
    fetchFavorites();
  }, []);

  const favoritePosts = posts.filter(post => favorites.includes(post.id));

  const handleLongPress = (caption: string) => {
    Alert.alert('Caption', caption);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <GestureHandlerRootView>
      <TouchableOpacity onLongPress={() => handleLongPress(item.caption)}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      </TouchableOpacity>
    </GestureHandlerRootView>
  );

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
    }
  };

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
  image: {
    width: '100%',
    height: 250,
    marginBottom: 15,
    borderRadius: 10,
  },
});

export default FavoritesScreen;
