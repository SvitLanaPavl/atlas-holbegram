import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { name as appName } from './app.json';
import AuthStack from './src/screens/AuthStack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}

AppRegistry.registerComponent(appName, () => App);

export default App;
