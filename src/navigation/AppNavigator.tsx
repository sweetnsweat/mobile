import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types/navigation';
import { EmojiMapHeroScreen } from '../screens/EmojiMapHeroScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ConditionScreen } from '../screens/ConditionScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { StatisticsScreen } from '../screens/statistics/StatisticsScreen';
import { PushNotificationScreen } from '../screens/mypage/PushNotificationScreen';
import { RoutineSetupScreen } from '../screens/routine/RoutineSetupScreen';
import { RoutineCreateScreen } from '../screens/routine/RoutineCreateScreen';
import { CharacterQuestScreen } from '../screens/cheating/CharacterQuestScreen';
import { CharacterQuestScreen2 } from '../screens/cheating/CharacterQuestScreen2';
import { ExerciseListScreen } from '../screens/exercise/ExerciseListScreen';
import { ExerciseDetailScreen } from '../screens/exercise/ExerciseDetailScreen';
import { CharacterSelectScreen } from '../screens/cheating/CharacterSelectScreen';
import { BattleScreen } from '../screens/battle/BattleScreen';
import { MypageScreen } from '../screens/mypage/MypageScreen';
import { CharacterShopScreen } from '../screens/mypage/CharacterShopScreen';
import { WorldRankingScreen } from '../screens/world/WorldRankingScreen';
import { ActivityRankingDetailScreen } from '../screens/ActivityRankingDetailScreen';

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
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="RoutineSetup" component={RoutineSetupScreen} />
          <Stack.Screen name="RoutineCreate" component={RoutineCreateScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Condition" component={ConditionScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="Push" component={PushNotificationScreen} />
          <Stack.Screen name="CharacterQuest" component={CharacterQuestScreen} />
          <Stack.Screen name="CharacterQuest2" component={CharacterQuestScreen2} />
          <Stack.Screen name="Exercise" component={ExerciseListScreen} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
          <Stack.Screen name="CharacterSelect" component={CharacterSelectScreen} />
          <Stack.Screen name="Battle" component={BattleScreen} />
          <Stack.Screen name="Mypage" component={MypageScreen} />
          <Stack.Screen name="CharacterShop" component={CharacterShopScreen} />
          <Stack.Screen name="WorldRanking" component={WorldRankingScreen} />
          <Stack.Screen name="ActivityRankingDetail" component={ActivityRankingDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
