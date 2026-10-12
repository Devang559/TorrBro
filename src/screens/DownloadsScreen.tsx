import React from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import { palette, radius, spacing } from '../theme/theme';
import {
  formatBytes,
  formatTransferRate,
  type TorrentDownload,
} from '../services/torrentDownload';

type DownloadsScreenProps = {
  theme: 'light' | 'dark';
  downloads: TorrentDownload[];
  onPause: (id: string) => Promise<void>;
  onResume: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

export function DownloadsScreen({
  theme,
  downloads,
  onPause,
  onResume,
  onRemove,
}: DownloadsScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);

  const runAction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      Alert.alert(
        'Download action failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.heading, {color: colors.text}]}>Downloads</Text>

      {downloads.length === 0 && (
        <View style={[styles.emptyCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={[styles.emptyTitle, {color: colors.text}]}>No active downloads</Text>
          <Text style={[styles.emptyCopy, {color: colors.textSoft}]}>
            Add a torrent from its details page to start downloading.
          </Text>
        </View>
      )}

      {downloads.map(item => (
        <View key={item.id} style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, {color: colors.text}]}>{item.title}</Text>
            <Text style={[styles.status, {color: item.status === 'Seeding' ? colors.accent : colors.primary}]}>{item.status}</Text>
          </View>

          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, {backgroundColor: colors.surfaceAlt}]}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${item.progress}%`, backgroundColor: colors.primary},
                ]}
              />
            </View>
            <Text style={[styles.progressText, {color: colors.text}]}>{Math.floor(item.progress)}%</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.meta, {color: colors.textSoft}]}>
              {formatBytes(item.downloadedBytes)} / {formatBytes(item.totalBytes)}
            </Text>
            <Text style={[styles.meta, {color: colors.textSoft}]}>
              {formatTransferRate(item.speedBytesPerSecond)}
            </Text>
            <Text style={[styles.meta, {color: colors.textSoft}]}>
              {item.seeds} seeds · {item.peers} peers
            </Text>
          </View>
          <View style={styles.actions}>
            {item.status !== 'Seeding' && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  runAction(() =>
                    item.status === 'Paused'
                      ? onResume(item.id)
                      : onPause(item.id),
                  )
                }
                style={[styles.actionButton, {borderColor: colors.border}]}>
                <Text style={[styles.actionText, {color: colors.text}]}>
                  {item.status === 'Paused' ? 'Resume' : 'Pause'}
                </Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  'Remove torrent?',
                  'This stops the transfer and keeps any files already downloaded.',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => runAction(() => onRemove(item.id)),
                    },
                  ],
                )
              }
              style={[styles.actionButton, {borderColor: colors.border}]}>
              <Text style={[styles.actionText, {color: colors.warning}]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (_colors: (typeof palette)['light']) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      paddingBottom: 120,
    },
    heading: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
      marginBottom: spacing.lg,
    },
    card: {
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    emptyCard: {
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: spacing.xs,
    },
    emptyCopy: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      marginRight: spacing.sm,
    },
    status: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    progressWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    progressBar: {
      flex: 1,
      height: 9,
      borderRadius: radius.pill,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.pill,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '800',
      minWidth: 42,
      textAlign: 'right',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 6,
    },
    meta: {
      fontSize: 12,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    actionButton: {
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '700',
    },
  });
