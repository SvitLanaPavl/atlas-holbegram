import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type RootStackParamList = {
  Home: undefined;
  Favorites: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postList: any[] = [];
      const snapshot = await firestore()
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .get();
      snapshot.forEach(doc => {
        postList.push({
          id: doc.id,
          imageUrl: doc.data().imageUrl,
          caption: doc.data().caption,
        });
      });
      setPosts(postList);
    };
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDoubleTap = (postId: string) => {
    Alert.alert('Added to favorites!');
  };

  const handleLongPress = (caption: string) => {
    Alert.alert('Caption', caption);
  };

  const renderPost = ({ item }: { item: any }) => (
    <GestureHandlerRootView>
      <TouchableOpacity
        onLongPress={() => handleLongPress(item.caption)}
        onPress={() => handleDoubleTap(item.id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      </TouchableOpacity>
    </GestureHandlerRootView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home Feed</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={30} color="#1ed2af" />
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#00003c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
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

export default HomeScreen;
