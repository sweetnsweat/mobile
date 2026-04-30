import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types/navigation';
import { EmojiMapHeroScreen } from '../screens/EmojiMapHeroScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ChecklistScreen } from '../screens/ChecklistScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { PushNotificationScreen } from '../screens/PushNotificationScreen';
import { CharacterQuestScreen } from '../screens/CharacterQuestScreen';
import { CharacterQuestScreen2 } from '../screens/CharacterQuestScreen2';
import { ExerciseListScreen } from '../screens/ExerciseListScreen';
import { CharacterSelectScreen } from '../screens/CharacterSelectScreen';
import { BattleScreen } from '../screens/BattleScreen';
import { MypageScreen } from '../screens/MypageScreen';
import { CharacterShopScreen } from '../screens/CharacterShopScreen';
import { WorldRankingScreen } from '../screens/WorldRankingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="EmojiMapHero"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="EmojiMapHero" component={EmojiMapHeroScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Checklist" component={ChecklistScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="Push" component={PushNotificationScreen} />
          <Stack.Screen name="CharacterQuest" component={CharacterQuestScreen} />
          <Stack.Screen name="CharacterQuest2" component={CharacterQuestScreen2} />
          <Stack.Screen name="Exercise" component={ExerciseListScreen} />
          <Stack.Screen name="CharacterSelect" component={CharacterSelectScreen} />
          <Stack.Screen name="Battle" component={BattleScreen} />
          <Stack.Screen name="Mypage" component={MypageScreen} />
          <Stack.Screen name="CharacterShop" component={CharacterShopScreen} />
          <Stack.Screen name="WorldRanking" component={WorldRankingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
