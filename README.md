# Tamagotchi

Pixel-art virtual pet built with React Native and Expo. It gets hungry, tired and bored over time, even while the app is closed, and its mood follows those stats.

The pet talks. Replies come from a small language model that runs fully on the phone through react-native-executorch. No server, no internet. Its personality is generated once at birth and stored locally. It can also look at things through the camera.

The game works without the model too. The pet just stays quiet.

## Stack

- Expo SDK 56, React Native 0.85, TypeScript
- react-native-executorch for on-device LLM and vision
- Skia and Reanimated for sprites and animation
- Zustand and expo-sqlite for state and storage
- i18next: English, Russian, Ukrainian, Polish, Spanish

## Running

Requires a dev build. Expo Go is not supported because of native modules.

```bash
npm install
npm run ios      # or: npm run android
```

## Tests

```bash
npm test
```
