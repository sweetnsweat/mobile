import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Mail, Lock, Save, CheckCircle } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { getMyProfile, updateUserInfo, UserProfileResponse } from '../../services/UserService';
import { checkNickname } from '../../services/AuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const GENDER_LABEL: Record<string, string> = {
  MALE: '남성', FEMALE: '여성', OTHER: '기타',
};
const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '초급', INTERMEDIATE: '중급', ADVANCED: '고급',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '-'}</Text>
    </View>
  );
}

export function EditProfileScreen({ navigation }: Props) {
  const isAndroid = Platform.OS === 'android';

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'ok' | 'same' | 'taken'>('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const originalNickname = useRef('');

  useEffect(() => {
    setLoadingProfile(true);
    getMyProfile()
      .then(p => {
        setProfile(p);
        setNickname(p.nickname);
        setEmail((p as any).email ?? '');
        originalNickname.current = p.nickname;
        // 기존 닉네임은 확인 불필요
        setNicknameStatus('same');
      })
      .catch(() => setError('프로필을 불러오지 못했습니다.'))
      .finally(() => setLoadingProfile(false));
  }, []);

  async function handleCheckNickname() {
    const trimmed = nickname.trim();
    if (!trimmed) { setError('닉네임을 입력해주세요.'); return; }
    if (trimmed === originalNickname.current) {
      setNicknameStatus('same');
      return;
    }
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
  }

  async function handleSave() {
    const trimmedNick = nickname.trim();
    const trimmedEmail = email.trim();

    if (!trimmedNick) { setError('닉네임을 입력해주세요.'); return; }
    if (nicknameStatus === 'idle') { setError('닉네임 중복 확인을 해주세요.'); return; }
    if (nicknameStatus === 'taken') { setError('이미 사용 중인 닉네임입니다.'); return; }
    if (trimmedEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      setError('이메일 형식이 올바르지 않습니다.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await updateUserInfo({ nickname: trimmedNick, email: trimmedEmail || undefined });
      originalNickname.current = trimmedNick;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message ?? '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenBackground useGradient={!isAndroid}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <LinearGradient
          colors={['#ec4899', '#f43f5e']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.header}
        >
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>My Profile</Text>
            <Text style={s.headerTitle}>회원정보 수정</Text>
          </View>
        </LinearGradient>

        {loadingProfile ? (
          <View style={s.center}>
            <ActivityIndicator color="#ec4899" size="large" />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior="padding"
            enabled={Platform.OS === 'ios'}
            style={s.kav}
          >
            <ScrollView
              contentContainerStyle={s.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* 기본 정보 (읽기 전용) */}
              <View style={s.card}>
                <Text style={s.cardTitle}>기본 정보</Text>
                <View style={s.infoList}>
                  <InfoRow label="아이디" value={profile?.loginId ?? '-'} />
                  <InfoRow label="성별" value={GENDER_LABEL[profile?.gender ?? ''] ?? '-'} />
                  <InfoRow label="생년월일" value={profile?.birthDate ?? '-'} />
                  <InfoRow label="키" value={profile?.heightCm ? `${profile.heightCm} cm` : '-'} />
                  <InfoRow label="몸무게" value={profile?.weightKg ? `${profile.weightKg} kg` : '-'} />
                  <InfoRow label="운동 수준" value={LEVEL_LABEL[profile?.experienceLevel ?? ''] ?? '-'} />
                </View>
              </View>

              {/* 수정 가능 정보 */}
              <View style={s.card}>
                <Text style={s.cardTitle}>수정 가능한 정보</Text>

                {/* 닉네임 */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>닉네임</Text>
                  <View style={s.nicknameRow}>
                    <View style={[
                      s.inputRow,
                      s.nicknameInput,
                      nicknameStatus === 'ok' && s.inputOk,
                      nicknameStatus === 'same' && s.inputOk,
                      nicknameStatus === 'taken' && s.inputError,
                    ]}>
                      {!isAndroid && <User size={18} color="#f472b6" strokeWidth={2} />}
                      <TextInput
                        value={nickname}
                        onChangeText={t => {
                          setNickname(t);
                          setNicknameStatus(t.trim() === originalNickname.current ? 'same' : 'idle');
                          setError('');
                        }}
                        placeholder="닉네임"
                        placeholderTextColor="#9ca3af"
                        style={s.input}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        s.checkBtn,
                        (nicknameStatus === 'ok' || nicknameStatus === 'same') && s.checkBtnOk,
                      ]}
                      activeOpacity={0.8}
                      onPress={handleCheckNickname}
                      disabled={nicknameChecking || nicknameStatus === 'same'}
                    >
                      {nicknameChecking
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={s.checkBtnTxt}>
                            {nicknameStatus === 'ok' || nicknameStatus === 'same' ? '확인됨' : '중복 확인'}
                          </Text>
                      }
                    </TouchableOpacity>
                  </View>
                  {nicknameStatus === 'ok' && (
                    <Text style={s.fieldHintOk}>사용 가능한 닉네임입니다 ✓</Text>
                  )}
                  {nicknameStatus === 'taken' && (
                    <Text style={s.fieldHintErr}>이미 사용 중인 닉네임입니다</Text>
                  )}
                </View>

                {/* 이메일 */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>이메일</Text>
                  <View style={s.inputRow}>
                    {!isAndroid && <Mail size={18} color="#f472b6" strokeWidth={2} />}
                    <TextInput
                      value={email}
                      onChangeText={t => { setEmail(t); setError(''); }}
                      placeholder="이메일 주소"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      style={s.input}
                    />
                  </View>
                </View>

                {/* 비밀번호 */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>비밀번호</Text>
                  <TouchableOpacity
                    style={s.passwordResetBtn}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('AccountRecovery', { initialTab: 'password' })}
                  >
                    <Lock size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={s.passwordResetTxt}>임시 비밀번호로 재설정하기</Text>
                    <ChevronLeft size={14} color="#9ca3af" strokeWidth={2.5} style={s.chevronRight} />
                  </TouchableOpacity>
                  <Text style={s.passwordHint}>이메일로 임시 비밀번호를 받아 변경할 수 있습니다.</Text>
                </View>
              </View>

              {/* Error */}
              {error ? <Text style={s.errorText}>{error}</Text> : null}

              {/* Save button */}
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={saving}
                style={[s.saveWrap, isAndroid && s.saveWrapAndroid]}
              >
                {isAndroid ? (
                  <View style={[s.saveBtn, s.saveBtnAndroid]}>
                    {saving
                      ? <ActivityIndicator color="#fff" size="small" />
                      : saved
                        ? <><CheckCircle size={18} color="#fff" strokeWidth={2.5} /><Text style={s.saveTxt}>저장됐습니다</Text></>
                        : <><Save size={18} color="#fff" strokeWidth={2.5} /><Text style={s.saveTxt}>저장하기</Text></>
                    }
                  </View>
                ) : (
                  <LinearGradient
                    colors={saved ? ['#10b981', '#34d399'] : ['#f472b6', '#38bdf8']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.saveBtn}
                  >
                    {saving
                      ? <ActivityIndicator color="#fff" size="small" />
                      : saved
                        ? <><CheckCircle size={18} color="#fff" strokeWidth={2.5} /><Text style={s.saveTxt}>저장됐습니다</Text></>
                        : <><Save size={18} color="#fff" strokeWidth={2.5} /><Text style={s.saveTxt}>저장하기</Text></>
                    }
                  </LinearGradient>
                )}
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, gap: 12,
  },
  backBtn: {
    width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', marginRight: 32 },
  headerSub: { fontSize: 10, color: '#fce7f3', letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 17 },

  scroll: { padding: 16, gap: 16 },

  /* Card */
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 2, borderColor: '#fbcfe8',
    padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 6,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#ec4899', letterSpacing: 0.5, textTransform: 'uppercase' },

  /* Read-only info rows */
  infoList: { gap: 0 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#374151' },

  /* Field groups */
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280' },

  /* Input */
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f9fafb', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  input: { flex: 1, fontSize: 14, color: '#374151' },
  inputOk: { borderColor: '#10b981' },
  inputError: { borderColor: '#ef4444' },

  /* Nickname row */
  nicknameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nicknameInput: { flex: 1 },
  checkBtn: {
    backgroundColor: '#ec4899', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center', minWidth: 76,
  },
  checkBtnOk: { backgroundColor: '#10b981' },
  checkBtnTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  fieldHintOk: { fontSize: 11, fontWeight: '600', color: '#10b981' },
  fieldHintErr: { fontSize: 11, fontWeight: '600', color: '#ef4444' },

  /* Password reset */
  passwordResetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f9fafb', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  passwordResetTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: '#6b7280' },
  chevronRight: { transform: [{ rotate: '180deg' }] },
  passwordHint: { fontSize: 11, fontWeight: '600', color: '#9ca3af' },

  /* Save button */
  saveWrap: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  saveWrapAndroid: { shadowOpacity: 0, elevation: 0 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  saveBtnAndroid: { backgroundColor: '#ec4899' },
  saveTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },

  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center', fontWeight: '600' },
});
