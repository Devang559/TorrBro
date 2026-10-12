import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {TorrentResult} from '../data/mockData';

export type TabParamList = {
  Discover: undefined;
  Search: {query?: string} | undefined;
  Downloads: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  TorrentDetails: {torrent: TorrentResult};
  Files: undefined;
  Player: undefined;
};

export type SearchScreenNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;
