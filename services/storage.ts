// Powered by OnSpace.AI — petite couche de persistance JSON au-dessus
// d'AsyncStorage. 123Système est locale d'abord : rien ne quitte l'appareil.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Données corrompues : on repart du défaut plutôt que de planter l'app.
    return fallback;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota dépassé ou stockage indisponible : silencieux pour ne pas casser
    // le rendu ; l'app fonctionne en mémoire pour cette session.
  }
}

/** Identifiants courts et lisibles pour les nouveaux objets. */
export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
