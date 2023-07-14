import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = () => {
  const getCurrentDate = () => {
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
  };

  return (
    <View style={styles.container}>
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25a3c2',
    paddingVertical: 20,
  },
  dateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10
  },
});

export default Header;
