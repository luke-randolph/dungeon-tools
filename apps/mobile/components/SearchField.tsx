import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  children?: ReactNode;
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  children,
}: SearchFieldProps) {
  return (
    <View style={styles.toolbar}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.mutedText}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.search,
          { color: Colors.text, borderColor: Colors.border },
        ]}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  search: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    fontSize: 15,
    backgroundColor: Colors.inputBackground,
  },
});
