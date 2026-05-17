import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { subscribeFcmTokenRefresh } from './src/services/FcmService';

export default function App() {
  useEffect(() => {
    return subscribeFcmTokenRefresh();
  }, []);

  return <AppNavigator />;
}
