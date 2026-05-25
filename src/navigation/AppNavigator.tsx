import React from 'react';
import { StyleSheet } from 'react-native';
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
import { BattleLobbyScreen } from '../screens/battle/BattleLobbyScreen';
import { BattleMatchingScreen } from '../screens/battle/BattleMatchingScreen';
import { BattleScreen } from '../screens/battle/BattleScreen';
import { BattleResultScreen } from '../screens/battle/BattleResultScreen';
import { MypageScreen } from '../screens/mypage/MypageScreen';
import { ShopScreen } from '../screens/mypage/ShopScreen';
import { WorldRankingScreen } from '../screens/world/WorldRankingScreen';
import { WorldIntroScreen } from '../screens/world/WorldIntroScreen';
import { ActivityRankingDetailScreen } from '../screens/ActivityRankingDetailScreen';
import { StoryChatListScreen } from '../screens/story/StoryChatListScreen';
import { AccountRecoveryScreen } from '../screens/auth/AccountRecoveryScreen';
import { EditProfileScreen } from '../screens/mypage/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/mypage/ChangePasswordScreen';
import { BadgeListScreen } from '../screens/mypage/BadgeListScreen';
import { flushPendingNavigation, navigationRef } from './NavigationService';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <SafeAreaProvider style={s.root}>
      <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation}>
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
          <Stack.Screen name="WorldIntro" component={WorldIntroScreen} />
          <Stack.Screen name="CharacterQuest2" component={CharacterQuestScreen2} />
          <Stack.Screen name="Exercise" component={ExerciseListScreen} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
          <Stack.Screen name="CharacterSelect" component={CharacterSelectScreen} />
          <Stack.Screen name="BattleLobby" component={BattleLobbyScreen} />
          <Stack.Screen name="BattleMatching" component={BattleMatchingScreen} />
          <Stack.Screen name="Battle" component={BattleScreen} />
          <Stack.Screen name="BattleResult" component={BattleResultScreen} />
          <Stack.Screen name="Mypage" component={MypageScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="WorldRanking" component={WorldRankingScreen} />
          <Stack.Screen name="ActivityRankingDetail" component={ActivityRankingDetailScreen} />
          <Stack.Screen name="StoryChatList" component={StoryChatListScreen} />
          <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="BadgeList" component={BadgeListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});
