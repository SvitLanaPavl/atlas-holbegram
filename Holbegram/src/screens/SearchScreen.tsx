import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Profile: { userId: string };
  Login: undefined;
};

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface User {
  id: string;
  username: string;
  profileImage: string;
}

interface Props {
  navigation: SearchScreenNavigationProp;
}

const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Fetch all users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const userList: User[] = [];
      const snapshot = await firestore().collection('users').get();
      snapshot.forEach(doc => {
        userList.push({
          id: doc.id,
          username: doc.data().username,
          profileImage: doc.data().profileImage || 'https://example.com/default-profile.png', // Default image
        });
      });
      setUsers(userList);
      setFilteredUsers(userList); // Initially show all users
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users); // Show all users if search query is empty
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Navigate to user profile
  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  // Render each user in the list
  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item.id)}>
      <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
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
      {/* Search Input */}
      <TextInput
        style={styles.input}
        placeholder="Search for users..."
        placeholderTextColor="#64648cd"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* No user found message */}
      {filteredUsers.length === 0 && searchQuery.trim() !== '' ? (
        <Text style={styles.noUserFound}>No user found</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.userList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: 'rgba(30, 210, 175, 0.3)',
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#00003c',
    backgroundColor: 'rgba(30, 210, 175, 0.3)',
    marginBottom: 20,
  },
  userList: {
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    color: '#000',
  },
  noUserFound: {
    fontSize: 16,
    color: '#00003c',
    textAlign: 'center',
  },
});

export default SearchScreen;
