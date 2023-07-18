import React from 'react';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MainScreen from '../components/MainScreen';
import LogScreen from '../components/LogScreen';
import GraphsScreen from '../components/GraphsScreen';
import DataEntryScreen from '../components/DataEntryScreen';
import MoreScreen from '../components/MoreScreen';
import { Transitioning, Transition } from 'react-native-reanimated';

const transition = (
  <Transition.Together>
    <Transition.In type="fade" durationMs={200} />
    <Transition.Change />
    <Transition.Out type="fade" durationMs={200} />
  </Transition.Together>
);
//pomyslec na zmiana na drawwer bo przez bootom navigation nestowanie nie działa
const BottomNavBar = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'Home', title: 'START', iconName: 'home-sharp' },
    { key: 'Log', title: 'DZIENNIK', iconName: 'newspaper-sharp' },
    { key: 'Data', title: 'DODAJ', iconName: 'water-sharp' },
    { key: 'Graphs', title: 'WYKRESY', iconName: 'stats-chart-sharp' },
    { key: 'More', title: 'WIĘCEJ', iconName: 'ellipsis-horizontal' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    Home: MainScreen,
    Log: LogScreen,
    Data: DataEntryScreen,
    Graphs: GraphsScreen,
    More: MoreScreen,
  });
// juz działa
  const ref = React.useRef();

  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Transitioning.View
        ref={ref}
        transition={transition}
        style={{ flex: 1 }}
      >
        <BottomNavigation
          barStyle={{ backgroundColor: '#ffffff' , borderTopWidth: 1, borderTopColor: '#dddddd', elevation: 8 }}
          activeColor={colors.primary}
          navigationState={{ index, routes }}
          onIndexChange={index => {
            ref.current.animateNextTransition();
            setIndex(index);
          }}
          renderScene={renderScene}
          renderIcon={({ route, focused }) => (
            <View style={{ marginTop: -8, alignItems: 'center' }}>
              <Ionicons
                name={route.iconName}
                size={index === routes.indexOf(route) ? 36 : 28}
                color={index === routes.indexOf(route) ? '#25a3c2' : '#b0bec5'}
                
              />
            </View>
          )}
          renderLabel={({ route, focused }) => (
            <Text style={{ color: focused ? '#25a3c2' : '#b0bec5', marginTop: 2, textAlign: 'center', fontWeight: '600', fontSize: 14 }}>
              {route.title}
            </Text>
          )}
        />
      </Transitioning.View>
    </View>
  );
};

export default BottomNavBar;