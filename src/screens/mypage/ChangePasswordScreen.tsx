import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle, Lock, Save } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { changePassword } from '../../services/AuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: Props) {
  const isAndroid = Platform.OS === 'android';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const current = currentPassword.trim();
    const next = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!current) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (next.length < 8 || next.length > 72) {
      setError('새 비밀번호는 8~72자로 입력해주세요.');
      return;
    }
    if (next !== confirm) {
      setError('새 비밀번호와 확인값이 일치하지 않습니다.');
      return;
    }
    if (current === next) {
      setError('새 비밀번호는 현재 비밀번호와 다르게 입력해주세요.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await changePassword(current, next);
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigation.goBack(), 700);
    } catch (e: any) {
      setError(e?.message ?? '비밀번호 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenBackground useGradient={!isAndroid}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <LinearGradient
          colors={['#ec4899', '#f43f5e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
            <Text style={s.headerSub}>Account</Text>
            <Text style={s.headerTitle}>비밀번호 변경</Text>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === 'ios'} style={s.kav}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <View style={s.card}>
              <View style={s.titleRow}>
                <View style={s.titleIcon}>
                  <Lock size={18} color="#ec4899" strokeWidth={2.5} />
                </View>
                <View style={s.titleText}>
                  <Text style={s.cardTitle}>새 비밀번호 설정</Text>
                  <Text style={s.cardDesc}>현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.</Text>
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>현재 비밀번호</Text>
                <View style={s.inputRow}>
                  {!isAndroid && <Lock size={18} color="#f472b6" strokeWidth={2} />}
                  <TextInput
                    value={currentPassword}
                    onChangeText={text => { setCurrentPassword(text); setError(''); setSaved(false); }}
                    placeholder="현재 비밀번호"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    textContentType="password"
                    style={s.input}
                  />
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>새 비밀번호</Text>
                <View style={s.inputRow}>
                  {!isAndroid && <Lock size={18} color="#f472b6" strokeWidth={2} />}
                  <TextInput
                    value={newPassword}
                    onChangeText={text => { setNewPassword(text); setError(''); setSaved(false); }}
                    placeholder="8~72자"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    textContentType="newPassword"
                    style={s.input}
                  />
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>새 비밀번호 확인</Text>
                <View style={[
                  s.inputRow,
                  confirmPassword.length > 0 && newPassword === confirmPassword && s.inputOk,
                  confirmPassword.length > 0 && newPassword !== confirmPassword && s.inputError,
                ]}>
                  {!isAndroid && <CheckCircle size={18} color="#f472b6" strokeWidth={2} />}
                  <TextInput
                    value={confirmPassword}
                    onChangeText={text => { setConfirmPassword(text); setError(''); setSaved(false); }}
                    placeholder="새 비밀번호 다시 입력"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    textContentType="newPassword"
                    style={s.input}
                  />
                </View>
              </View>

              {error ? <Text style={s.errorText}>{error}</Text> : null}
              {saved ? <Text style={s.successText}>비밀번호가 변경되었습니다.</Text> : null}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
              style={[s.saveWrap, isAndroid && s.saveWrapAndroid]}
            >
              {isAndroid ? (
                <View style={[s.saveBtn, s.saveBtnAndroid]}>
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : saved ? (
                    <>
                      <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
                      <Text style={s.saveTxt}>변경 완료</Text>
                    </>
                  ) : (
                    <>
                      <Save size={18} color="#fff" strokeWidth={2.5} />
                      <Text style={s.saveTxt}>변경하기</Text>
                    </>
                  )}
                </View>
              ) : (
                <LinearGradient
                  colors={saved ? ['#10b981', '#34d399'] : ['#f472b6', '#38bdf8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.saveBtn}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : saved ? (
                    <>
                      <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
                      <Text style={s.saveTxt}>변경 완료</Text>
                    </>
                  ) : (
                    <>
                      <Save size={18} color="#fff" strokeWidth={2.5} />
                      <Text style={s.saveTxt}>변경하기</Text>
                    </>
                  )}
                </LinearGradient>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  backBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', marginRight: 32 },
  headerSub: { fontSize: 10, color: '#fce7f3', letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 17 },
  scroll: { flexGrow: 1, padding: 16, justifyContent: 'center', gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fbcfe8',
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  titleRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  titleIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fdf2f8', alignItems: 'center', justifyContent: 'center' },
  titleText: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#111827' },
  cardDesc: { fontSize: 12, fontWeight: '600', color: '#9ca3af', lineHeight: 17 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  inputOk: { borderColor: '#10b981' },
  inputError: { borderColor: '#ef4444' },
  input: { flex: 1, fontSize: 14, color: '#374151' },
  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center', fontWeight: '600' },
  successText: { fontSize: 12, color: '#10b981', textAlign: 'center', fontWeight: '700' },
  saveWrap: { borderRadius: 14, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  saveWrapAndroid: { shadowOpacity: 0, elevation: 0 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14 },
  saveBtnAndroid: { backgroundColor: '#ec4899' },
  saveTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
