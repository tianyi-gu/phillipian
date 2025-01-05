import AppNavigation from "./src/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { useFonts } from 'expo-font';
import { 
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome,
  Feather,
  MaterialIcons 
} from '@expo/vector-icons';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Require cycle:']);

enableScreens();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 2000,
      staleTime: 300000,
    },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
    ...Ionicons.font,
    ...FontAwesome.font,
    ...Feather.font,
    ...MaterialIcons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppNavigation />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
