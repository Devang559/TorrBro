import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import type {TorrentResult} from '../data/mockData';
import {palette, radius, spacing, typography} from '../theme/theme';
import {isTorrentDownloadsSupported} from '../services/torrentDownload';

type TorrentDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TorrentDetails'
> & {
  theme: 'light' | 'dark';
  onAddTorrent: (torrent: TorrentResult) => Promise<string>;
};

export function TorrentDetailsScreen({
  theme,
  route,
  navigation,
  onAddTorrent,
}: TorrentDetailsScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);
  const torrent = route.params.torrent;
  const [adding, setAdding] = useState(false);

  const addTorrent = async () => {
    if (!isTorrentDownloadsSupported) {
      Alert.alert('Not supported', 'Torrent downloads are currently supported on Android only.');
      return;
    }
    setAdding(true);
    try {
      await onAddTorrent(torrent);
      Alert.alert('Download started', `${torrent.title} was added to Downloads.`);
    } catch (error) {
      Alert.alert(
        'Unable to add torrent',
        error instanceof Error ? error.message : 'Please check the magnet link and try again.',
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.poster, {backgroundColor: colors.primarySoft, borderColor: colors.border}]}>
        <Text style={styles.posterText}>T</Text>
      </View>

      <View style={[styles.headerCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Text style={[styles.kicker, {color: colors.primary}]}>{torrent.provider}</Text>
        <Text style={[styles.title, {color: colors.text}]}>{torrent.title}</Text>
        <Text style={[styles.meta, {color: colors.textSoft}]}>
          {torrent.size}
          {torrent.quality ? ` • ${torrent.quality}` : ''}
          {torrent.year ? ` • ${torrent.year}` : ''}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={[styles.metricLabel, {color: colors.textSoft}]}>Seeds</Text>
          <Text style={[styles.metricValue, {color: colors.accent}]}>{torrent.seeds.toLocaleString()}</Text>
        </View>
        <View style={[styles.metricCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={[styles.metricLabel, {color: colors.textSoft}]}>Peers</Text>
          <Text style={[styles.metricValue, {color: colors.warning}]}>{torrent.peers.toLocaleString()}</Text>
        </View>
        <View style={[styles.metricCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={[styles.metricLabel, {color: colors.textSoft}]}>Source</Text>
          <Text style={[styles.metricValue, {color: colors.text}]}>
            {torrent.provider === 'YTS' ? 'YTS' : 'TPB'}
          </Text>
        </View>
      </View>

      <View style={[styles.detailsCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>
          {torrent.rating ? `Overview  ·  ★ ${torrent.rating.toFixed(1)}` : 'Overview'}
        </Text>
        <Text style={[styles.description, {color: colors.textSoft}]}>
          {torrent.summary ||
            `Listed by ${torrent.source}. This result has ${torrent.seeds.toLocaleString()} seeders and ${torrent.peers.toLocaleString()} peers.`}
        </Text>
      </View>

      <View style={[styles.actionsRow]}>
        <Pressable
          accessibilityRole="button"
          disabled={adding}
          onPress={addTorrent}
          style={[styles.primaryButton, {backgroundColor: colors.primary}]}>
          <Text style={styles.primaryText}>{adding ? 'Starting…' : 'Download torrent'}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Files')}
          style={[styles.secondaryButton, {backgroundColor: colors.surfaceAlt, borderColor: colors.border}]}>
          <Text style={[styles.secondaryText, {color: colors.text}]}>View files</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => navigation.navigate('Player')}
        style={[styles.previewButton, {borderColor: colors.border}]}>
        <Text style={[styles.previewText, {color: colors.textSoft}]}>
          Open media player
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: (typeof palette)['light']) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      paddingBottom: 120,
    },
    poster: {
      height: 220,
      borderRadius: radius.xl,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.15,
      shadowRadius: 18,
      shadowOffset: {width: 0, height: 8},
      elevation: 6,
    },
    posterText: {
      fontSize: 64,
      color: colors.primary,
      fontWeight: '800',
    },
    headerCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    kicker: {
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
      marginBottom: 6,
    },
    meta: {
      fontSize: typography.body,
      fontWeight: '500',
    },
    metricsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    metricCard: {
      flex: 1,
      borderRadius: radius.md,
      borderWidth: 1,
      padding: spacing.md,
    },
    metricLabel: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    metricValue: {
      fontSize: typography.subtitle,
      fontWeight: '800',
    },
    detailsCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    cardTitle: {
      fontSize: typography.subtitle,
      fontWeight: '800',
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: typography.body,
      lineHeight: 22,
      fontWeight: '500',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    primaryButton: {
      flex: 1,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    primaryText: {
      color: '#ffffff',
      fontWeight: '800',
      fontSize: typography.body,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: radius.md,
      borderWidth: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    secondaryText: {
      fontWeight: '700',
      fontSize: typography.body,
    },
    previewButton: {
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      marginTop: spacing.sm,
      paddingVertical: spacing.md,
    },
    previewText: {
      fontSize: typography.body,
      fontWeight: '700',
    },
  });
