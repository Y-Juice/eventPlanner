// SSR-safe AsyncStorage wrapper usable on native and web
// On server (web SSR), fall back to an in-memory map to avoid `window` reference errors

let AsyncStorageRef: any = null;
const memoryStore = new Map<string, string>();

try {
  if (typeof window !== 'undefined') {
    // Only require AsyncStorage in the browser / native runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AsyncStorageRef = require('@react-native-async-storage/async-storage').default;
  }
} catch {
  AsyncStorageRef = null;
}

export const storeData = async (key: string, value: unknown) => {
  try {
    const jsonValue = JSON.stringify(value);
    if (AsyncStorageRef) {
      await AsyncStorageRef.setItem(key, jsonValue);
    } else {
      memoryStore.set(key, jsonValue);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error saving data to cache', e);
  }
};

export const getData = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    if (AsyncStorageRef) {
      const jsonValue = await AsyncStorageRef.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    }
    const jsonValue = memoryStore.get(key) ?? null;
    return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error fetching data from cache', e);
    return null;
  }
};


