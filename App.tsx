import React, {useEffect, useState} from 'react';
import {Alert, StatusBar, StyleSheet, Text, useColorScheme} from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  DownloadsScreen,
  FilesScreen,
  HomeScreen,
  MediaPlayerScreen,
  SearchResultsScreen,
  SettingsScreen,
  SplashScreen,
  TorrentDetailsScreen,
} from './src/screens';
import type {TabParamList, RootStackParamList} from './src/navigation/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {palette} from './src/theme/theme';
import {
  isTorrentDownloadsSupported,
  torrentDownloadService,
  type TorrentDownload,
} from './src/services/torrentDownload';

const Tabs = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabItems = [
  {name: 'Discover', label: 'Discover', icon: '⌂'},
  {name: 'Search', label: 'Search', icon: '⌕'},
  {name: 'Downloads', label: 'Downloads', icon: '↓'},
  {name: 'Settings', label: 'Settings', icon: '⚙'},
] as const;

const tabIcons = {
  Discover: createTabIcon('⌂'),
  Search: createTabIcon('⌕'),
  Downloads: createTabIcon('↓'),
  Settings: createTabIcon('⚙'),
};

function createTabIcon(glyph: string) {
  return function TabBarIcon({color}: {color: string}) {
    return <Text style={[styles.tabIcon, {color}]}>{glyph}</Text>;
  };
}

function App(): React.JSX.Element {
  const systemScheme = useColorScheme();
  const [themeName, setThemeName] = useState<'light' | 'dark'>(
    systemScheme === 'dark' ? 'dark' : 'light',
  );
  const [torrentsApiBaseUrl, setTorrentsApiBaseUrl] = useState('');
  const [torrentDownloads, setTorrentDownloads] = useState<TorrentDownload[]>([]);
  const [downloadLocation, setDownloadLocation] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const colors = palette[themeName];

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isTorrentDownloadsSupported) {
      return;
    }
    let active = true;
    const unsubscribe = torrentDownloadService.subscribe(setTorrentDownloads);
    torrentDownloadService
      .getAll()
      .then(items => {
        if (active) {
          setTorrentDownloads(items);
        }
      })
      .catch(error => {
        if (active) {
          Alert.alert(
            'Unable to load downloads',
            error instanceof Error ? error.message : 'Please restart the app and try again.',
          );
        }
      });
    torrentDownloadService
      .getDownloadLocation()
      .then(path => setDownloadLocation(path))
      .catch(() => undefined);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleSelectDownloadLocation = async () => {
    if (!isTorrentDownloadsSupported) {
      Alert.alert('Downloads not supported', 'Torrent downloads are currently available on Android only.');
      return;
    }
    try {
      await torrentDownloadService.openDownloadLocationPicker();
      const path = await torrentDownloadService.getDownloadLocation();
      setDownloadLocation(path);
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        return;
      }
      Alert.alert(
        'Download folder selection failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const navigationTheme: NavigationTheme = {
    ...(themeName === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(themeName === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {showSplash ? (
        <SplashScreen theme={themeName} />
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {backgroundColor: colors.background},
              headerTintColor: colors.text,
              headerTitleStyle: {fontWeight: '700'},
              headerShadowVisible: false,
              contentStyle: {backgroundColor: colors.background},
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Main" options={{headerShown: false}}>
              {({navigation}) => (
                <MainTabs
                  themeName={themeName}
                  setThemeName={setThemeName}
                  torrentsApiBaseUrl={torrentsApiBaseUrl}
                  setTorrentsApiBaseUrl={setTorrentsApiBaseUrl}
                  downloads={torrentDownloads}
                  rootNavigation={navigation}
                  downloadLocation={downloadLocation}
                  onPressDownloadLocation={handleSelectDownloadLocation}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="TorrentDetails"
              options={{title: 'Torrent details'}}>
              {({route, navigation}) => (
                <TorrentDetailsScreen
                  theme={themeName}
                  route={route}
                  navigation={navigation}
                  onAddTorrent={torrent =>
                    torrentDownloadService.add(torrent.title, torrent.magnet)
                  }
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Files"
              options={{title: 'Files'}}>
              {() => <FilesScreen theme={themeName} />}
            </Stack.Screen>
            <Stack.Screen
              name="Player"
              options={{title: 'Now playing'}}>
              {() => <MediaPlayerScreen theme={themeName} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

type AppProps = {
  themeName: 'light' | 'dark';
  setThemeName: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  torrentsApiBaseUrl: string;
  setTorrentsApiBaseUrl: React.Dispatch<React.SetStateAction<string>>;
  downloads: TorrentDownload[];
  rootNavigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
  downloadLocation: string;
  onPressDownloadLocation: () => void;
};

function MainTabs({
  themeName,
  setThemeName,
  torrentsApiBaseUrl,
  setTorrentsApiBaseUrl,
  downloads,
  rootNavigation,
  downloadLocation,
  onPressDownloadLocation,
}: AppProps) {
  const colors = palette[themeName];
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        transitionSpec: {
          animation: 'timing',
          config: {duration: 180},
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIconStyle: {marginTop: 1},
      }}>
      {tabItems.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: tabIcons[tab.name],
          }}>
          {({navigation, route}) => {
            if (route.name === 'Discover') {
              return (
                <HomeScreen
                  theme={themeName}
                  onSearch={() => navigation.navigate('Search')}
                />
              );
            }
            if (route.name === 'Search') {
              return (
                <SearchResultsScreen
                  theme={themeName}
                  initialQuery={route.params?.query}
                  torrentsApiBaseUrl={torrentsApiBaseUrl}
                  onSelectTorrent={torrent =>
                    rootNavigation.navigate('TorrentDetails', {torrent})
                  }
                />
              );
            }
            if (route.name === 'Downloads') {
              return (
                <DownloadsScreen
                  theme={themeName}
                  downloads={downloads}
                  onPause={torrentDownloadService.pause}
                  onResume={torrentDownloadService.resume}
                  onRemove={torrentDownloadService.remove}
                />
              );
            }
            return (
              <SettingsScreen
                theme={themeName}
                torrentsApiBaseUrl={torrentsApiBaseUrl}
                onChangeTorrentsApiBaseUrl={setTorrentsApiBaseUrl}
                downloadLocation={downloadLocation}
                onPressDownloadLocation={onPressDownloadLocation}
                onToggleTheme={() =>
                  setThemeName(current =>
                    current === 'dark' ? 'light' : 'dark',
                  )
                }
              />
            );
          }}
        </Tabs.Screen>
      ))}
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default App;
