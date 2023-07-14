import React, { useState } from 'react';
import { View } from 'react-native';
import BottomNavBar from '../src/navigation/BottomNavBar';
import Header from '../src/components/Header';
export default function App() {



  return (
    <View style={{ flex: 1 }}>
      <Header/>
      <BottomNavBar/>
    </View>
  );
  
}