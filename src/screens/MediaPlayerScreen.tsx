import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../theme/theme';

type MediaPlayerScreenProps = {
  theme: 'light' | 'dark';
};

export function MediaPlayerScreen({theme}: MediaPlayerScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={[styles.player, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <View style={styles.playerGlow} />
        <View style={styles.playerOverlay}>
          <Text style={[styles.playLabel, {color: colors.textSoft}]}>Now playing</Text>
          <Text style={[styles.title, {color: colors.text}]}>The Silent Horizon</Text>
          <Text style={[styles.meta, {color: colors.textSoft}]}>1080p • 2h 14m</Text>
        </View>
      </View>

      <View style={styles.controlsWrap}>
        <View style={[styles.controlRow, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={[styles.controlLabel, {color: colors.textSoft}]}>Progress</Text>
          <Text style={[styles.controlValue, {color: colors.text}]}>1:56:42 / 2:14:00</Text>
        </View>

        <View style={styles.transportRow}>
          <Pressable style={[styles.transportButton, {backgroundColor: colors.primarySoft}]}>
            <Text style={[styles.transportIcon, {color: colors.primary}]}>⏮</Text>
          </Pressable>
          <Pressable style={[styles.playButton, {backgroundColor: colors.primary}]}>
            <Text style={styles.playIcon}>⏸</Text>
          </Pressable>
          <Pressable style={[styles.transportButton, {backgroundColor: colors.primarySoft}]}>
            <Text style={[styles.transportIcon, {color: colors.primary}]}>⏭</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: (typeof palette)['light']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      paddingBottom: 120,
      justifyContent: 'center',
    },
    player: {
      height: 330,
      borderRadius: radius.xl,
      borderWidth: 1,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      position: 'relative',
      marginBottom: spacing.lg,
    },
    playerGlow: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.primary,
      opacity: 0.18,
    },
    playerOverlay: {
      padding: spacing.lg,
    },
    playLabel: {
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.7,
      marginTop: 8,
      marginBottom: 4,
    },
    meta: {
      fontSize: typography.body,
      fontWeight: '500',
    },
    controlsWrap: {
      gap: spacing.md,
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    controlLabel: {
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    controlValue: {
      fontSize: typography.body,
      fontWeight: '700',
    },
    transportRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    transportButton: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    transportIcon: {
      fontSize: 24,
      fontWeight: '700',
    },
    playButton: {
      width: 80,
      height: 80,
      borderRadius: radius.pill,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 8},
      elevation: 5,
    },
    playIcon: {
      fontSize: 28,
      color: '#ffffff',
      fontWeight: '800',
    },
  });
