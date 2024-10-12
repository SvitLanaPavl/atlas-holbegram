import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HeaderProps = {
  title: string;
  onLogout: () => void;
};

const Header: React.FC<HeaderProps> = ({ title, onLogout }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onLogout}>
        <Icon name="logout" size={30} color="#1ed2af" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
  },
});

export default Header;
