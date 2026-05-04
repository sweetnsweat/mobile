export type ExerciseDetailParams = {
  id: number;
  name: string;
  category: string;
  categoryDisplayName: string;
  level: string;
  levelDisplayName: string;
  equipment: string;
  met: number;
  estimatedKcalPerHour: number;
  primaryMuscles: string[];
  emoji: string;
  liked: boolean;
};

export type RootStackParamList = {
  EmojiMapHero: undefined;
  Auth: undefined;
  Onboarding: undefined;
  RoutineSetup: { todayConditionCompleted: boolean; hideSkip?: boolean };
  RoutineCreate: undefined;
  Home: undefined;
  Condition: undefined;
  Statistics: undefined;
  Push: undefined;
  CharacterQuest: { scenario_id?: number };
  CharacterQuest2: { scenario_id?: number; choices?: { id: number; text: string }[] };
  Exercise: undefined;
  ExerciseDetail: { exercise: ExerciseDetailParams };
  CharacterSelect: undefined;
  Battle: { myName: string; myImage: string; opponentName: string; opponentImage: string };
  Mypage: undefined;
  CharacterShop: undefined;
  WorldRanking: undefined;
  ActivityRankingDetail: undefined;
};
