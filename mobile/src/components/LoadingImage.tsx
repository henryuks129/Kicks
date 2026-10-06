import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageProps } from 'react-native';

type Props = ImageProps & { className?: string };

/** Keep the media frame in place while its pixels load, including on Android. */
export function LoadingImage(props: Props) {
 return <ImageFrame key={JSON.stringify(props.source)} {...props}/>;
}

function ImageFrame({ className, style, onLoadStart, onLoadEnd, onError, ...props }: Props) {
 const [loading, setLoading] = useState(true);
 const [failed, setFailed] = useState(false);
 const [attempt, setAttempt] = useState(0);
 return <View className={className} style={[{ overflow: 'hidden' }, style]}>
  <Image {...props} key={attempt} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} resizeMethod="resize"
   onLoadStart={() => { setLoading(true); setFailed(false); onLoadStart?.(); }}
   onError={event => { setFailed(true); setLoading(false); onError?.(event); }}
   onLoadEnd={() => { setLoading(false); onLoadEnd?.(); }}/>
  {loading && <View pointerEvents="none" style={StyleSheet.absoluteFillObject} className="items-center justify-center bg-background/80">
   <ActivityIndicator color="#b84c26" accessibilityLabel="Loading image"/>
  </View>}
  {failed && <Pressable accessibilityRole="button" accessibilityLabel="Image unavailable. Retry loading image" onPress={() => { setFailed(false); setLoading(true); setAttempt(value => value + 1); }} style={StyleSheet.absoluteFillObject} className="items-center justify-center bg-background px-2">
   <Text className="font-sans text-center text-sm text-foreground">Image unavailable</Text>
   <Text className="font-sans text-center text-sm text-primary">Tap to retry</Text>
  </Pressable>}
 </View>;
}
