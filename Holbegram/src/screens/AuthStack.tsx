import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import MyTabs from './MyTabs';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainApp" component={MyTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default AuthStack;
