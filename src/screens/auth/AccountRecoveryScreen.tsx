import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { GradientText } from '../../components/GradientText';
import { ScreenBackground } from '../../components/ScreenBackground';
import { useBounceAnimation } from '../../hooks/useBounceAnimation';
import { findLoginId, requestPasswordReset } from '../../services/AuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountRecovery'>;
type Tab = 'id' | 'password';

export function AccountRecoveryScreen({ navigation, route }: Props) {
  const isAndroid = Platform.OS === 'android';

  const [tab, setTab] = useState<Tab>(route.params?.initialTab ?? 'id');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const b1 = useBounceAnimation(3000);
  const b2 = useBounceAnimation(2500);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // 탭 전환 시 입력/상태 초기화
  function switchTab(next: Tab) {
    if (tab === next) return;
    setTab(next);
    setEmail('');
    setError('');
    setSuccess(false);
  }

  async function handleSubmit() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError('이메일 형식이 올바르지 않습니다.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (tab === 'id') {
        await findLoginId(trimmed);
      } else {
        await requestPasswordReset(trimmed);
      }
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message ?? '요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const successMessage =
    tab === 'id'
      ? '아이디 안내 메일을 발송했습니다.\n이메일을 확인해주세요.'
      : '임시 비밀번호를 이메일로 발송했습니다.\n메일로 받은 임시 비밀번호로 로그인해 주세요.';

  return (
    <ScreenBackground useGradient={!isAndroid}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={isAndroid ? '#fdf2f8' : 'transparent'}
        translucent={!isAndroid}
      />
      <SafeAreaView style={s.safe}>
        {/* Floating decorations */}
        {!isAndroid && (
          <>
            <Animated.View style={[s.fDeco1, { transform: [{ translateY: b1 }] }]}>
              <Mail size={30} color="#f9a8d4" strokeWidth={1.5} />
            </Animated.View>
            <Animated.View style={[s.fDeco2, { transform: [{ translateY: b2 }] }]}>
              <CheckCircle size={26} color="#7dd3fc" strokeWidth={1.5} />
            </Animated.View>
          </>
        )}

        <KeyboardAvoidingView
          behavior="padding"
          enabled={Platform.OS === 'ios'}
          style={s.kav}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[s.card, { opacity: fadeAnim }]}>
              {/* Back button */}
              <TouchableOpacity
                style={s.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronLeft size={18} color="#9ca3af" strokeWidth={2.5} />
                <Text style={s.backTxt}>로그인으로</Text>
              </TouchableOpacity>

              {/* Title */}
              <View style={s.titleSection}>
                {isAndroid ? (
                  <Text style={s.titleAndroid}>계정 찾기</Text>
                ) : (
                  <GradientText colors={['#db2777', '#0284c7']} style={s.title}>
                    계정 찾기
                  </GradientText>
                )}
                <Text style={s.subtitle}>이메일로 계정을 복구할 수 있어요 📬</Text>
              </View>

              {/* Tabs */}
              <View style={s.tabs}>
                <TouchableOpacity
                  style={[s.tabItem, tab === 'id' && s.tabItemActive]}
                  activeOpacity={0.8}
                  onPress={() => switchTab('id')}
                >
                  <Text style={[s.tabTxt, tab === 'id' && s.tabTxtActive]}>아이디 찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.tabItem, tab === 'password' && s.tabItemActive]}
                  activeOpacity={0.8}
                  onPress={() => switchTab('password')}
                >
                  <Text style={[s.tabTxt, tab === 'password' && s.tabTxtActive]}>비밀번호 찾기</Text>
                </TouchableOpacity>
              </View>

              {/* Description */}
              <Text style={s.desc}>
                {tab === 'id'
                  ? '가입 시 사용한 이메일을 입력하면 아이디를 메일로 안내해드립니다.'
                  : '가입 시 사용한 이메일을 입력하면 \n 임시 비밀번호를 메일로 보내드립니다.'}
              </Text>

              {/* Success state */}
              {success ? (
                <View style={s.successBox}>
                  <CheckCircle size={32} color="#10b981" strokeWidth={2} />
                  <Text style={s.successTxt}>{successMessage}</Text>
                  {tab === 'password' && (
                    <TouchableOpacity
                      style={s.goLoginBtnWrap}
                      activeOpacity={0.85}
                      onPress={() => navigation.goBack()}
                    >
                      {isAndroid ? (
                        <View style={[s.btn, s.btnAndroid]}>
                          <Text style={s.btnText}>로그인하러 가기</Text>
                        </View>
                      ) : (
                        <LinearGradient
                          colors={['#f472b6', '#38bdf8']}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={s.btn}
                        >
                          <Text style={s.btnText}>로그인하러 가기</Text>
                          <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  )}
                  {tab === 'id' && (
                    <TouchableOpacity
                      onPress={() => { setSuccess(false); setEmail(''); }}
                      activeOpacity={0.7}
                    >
                      <Text style={s.retryTxt}>다시 입력하기</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <>
                  {/* Email input */}
                  <View style={s.inputs}>
                    <View style={s.inputRow}>
                      {!isAndroid && <Mail size={20} color="#f472b6" strokeWidth={2} />}
                      <TextInput
                        placeholder="가입한 이메일 주소"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={t => { setEmail(t); setError(''); }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        style={s.input}
                      />
                    </View>
                  </View>

                  {/* Error */}
                  {error ? <Text style={s.errorText}>{error}</Text> : null}

                  {/* Submit */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                    style={[s.btnWrap, isAndroid && s.btnWrapAndroid]}
                    disabled={loading}
                  >
                    {isAndroid ? (
                      <View style={[s.btn, s.btnAndroid]}>
                        {loading
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={s.btnText}>
                              {tab === 'id' ? '아이디 찾기' : '임시 비밀번호 발급'}
                            </Text>
                        }
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
                            <Text style={s.btnText}>
                              {tab === 'id' ? '아이디 찾기' : '임시 비밀번호 발급'}
                            </Text>
                            <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                          </>
                        )}
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </>
              )}

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
  kav: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },

  fDeco1: { position: 'absolute', top: 80, left: 24 },
  fDeco2: { position: 'absolute', bottom: 120, right: 24 },

  /* Card — 동일한 카드 스타일 */
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 2, borderColor: '#fbcfe8',
    padding: 24, gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },

  /* Back */
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  backTxt: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },

  /* Title */
  titleSection: { alignItems: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  titleAndroid: { fontSize: 28, fontWeight: '800', color: '#db2777' },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center' },

  /* Tabs */
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1, paddingVertical: 9, borderRadius: 9,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  tabTxt: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  tabTxtActive: { color: '#ec4899' },

  /* Description */
  desc: { fontSize: 12, color: '#6b7280', lineHeight: 18, textAlign: 'center' },

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
  btnWrap: {
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  btnWrapAndroid: { shadowOpacity: 0, elevation: 0 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  btnAndroid: { backgroundColor: '#ec4899' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* Success */
  successBox: { alignItems: 'center', gap: 14, paddingVertical: 8 },
  successTxt: { fontSize: 14, color: '#374151', fontWeight: '600', textAlign: 'center', lineHeight: 22 },
  goLoginBtnWrap: {
    width: '100%', borderRadius: 12, overflow: 'hidden',
    shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  retryTxt: { fontSize: 13, fontWeight: '700', color: '#ec4899' },

  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: -4 },
  tagline: { fontSize: 11, color: '#6b7280', fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },
});
