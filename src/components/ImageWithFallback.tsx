import React, { useState } from 'react';
import { Image, View, ImageStyle, StyleProp } from 'react-native';

interface Props {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

export function ImageWithFallback({ uri, style, resizeMode = 'cover' }: Props) {
  const [error, setError] = useState(false);

  if (error || !uri || uri === 'YOUR_IMAGE_URL_HERE') {
    return <View style={[{ backgroundColor: '#e5e7eb' }, style as any]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setError(true)}
    />
  );
}
