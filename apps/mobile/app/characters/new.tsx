import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { CharacterForm } from '@/components/CharacterForm';
import { ThemedView } from '@/components/ThemedView';
import { useCharacters } from '@/stores/characters';

export default function NewCharacterScreen() {
  const router = useRouter();
  const addCharacter = useCharacters((s) => s.addCharacter);

  return (
    <ThemedView style={styles.container}>
      <CharacterForm
        submitLabel="Create"
        onSubmit={async (values) => {
          await addCharacter(values);
          router.back();
        }}
        onCancel={() => router.back()}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
