# SKILL: Expo Router Navigation

## Overview
**Expo Router v4** (file-based routing for React Native) patterns. Load for mobile navigation architecture, deep linking, or screen/layout setup.

## File-System Routing Conventions
```
app/
  _layout.tsx              ← Root layout (fonts, theming, providers)
  index.tsx                ← / → Home tab
  +not-found.tsx           ← 404 handler
  (auth)/                  ← Group — shares a layout, no URL segment
    _layout.tsx            ← Auth-specific layout (no tab bar)
    login.tsx              ← /login
    register.tsx           ← /register
  (tabs)/                  ← Group — tab navigation
    _layout.tsx            ← Tab bar definition
    index.tsx              ← / (home tab)
    explore.tsx            ← /explore
    profile.tsx            ← /profile
  post/
    [id].tsx               ← /post/:id (dynamic segment)
    [id]/
      comments.tsx         ← /post/:id/comments
  +html.tsx                ← Custom HTML shell (web only)
```

## Root Layout (Fonts + ThemeProvider)
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SessionProvider } from '@/providers/SessionProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SessionProvider>
  );
}
```

## Tab Navigation
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { HomeIcon, SearchIcon, ProfileIcon } from '@/components/icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },   // Blur effect on iOS
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: ({ color }) => <SearchIcon color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }}
      />
    </Tabs>
  );
}
```

## Navigation Patterns
```tsx
import { useRouter, useLocalSearchParams, Link } from 'expo-router';

// Programmatic navigation
function PostCard({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/post/${id}`)}>
      {/* ... */}
    </Pressable>
  );
}

// Declarative navigation
<Link href="/profile" asChild>
  <Pressable><Text>Go to Profile</Text></Pressable>
</Link>

// Reading dynamic params
function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostDetail postId={id} />;
}

// Auth redirect
import { Redirect } from 'expo-router';
if (!session) return <Redirect href="/login" />;
```

## Deep Linking
```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "universalLinks": ["https://myapp.com"]
  }
}
```
```
Deep link: myapp://post/123
Web link: https://myapp.com/post/123  (Expo Router handles both!)
```
