import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, User, Mail, ArrowRight, Dumbbell, Heart, Zap } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { GradientText } from '../../components/GradientText';
import { ScreenBackground } from '../../components/ScreenBackground';
import { useBounceAnimation } from '../../hooks/useBounceAnimation';
import { login, signup, checkNickname } from '../../services/AuthService';
import { registerFcmTokenForCurrentUser } from '../../services/FcmService';
import { syncHealthDataWithServer } from '../../services/HealthConnectService';
import { getMyProfile } from '../../services/UserService';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation }: Props) {
  const isAndroid = Platform.OS === 'android';

  const [isLogin, setIsLogin] = useState(true);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'ok' | 'taken'>('idle');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const b1 = useBounceAnimation(3000);
  const b2 = useBounceAnimation(2500);
  const b3 = useBounceAnimation(3200);

  const titlePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(titlePulse, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(titlePulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim, titlePulse]);

  const syncHealthConnectAfterLogin = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const result = await syncHealthDataWithServer({ force: true });
      console.log('Health Connect server sync after login:', {
        grantedRecordTypes: result.grantedRecordTypes,
        deniedRecordTypes: result.deniedRecordTypes,
        sampleCount: result.sampleCount,
        skipped: result.skipped,
        reason: result.reason,
      });
    } catch (e) {
      console.warn(
        'Health Connect sync skipped after login:',
        e instanceof Error ? e.message : e,
      );
    }
  };

  const handleCheckNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) { setError('이름을 입력해주세요'); return; }
    setError('');
    setNicknameChecking(true);
    try {
      const result = await checkNickname(trimmed);
      setNicknameStatus(result.available ? 'ok' : 'taken');
    } catch (e: any) {
      setError(e?.message ?? '닉네임 확인 중 오류가 발생했습니다.');
    } finally {
      setNicknameChecking(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    // Validation
    if (!loginId.trim()) {
      setError('아이디를 입력해주세요');
      return;
    }
    if (!isLogin && !nickname.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    if (!isLogin && nicknameStatus === 'idle') {
      setError('닉네임 중복 확인을 해주세요');
      return;
    }
    if (!isLogin && nicknameStatus === 'taken') {
      setError('이미 사용 중인 닉네임입니다');
      return;
    }
    if (!isLogin && !trimmedEmail) {
      setError('이메일을 입력해주세요');
      return;
    }
    if (!isLogin && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      setError('이메일 형식이 올바르지 않습니다');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login API call
        await login(loginId, password);
        registerFcmTokenForCurrentUser();
        syncHealthConnectAfterLogin();
        const profile = await getMyProfile();
        if (!profile.onboardingCompleted) navigation.navigate('Onboarding');
        else if (profile.routineSetupRequired) navigation.navigate('RoutineSetup', { todayConditionCompleted: profile.todayConditionCompleted });
        else if (!profile.todayConditionCompleted) navigation.navigate('Condition');
        else navigation.navigate('Home');
      } else {
        // Signup API call
        const response = await signup(loginId, password, nickname, trimmedEmail);
        console.log('Signup success:', response.user);
        setIsLogin(true);
        setLoginId('');
        setPassword('');
        setNickname('');
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || '요청 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground useGradient={!isAndroid}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={isAndroid ? '#fdf2f8' : 'transparent'}
        translucent={!isAndroid}
      />
      <SafeAreaView style={s.safe}>
        {/* Floating icons */}
        {!isAndroid && (
          <>
            <Animated.View style={[s.fDumbbell, { transform: [{ translateY: b1 }] }]}>
              <Dumbbell size={32} color="#f9a8d4" strokeWidth={1.5} />
            </Animated.View>
            <Animated.View style={[s.fHeart, { transform: [{ translateY: b2 }] }]}>
              <Heart size={28} color="#7dd3fc" strokeWidth={1.5} />
            </Animated.View>
            <Animated.View style={[s.fZap, { transform: [{ translateY: b3 }] }]}>
              <Zap size={28} color="#f9a8d4" strokeWidth={1.5} />
            </Animated.View>
          </>
        )}

        <KeyboardAvoidingView
          behavior="padding"
          enabled={Platform.OS === 'ios'}
          style={s.kav}
        >
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <Animated.View style={[s.card, { opacity: fadeAnim }]}>
              {/* Title */}
              <View style={s.titleSection}>
                <Animated.View style={{ opacity: titlePulse }}>
                  {isAndroid ? (
                    <Text style={s.titleAndroid}>{isLogin ? 'Login' : 'Sign Up'}</Text>
                  ) : (
                    <GradientText colors={['#db2777', '#0284c7']} style={s.title}>{isLogin ? 'Login' : 'Sign Up'}</GradientText>
                  )}
                </Animated.View>
                <Text style={s.subtitle}>
                  {isLogin ? '로그인하고 여정을 이어가요 🚀' : '계정을 만들고 오늘부터 시작해요 🎉'}
                </Text>
              </View>

              {/* Inputs */}
              <View style={s.inputs}>
                <View style={s.inputRow}>
                  {!isAndroid && <User size={20} color="#f472b6" strokeWidth={2} />}
                  <TextInput
                    placeholder="아이디"
                    placeholderTextColor="#9ca3af"
                    value={loginId}
                    onChangeText={setLoginId}
                    autoCapitalize="none"
                    style={s.input}
                  />
                </View>
                {!isLogin && (
                  <>
                    <View style={s.nicknameGroup}>
                      <View style={[s.inputRow, s.nicknameInput, nicknameStatus === 'ok' && s.inputOk, nicknameStatus === 'taken' && s.inputTaken]}>
                        {!isAndroid && <User size={20} color="#f472b6" strokeWidth={2} />}
                        <TextInput
                          placeholder="이름 (닉네임)"
                          placeholderTextColor="#9ca3af"
                          value={nickname}
                          onChangeText={t => { setNickname(t); setNicknameStatus('idle'); setError(''); }}
                          style={s.input}
                        />
                      </View>
                      <TouchableOpacity
                        style={[s.checkBtn, nicknameStatus === 'ok' && s.checkBtnOk]}
                        activeOpacity={0.8}
                        onPress={handleCheckNickname}
                        disabled={nicknameChecking}
                      >
                        {nicknameChecking
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={s.checkBtnTxt}>
                              {nicknameStatus === 'ok' ? '확인됨' : '중복 확인'}
                            </Text>
                        }
                      </TouchableOpacity>
                    </View>
                    {nicknameStatus === 'ok' && (
                      <Text style={s.nickOkTxt}>사용 가능한 닉네임입니다 ✓</Text>
                    )}
                    {nicknameStatus === 'taken' && (
                      <Text style={s.nickTakenTxt}>이미 사용 중인 닉네임입니다</Text>
                    )}
                    <View style={s.inputRow}>
                      {!isAndroid && <Mail size={20} color="#f472b6" strokeWidth={2} />}
                      <TextInput
                        placeholder="Email"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        style={s.input}
                      />
                    </View>
                  </>
                )}
                <View style={s.inputRow}>
                  {!isAndroid && <Lock size={20} color="#f472b6" strokeWidth={2} />}
                  <TextInput
                    placeholder="비밀번호"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={s.input}
                  />
                </View>
              </View>

              {/* Error message */}
              {error ? <Text style={s.errorText}>{error}</Text> : null}

              {/* Submit button */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.85}
                style={[s.btnWrap, isAndroid && s.btnWrapAndroid]}
                disabled={loading}
              >
                {isAndroid ? (
                  <View style={[s.btn, s.btnAndroid]}>
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={s.btnText}>{isLogin ? '로그인하기' : '회원가입하기'}</Text>
                    )}
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#f472b6', '#38bdf8']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.btn}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={s.btnText}>{isLogin ? '로그인하기' : '회원가입하기'}</Text>
                        <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                      </>
                    )}
                  </LinearGradient>
                )}
              </TouchableOpacity>

              {/* Toggle */}
              <View style={s.toggleRow}>
                <Text style={s.toggleLabel}>
                  {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                </Text>
                <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); setNicknameStatus('idle'); }}>
                  <Text style={s.toggleBtn}>{isLogin ? '회원가입' : '로그인'}</Text>
                </TouchableOpacity>
              </View>

              {/* Account recovery link — 로그인 탭에서만 표시 */}
              {isLogin && (
                <TouchableOpacity
                  style={s.recoveryRow}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('AccountRecovery')}
                >
                  <Text style={s.recoveryTxt}>아이디 · 비밀번호 찾기</Text>
                </TouchableOpacity>
              )}

              {/* Bottom tagline */}
              <Text style={s.tagline}>운동을 습관이 아닌 게임처럼 🎮</Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  kav:  { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },

  /* Floating icons */
  fDumbbell: { position: 'absolute', top: 80, left: 24 },
  fHeart:    { position: 'absolute', bottom: 120, right: 24 },
  fZap:      { position: 'absolute', top: '50%', left: 4 },

  /* Card */
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 2, borderColor: '#fbcfe8',
    padding: 24, gap: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },

  /* Title */
  titleSection: { alignItems: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  titleAndroid: { fontSize: 28, fontWeight: '800', color: '#db2777' },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center' },

  /* Inputs */
  inputs: { gap: 16 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f9fafb', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  input: { flex: 1, fontSize: 14, color: '#374151' },

  /* Button */
  btnWrap: { borderRadius: 12, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  btnWrapAndroid: { shadowOpacity: 0, elevation: 0 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  btnAndroid: { backgroundColor: '#ec4899' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* Toggle */
  toggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 14, color: '#4b5563' },
  toggleBtn: { fontSize: 14, color: '#ec4899', fontWeight: '700' },

  tagline: { fontSize: 11, color: '#6b7280', fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },
  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: -8 },

  recoveryRow: { alignItems: 'center' },
  recoveryTxt: { fontSize: 12, color: '#9ca3af', fontWeight: '600', textDecorationLine: 'underline' },

  /* Nickname duplicate check */
  nicknameGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nicknameInput: { flex: 1 },
  inputOk: { borderColor: '#10b981' },
  inputTaken: { borderColor: '#ef4444' },
  checkBtn: { backgroundColor: '#ec4899', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', minWidth: 76 },
  checkBtnOk: { backgroundColor: '#10b981' },
  checkBtnTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  nickOkTxt: { fontSize: 11, fontWeight: '600', color: '#10b981', marginTop: -8 },
  nickTakenTxt: { fontSize: 11, fontWeight: '600', color: '#ef4444', marginTop: -8 },
});
