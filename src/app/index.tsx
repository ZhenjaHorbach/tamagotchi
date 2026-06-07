import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { deriveMood } from '@/core';
import { usePetStore } from '@/state/pet-store';
import { ChunkyButton } from '@/ui/components/chunky-button';
import { RadialBg } from '@/ui/components/gradient-bg';
import { Habitat } from '@/ui/components/habitat';
import { Nameplate } from '@/ui/components/nameplate';
import { PetSlot } from '@/ui/components/pet-slot';
import { SpeechBubble } from '@/ui/components/speech-bubble';
import { StatGauge } from '@/ui/components/stat-gauge';
import { ToyFrame, TOY_WIDTH } from '@/ui/components/toy-frame';
import { SettingsScreen } from '@/ui/screens/settings-screen';
import { ShelfScreen } from '@/ui/screens/shelf-screen';
import { useSpeech } from '@/ui/use-speech';
import {
  buttonTones,
  FONTS,
  gaugeTones,
  MOOD_META,
  moodTheme,
  SURF_RADIUS,
  ThemeProvider,
} from '@/ui/theme';

const PET_NAME = 'Mochi';
const TOY_NATURAL_HEIGHT = 716;

type Tab = 'shelf' | 'habitat' | 'settings';

export default function HomeScreen() {
  const pet = usePetStore((s) => s.pet);
  const feed = usePetStore((s) => s.feed);
  const play = usePetStore((s) => s.play);
  const sleep = usePetStore((s) => s.sleep);
  const reset = usePetStore((s) => s.reset);

  const [tab, setTab] = useState<Tab>('habitat');
  const { speak, speech } = useSpeech();

  const mood = pet ? deriveMood(pet) : 'neutral';
  const theme = useMemo(() => moodTheme(mood), [mood]);
  const gauges = gaugeTones();
  const buttons = buttonTones();

  // greet whenever the habitat tab is (re)entered
  const prevTab = useRef<Tab | null>(null);
  useEffect(() => {
    if (pet && tab === 'habitat' && prevTab.current !== 'habitat') speak('greet');
    prevTab.current = tab;
  }, [pet, tab, speak]);

  // react when the live mood drifts to needy states
  const prevMood = useRef(mood);
  useEffect(() => {
    if (tab === 'habitat' && mood !== prevMood.current) {
      if (mood === 'hungry') speak('hungry');
      else if (mood === 'sad') speak('sad');
    }
    prevMood.current = mood;
  }, [mood, tab, speak]);

  // fit the fixed-size toy into the phone
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(
    (width - 16) / (TOY_WIDTH + 8),
    (height - insets.top - insets.bottom - 24) / TOY_NATURAL_HEIGHT,
    1.06,
  );

  if (!pet) return <View style={styles.stage} />;

  const fullness = 100 - pet.hunger;
  const tooTired = mood === 'sleepy';

  const onFeed = () => {
    feed();
    speak('feed');
  };
  const onPlay = () => {
    play();
    speak('play');
  };
  const onSleep = () => {
    sleep();
    speak('sleep');
  };
  const onReset = async () => {
    await reset();
    setTab('habitat');
    speak('greet'); // hatch ceremony lands day 4
  };

  let screen: React.ReactNode;
  if (tab === 'shelf') {
    screen = <ShelfScreen name={PET_NAME} mood={mood} onEnterPet={() => setTab('habitat')} />;
  } else if (tab === 'settings') {
    screen = <SettingsScreen name={PET_NAME} onReset={onReset} />;
  } else {
    screen = (
      <View style={styles.home}>
        <View style={styles.topbar}>
          <Nameplate name={PET_NAME} mood={mood} />
        </View>

        <SpeechBubble
          name={PET_NAME}
          shown={speech.shown}
          done={speech.done}
          thinking={speech.thinking}
        />

        <Habitat>
          <PetSlot mood={mood} />
        </Habitat>

        <View
          style={[styles.statRow, { backgroundColor: theme.panel, borderColor: theme.panelLine }]}>
          <StatGauge
            icon="bowl"
            label="Hunger"
            value={fullness}
            tone={gauges.hunger}
            alert={pet.hunger > 75}
          />
          <StatGauge icon="heart" label="Joy" value={pet.joy} tone={gauges.joy} />
          <StatGauge
            icon="bolt"
            label="Energy"
            value={pet.energy}
            tone={gauges.energy}
            alert={pet.energy < 20}
          />
        </View>

        <View style={styles.actions}>
          <ChunkyButton icon="bowl" label="Feed" tone={buttons.feed} onPress={onFeed} />
          <ChunkyButton
            icon="ball"
            label="Play"
            tone={buttons.play}
            onPress={onPlay}
            disabled={tooTired}
          />
          <ChunkyButton icon="moon" label="Sleep" tone={buttons.sleep} onPress={onSleep} />
        </View>
      </View>
    );
  }

  return (
    <ThemeProvider value={theme}>
      <View style={styles.stage}>
        <StatusBar style={theme.night ? 'light' : 'dark'} />
        <RadialBg colors={[theme.room1, theme.room2]} center={{ x: 0.5, y: 0.08 }} radius={1.1} />
        <View style={{ transform: [{ scale }] }}>
          <ToyFrame
            hw={[
              { icon: 'home', label: 'home', onPress: () => setTab('shelf'), active: tab === 'shelf' },
              { icon: 'dome', label: 'habitat', onPress: () => setTab('habitat'), active: tab === 'habitat' },
              { icon: 'cog', label: 'settings', onPress: () => setTab('settings'), active: tab === 'settings' },
            ]}>
            {screen}
          </ToyFrame>
        </View>
        <Text style={[styles.tagline, { color: theme.inkFaint }]}>{MOOD_META[mood].tagline}</Text>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  home: {
    flex: 1,
    padding: 14,
    paddingBottom: 16,
    gap: 11,
  },
  topbar: {
    flexDirection: 'row',
    gap: 8,
  },
  statRow: {
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: SURF_RADIUS,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  tagline: {
    position: 'absolute',
    bottom: 14,
    fontFamily: FONTS.pixel,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
