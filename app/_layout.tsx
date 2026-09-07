// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BudgetsProvider } from '@/contexts/BudgetsContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { UpdateProvider } from '@/contexts/UpdateContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UpdateProvider>
        <FinanceProvider>
          <BudgetsProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="transaction-editor" options={{ presentation: 'modal' }} />
              <Stack.Screen name="account-editor" options={{ presentation: 'modal' }} />
            </Stack>
          </BudgetsProvider>
        </FinanceProvider>
      </UpdateProvider>
    </SafeAreaProvider>
  );
}
