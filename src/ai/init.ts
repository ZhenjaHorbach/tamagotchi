// ExecuTorch bootstrap — must run before any react-native-executorch API.
// Imported for its side effect at the app entry point (_layout.tsx).

import { initExecutorch } from 'react-native-executorch';
import { ExpoResourceFetcher } from 'react-native-executorch-expo-resource-fetcher';

initExecutorch({ resourceFetcher: ExpoResourceFetcher });
