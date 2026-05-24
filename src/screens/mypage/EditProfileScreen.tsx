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
import { getMyProfile, updateUserInfo, UserGender, UserProfileResponse } from '../../services/UserService';
import { checkNickname } from '../../services/AuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

interface WheelPickerProps {
  items: string[];
  initialIndex: number;
  onChange: (index: number) => void;
}

function WheelPicker({ items, initialIndex, onChange }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  useEffect(() => {
    setActiveIdx(initialIndex);
    scrollRef.current?.scrollTo({ y: initialIndex * ITEM_H, animated: false });
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: initialIndex * ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, [initialIndex]);

  const onScrollEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(Math.round(y / ITEM_H), items.length - 1));
    setActiveIdx(idx);
    onChange(idx);
  };

  return (
    <View style={wp.wrap}>
      <View style={wp.highlight} />
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
      >
        {items.map((item, i) => (
          <View key={item} style={wp.item}>
            <Text style={[wp.txt, activeIdx === i && wp.txtActive]}>{item}</Text>
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={wp.fadeTop} />
      <View pointerEvents="none" style={wp.fadeBottom} />
    </View>
  );
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, i) => String(1940 + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const DEFAULT_YEAR_IDX = Math.max(0, YEARS.indexOf('1990'));
const DEFAULT_MONTH_IDX = 0;
const DEFAULT_DAY_IDX = 0;

const GENDER_OPTIONS: { value: UserGender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'prefer_not_to_say', label: '선택 안 함' },
];
const GENDER_LABEL: Record<string, string> = {
  male: '남성',
  female: '여성',
  prefer_not_to_say: '선택 안 함',
  MALE: '남성',
  FEMALE: '여성',
  OTHER: '기타',
};
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function readGender(value?: string | null): UserGender | '' {
  if (!value) return '';
  const normalized = value.toLowerCase();
  if (normalized === 'male' || normalized === 'female' || normalized === 'prefer_not_to_say') {
    return normalized;
  }
  return '';
}

function isValidPastBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

function normalizeBirthDate(value?: string | number[] | null): string {
  if (!value) return '';

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  const matched = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return matched ? `${matched[1]}-${matched[2]}-${matched[3]}` : '';
}

function getBirthDateIndices(value?: string | number[] | null): { year: number; month: number; day: number; hasValue: boolean } {
  const normalized = normalizeBirthDate(value);
  if (!normalized || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return {
      year: DEFAULT_YEAR_IDX,
      month: DEFAULT_MONTH_IDX,
      day: DEFAULT_DAY_IDX,
      hasValue: false,
    };
  }
  const [year, month, day] = normalized.split('-');
  const yearIndex = YEARS.indexOf(year);
  const monthIndex = MONTHS.indexOf(month);
  const dayIndex = DAYS.indexOf(day);

  if (yearIndex < 0 || monthIndex < 0 || dayIndex < 0) {
    return {
      year: DEFAULT_YEAR_IDX,
      month: DEFAULT_MONTH_IDX,
      day: DEFAULT_DAY_IDX,
      hasValue: false,
    };
  }

  return {
    year: yearIndex,
    month: monthIndex,
    day: dayIndex,
    hasValue: true,
  };
}

export function EditProfileScreen({ navigation }: Props) {
  const isAndroid = Platform.OS === 'android';

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<UserGender | ''>('');
  const [birthYearIdx, setBirthYearIdx] = useState(DEFAULT_YEAR_IDX);
  const [birthMonthIdx, setBirthMonthIdx] = useState(DEFAULT_MONTH_IDX);
  const [birthDayIdx, setBirthDayIdx] = useState(DEFAULT_DAY_IDX);
  const [birthDateEnabled, setBirthDateEnabled] = useState(false);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'ok' | 'same' | 'taken'>('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const originalNickname = useRef('');

  useEffect(() => {
    console.log('[EditProfile] screen opened');
    setLoadingProfile(true);
    console.log('[EditProfile] getMyProfile request');
    getMyProfile()
      .then(p => {
        console.log('[EditProfile] getMyProfile response', JSON.stringify(p, null, 2));
        setProfile(p);
        setNickname(p.nickname);
        setEmail(p.email ?? '');
        setGender(readGender(p.gender));
        const birth = getBirthDateIndices(p.birthDate);
        setBirthYearIdx(birth.year);
        setBirthMonthIdx(birth.month);
        setBirthDayIdx(birth.day);
        setBirthDateEnabled(birth.hasValue);
        setHeightCm(p.heightCm != null ? String(p.heightCm) : '');
        setWeightKg(p.weightKg != null ? String(p.weightKg) : '');
        originalNickname.current = p.nickname;
        // 기존 닉네임은 확인 불필요
        setNicknameStatus('same');
      })
      .catch(e => {
        console.log('[EditProfile] getMyProfile failed', e?.response?.data ?? e?.message ?? e);
        throw e;
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
    const selectedBirthDate = birthDateEnabled
      ? `${YEARS[birthYearIdx]}-${MONTHS[birthMonthIdx]}-${DAYS[birthDayIdx]}`
      : '';
    const trimmedHeight = heightCm.trim();
    const trimmedWeight = weightKg.trim();

    if (!trimmedNick) { setError('닉네임을 입력해주세요.'); return; }
    if (nicknameStatus === 'idle') { setError('닉네임 중복 확인을 해주세요.'); return; }
    if (nicknameStatus === 'taken') { setError('이미 사용 중인 닉네임입니다.'); return; }
    if (trimmedEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      setError('이메일 형식이 올바르지 않습니다.');
      return;
    }
    if (selectedBirthDate && !isValidPastBirthDate(selectedBirthDate)) {
      setError('생년월일은 YYYY-MM-DD 형식의 과거 날짜로 입력해주세요.');
      return;
    }
    const parsedHeight = trimmedHeight ? Number(trimmedHeight) : undefined;
    const parsedWeight = trimmedWeight ? Number(trimmedWeight) : undefined;
    if (parsedHeight !== undefined && (!Number.isFinite(parsedHeight) || parsedHeight < 50 || parsedHeight > 250)) {
      setError('키는 50.0~250.0cm 범위로 입력해주세요.');
      return;
    }
    if (parsedWeight !== undefined && (!Number.isFinite(parsedWeight) || parsedWeight < 20 || parsedWeight > 300)) {
      setError('몸무게는 20.0~300.0kg 범위로 입력해주세요.');
      return;
    }

    setError('');
    setSaving(true);
    const payload = {
      nickname: trimmedNick,
      email: trimmedEmail || undefined,
      gender: gender || undefined,
      birthDate: selectedBirthDate || undefined,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
    };
    try {
      const updated = await updateUserInfo(payload);
      setProfile(updated);
      originalNickname.current = trimmedNick;
      navigation.goBack();
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

                {/* 성별 */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>성별</Text>
                  <View style={s.segmentRow}>
                    {GENDER_OPTIONS.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={[s.segmentItem, gender === option.value && s.segmentItemActive]}
                        activeOpacity={0.8}
                        onPress={() => { setGender(option.value); setError(''); }}
                      >
                        <Text style={[s.segmentTxt, gender === option.value && s.segmentTxtActive]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {gender ? <Text style={s.fieldHint}>현재 선택: {GENDER_LABEL[gender]}</Text> : null}
                </View>

                {/* 생년월일 */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>생년월일</Text>
                  <View style={s.birthPickerRow}>
                    <WheelPicker
                      items={YEARS}
                      initialIndex={birthYearIdx}
                      onChange={idx => {
                        setBirthDateEnabled(true);
                        setBirthYearIdx(idx);
                        setError('');
                      }}
                    />
                    <Text style={s.pickerUnit}>년</Text>
                    <WheelPicker
                      items={MONTHS}
                      initialIndex={birthMonthIdx}
                      onChange={idx => {
                        setBirthDateEnabled(true);
                        setBirthMonthIdx(idx);
                        setError('');
                      }}
                    />
                    <Text style={s.pickerUnit}>월</Text>
                    <WheelPicker
                      items={DAYS}
                      initialIndex={birthDayIdx}
                      onChange={idx => {
                        setBirthDateEnabled(true);
                        setBirthDayIdx(idx);
                        setError('');
                      }}
                    />
                    <Text style={s.pickerUnit}>일</Text>
                  </View>
                  <Text style={s.fieldHint}>
                    선택값: {birthDateEnabled ? `${YEARS[birthYearIdx]}-${MONTHS[birthMonthIdx]}-${DAYS[birthDayIdx]}` : '미설정'}
                  </Text>
                </View>

                {/* 키 / 몸무게 */}
                <View style={s.measureRow}>
                  <View style={[s.fieldGroup, s.measureField]}>
                    <Text style={s.fieldLabel}>키</Text>
                    <View style={s.inputRow}>
                      <TextInput
                        value={heightCm}
                        onChangeText={t => { setHeightCm(t); setError(''); }}
                        placeholder="cm"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        style={s.input}
                      />
                      <Text style={s.unitTxt}>cm</Text>
                    </View>
                  </View>
                  <View style={[s.fieldGroup, s.measureField]}>
                    <Text style={s.fieldLabel}>몸무게</Text>
                    <View style={s.inputRow}>
                      <TextInput
                        value={weightKg}
                        onChangeText={t => { setWeightKg(t); setError(''); }}
                        placeholder="kg"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        style={s.input}
                      />
                      <Text style={s.unitTxt}>kg</Text>
                    </View>
                  </View>
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
  unitTxt: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },

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
  fieldHint: { fontSize: 11, fontWeight: '600', color: '#9ca3af' },

  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  segmentTxt: { fontSize: 12, fontWeight: '800', color: '#9ca3af' },
  segmentTxtActive: { color: '#ec4899' },

  birthPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickerUnit: { fontSize: 13, color: '#6b7280', fontWeight: '600' },

  measureRow: { flexDirection: 'row', gap: 10 },
  measureField: { flex: 1 },

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

const wp = StyleSheet.create({
  wrap: { height: ITEM_H * VISIBLE, flex: 1, overflow: 'hidden' },
  highlight: {
    position: 'absolute',
    top: PAD,
    left: 4,
    right: 4,
    height: ITEM_H,
    backgroundColor: '#fdf2f8',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#fbcfe8',
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  txt: { fontSize: 15, color: '#9ca3af', fontWeight: '400' },
  txtActive: { fontSize: 17, color: '#ec4899', fontWeight: '700' },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PAD,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PAD,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
});
