import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import AddPostScreen from './AddPostScreen';
import FavoritesScreen from './FavoritesScreen';
import ProfileScreen from './ProfileScreen';
import { TouchableOpacity, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define the root navigation param list
type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  AddPost: undefined;
  Favorites: undefined;
  Profile: undefined;
  Login: undefined;
};

const Tab = createBottomTabNavigator();

function MyTabs() {
  // Correctly typed navigation hook for RootStackParamList
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Logo to be used in the header
  const logo = require('../assets/atlas_transparent.png');

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Home Feed') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Add Post') {
            iconName = 'add';
          } else if (route.name === 'Favorites') {
            iconName = 'favorite';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: '#1ed2af',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          borderTopWidth: 0,
        },
        headerTitle: () => (
          <Image
            source={logo}
            style={{ width: 90, height: 40 }}
            resizeMode="contain"
          />
        ),
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ paddingRight: 15 }}>
            <Icon name="logout" size={24} color="#1ed2af" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Home Feed" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Add Post" component={AddPostScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default MyTabs;
