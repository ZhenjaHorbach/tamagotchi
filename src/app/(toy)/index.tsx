// Habitat — the main pet screen.

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { deriveMood } from '@/core';
import { usePetStore } from '@/state/pet-store';
import { ChunkyButton } from '@/ui/components/chunky-button';
import { Habitat } from '@/ui/components/habitat';
import { Nameplate } from '@/ui/components/nameplate';
import { PetSlot } from '@/ui/components/pet-slot';
import { hashSeed } from '@/render/sprite-gen';
import { SpeechBubble } from '@/ui/components/speech-bubble';
import { StatGauge } from '@/ui/components/stat-gauge';
import { usePetName } from '@/ai/personality-store';
import { useSpeech } from '@/ui/use-speech';
import { buttonTones, gaugeTones, SPACING, useSurfaces } from '@/ui/theme';

export default function HabitatScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const surfaces = useSurfaces();
  const name = usePetName();
  const pet = usePetStore((s) => s.pet);
  const feed = usePetStore((s) => s.feed);
  const play = usePetStore((s) => s.play);
  const sleep = usePetStore((s) => s.sleep);

  const { speak, speech } = useSpeech();
  const gauges = gaugeTones();
  const buttons = buttonTones();

  // greet whenever the habitat is (re)entered
  useFocusEffect(
    useCallback(() => {
      speak('greet');
    }, [speak]),
  );

  // react when the live mood drifts to needy states
  const mood = pet ? deriveMood(pet) : 'neutral';
  const prevMood = useRef(mood);
  useEffect(() => {
    if (mood !== prevMood.current) {
      if (mood === 'hungry') speak('hungry');
      else if (mood === 'sad') speak('sad');
    }
    prevMood.current = mood;
  }, [mood, speak]);

  if (!pet) return null;

  const fullness = 100 - pet.hunger;
  const tooTired = mood === 'sleepy';

  return (
    <View style={styles.home}>
      <View style={styles.topbar}>
        <Nameplate name={name} mood={mood} onPress={() => router.push('/card')} />
      </View>

      <SpeechBubble
        name={name}
        shown={speech.shown}
        done={speech.done}
        thinking={speech.thinking}
      />

      <Habitat>
        <PetSlot mood={mood} seed={hashSeed(name)} />
      </Habitat>

      <View style={[surfaces.panel, styles.statRow]}>
        <StatGauge
          icon="bowl"
          label={t('habitat.hunger')}
          value={fullness}
          tone={gauges.hunger}
          alert={pet.hunger > 75}
        />
        <StatGauge icon="heart" label={t('habitat.joy')} value={pet.joy} tone={gauges.joy} />
        <StatGauge
          icon="bolt"
          label={t('habitat.energy')}
          value={pet.energy}
          tone={gauges.energy}
          alert={pet.energy < 20}
        />
      </View>

      <View style={styles.actions}>
        <ChunkyButton
          icon="bowl"
          label={t('habitat.feed')}
          tone={buttons.feed}
          onPress={async () => {
            await feed();
            speak('feed');
          }}
        />
        <ChunkyButton
          icon="ball"
          label={t('habitat.play')}
          tone={buttons.play}
          disabled={tooTired}
          onPress={async () => {
            await play();
            speak('play');
          }}
        />
        <ChunkyButton
          icon="moon"
          label={t('habitat.sleep')}
          tone={buttons.sleep}
          onPress={async () => {
            await sleep();
            speak('sleep');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  topbar: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statRow: {
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
