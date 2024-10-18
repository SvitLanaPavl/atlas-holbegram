import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const HomeScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const postList: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          postList.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            caption: data.caption,
            username: data.username,
            profileImage: data.profileImage || 'https://firebasestorage.googleapis.com/v0/b/holbegram-17718.appspot.com/o/default_profile.jpeg?alt=media&token=9f6d2b87-cf94-4e67-bf4f-f79ce3876160',
          });
        });
        setPosts(postList);
      });

    return () => unsubscribe();
  }, []);

  const handleDoubleTap = (postId: string) => {
    Alert.alert('Added to favorites!');
  };

  const handleLongPress = (caption: string) => {
    Alert.alert('Caption', caption);
  };

  const renderPost = ({ item }: { item: any }) => (
    <GestureHandlerRootView>
      <View style={styles.postContainer}>
        {/* User Info Section */}
        <View style={styles.userInfo}>
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
          <Text style={styles.username}>{item.username}</Text>
        </View>
  
        {/* Post Image */}
        <TouchableOpacity
          onLongPress={() => handleLongPress(item.caption)}
          onPress={() => handleDoubleTap(item.id)}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </TouchableOpacity>
  
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
});

export default HomeScreen;
