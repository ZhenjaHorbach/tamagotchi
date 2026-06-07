import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deriveMood } from '@/core';
import { usePetStore } from '@/state/pet-store';

export default function DebugScreen() {
  const pet = usePetStore((s) => s.pet);
  const hydrated = usePetStore((s) => s.hydrated);
  const feed = usePetStore((s) => s.feed);
  const play = usePetStore((s) => s.play);
  const sleep = usePetStore((s) => s.sleep);

  if (!hydrated || !pet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.stat}>loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>tamagotchi / debug</Text>

      <View style={styles.block}>
        <Text style={styles.stat}>hunger: {pet.hunger.toFixed(1)}</Text>
        <Text style={styles.stat}>joy: {pet.joy.toFixed(1)}</Text>
        <Text style={styles.stat}>energy: {pet.energy.toFixed(1)}</Text>
        <Text style={styles.mood}>mood: {deriveMood(pet)}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.meta}>born: {new Date(pet.bornAt).toLocaleString()}</Text>
        <Text style={styles.meta}>last seen: {new Date(pet.lastSeenAt).toLocaleString()}</Text>
      </View>

      <View style={styles.buttons}>
        <Button title="Feed" onPress={feed} />
        <Button title="Play" onPress={play} />
        <Button title="Sleep" onPress={sleep} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  block: {
    alignItems: 'center',
    gap: 4,
  },
  stat: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  mood: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  meta: {
    fontSize: 12,
    color: 'gray',
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
  },
});
