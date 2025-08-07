import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ChatScreen from './src/screens/ChatScreen';
import ModelsScreen from './src/screens/ModelsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WelcomeScreen from './src/components/WelcomeScreen';
import { theme } from './src/theme/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then(value => {
      setIsFirstLaunch(value === null);
    });
  }, []);

  const handleWelcomeComplete = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    setIsFirstLaunch(false);
  };

  if (isFirstLaunch === null) {
    // Loading state
    return null;
  }

  if (isFirstLaunch) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <WelcomeScreen onComplete={handleWelcomeComplete} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Chat') {
                  iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                } else if (route.name === 'Models') {
                  iconName = focused ? 'library' : 'library-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                } else {
                  iconName = 'help-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
            })}
          >
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Models" component={ModelsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
