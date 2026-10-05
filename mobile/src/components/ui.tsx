import { Pressable, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
export function Button({ children, onPress, disabled = false, outline = false, label }: { children: string; onPress: () => void; disabled?: boolean; outline?: boolean; label?: string }) {
 return <Pressable accessibilityRole="button" accessibilityLabel={label || children} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} className={`min-h-12 justify-center rounded-xl border px-4 py-3 ${outline ? 'border-border bg-background' : 'border-primary bg-primary'} ${disabled ? 'opacity-50' : ''}`}><Text className={`font-sans text-center font-semibold ${outline ? 'text-foreground' : 'text-white'}`}>{children}</Text></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
 return <View className="gap-2"><Text className="font-sans text-base font-semibold text-foreground">{label}</Text><TextInput accessibilityLabel={label} className="min-h-12 rounded-xl border border-border bg-background px-4 py-3 font-sans text-base text-foreground" placeholderTextColor="#716c62" {...props}/></View>;
}
export function Heading({ children }: { children: string }) {
 return <Text accessibilityRole="header" className="font-display text-4xl leading-tight text-foreground">{children}</Text>;
}
