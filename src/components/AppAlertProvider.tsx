import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AlertButton,
  AlertOptions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AlertCircle } from 'lucide-react-native';

interface AlertState {
  title?: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
}

function normalizeButtons(buttons?: AlertButton[]): AlertButton[] {
  if (!buttons || buttons.length === 0) {
    return [{ text: '확인' }];
  }
  return buttons;
}

function isPrimaryButton(button: AlertButton, index: number, total: number): boolean {
  return button.style !== 'cancel' && (button.style === 'destructive' || index === total - 1);
}

function buttonText(button: AlertButton): string {
  return button.text || '확인';
}

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const originalAlertRef = useRef(Alert.alert);

  useEffect(() => {
    Alert.alert = (
      title?: string,
      message?: string,
      buttons?: AlertButton[],
      options?: AlertOptions,
    ) => {
      setAlertState({
        title,
        message,
        buttons: normalizeButtons(buttons),
        options,
      });
    };

    return () => {
      Alert.alert = originalAlertRef.current;
    };
  }, []);

  const closeAlert = () => {
    setAlertState(null);
  };

  const handleBackdropPress = () => {
    if (alertState?.options?.cancelable === false) return;
    const cancelButton = alertState?.buttons.find(button => button.style === 'cancel');
    closeAlert();
    cancelButton?.onPress?.();
  };

  const handleButtonPress = (button: AlertButton) => {
    closeAlert();
    button.onPress?.();
  };

  const buttons = alertState?.buttons ?? [];
  const stacked = buttons.length > 2;

  return (
    <>
      {children}
      <Modal
        visible={Boolean(alertState)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleBackdropPress}
      >
        <View style={s.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
          <View style={s.card}>
            <LinearGradient
              colors={['#ec4899', '#0ea5e9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.iconWrap}
            >
              <AlertCircle size={24} color="#fff" strokeWidth={2.5} />
            </LinearGradient>

            {alertState?.title ? (
              <Text style={s.title}>{alertState.title}</Text>
            ) : null}
            {alertState?.message ? (
              <Text style={s.message}>{alertState.message}</Text>
            ) : null}

            <View style={[s.actions, stacked && s.actionsStacked]}>
              {buttons.map((button, index) => {
                const primary = isPrimaryButton(button, index, buttons.length);
                const destructive = button.style === 'destructive';
                return (
                  <TouchableOpacity
                    key={`${buttonText(button)}-${index}`}
                    activeOpacity={0.85}
                    onPress={() => handleButtonPress(button)}
                    style={[
                      s.actionButton,
                      stacked && s.actionButtonStacked,
                      !primary && s.secondaryButton,
                    ]}
                  >
                    {primary ? (
                      <LinearGradient
                        colors={destructive ? ['#ef4444', '#f97316'] : ['#ec4899', '#0ea5e9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.primaryFill}
                      >
                        <Text style={s.primaryText}>{buttonText(button)}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={s.secondaryText}>{buttonText(button)}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbcfe8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#4b5563',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionButtonStacked: {
    width: '100%',
    flex: 0,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  primaryFill: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6b7280',
  },
});
