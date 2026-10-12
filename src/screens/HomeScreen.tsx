import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../theme/theme';

const sourceCards = [
  {name: 'The Pirate Bay', detail: 'All categories', glyph: 'P'},
  {name: 'YTS', detail: 'Movies with quality info', glyph: 'Y'},
  {name: 'MagnetDL', detail: 'General torrents', glyph: 'M'},
  {name: 'LimeTorrents', detail: 'General torrents', glyph: 'L'},
];

type HomeScreenProps = {
  theme: 'light' | 'dark';
  onSearch: () => void;
};

export function HomeScreen({theme, onSearch}: HomeScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.miniLabel}>Good evening</Text>
          <Text style={styles.title}>Discover</Text>
        </View>
        <Pressable style={[styles.avatar, {backgroundColor: colors.primarySoft}]}>
          <Text style={[styles.avatarText, {color: colors.primary}]}>TB</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSearch}
        style={[styles.searchBar, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Search torrents, movies, shows...</Text>
        <Text style={[styles.searchArrow, {color: colors.primary}]}>→</Text>
      </Pressable>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={styles.statValue}>12.4K</Text>
          <Text style={styles.statLabel}>Active peers</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={styles.statValue}>2.8M</Text>
          <Text style={styles.statLabel}>Files indexed</Text>
        </View>
      </View>

      <View style={[styles.sectionHeader, {marginTop: spacing.xl}]}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <Text style={[styles.sectionLink, {color: colors.primary}]}>View all</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
        {['Movies', 'Series', 'Documentaries', 'Anime', 'Music'].map((item, index) => (
          <Pressable
            key={item}
            style={[
              styles.tag,
              {
                backgroundColor: index === 0 ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.tagText, index === 0 && styles.tagTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={onSearch}
        style={[styles.heroCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroBadge}>Two public sources</Text>
          <Text style={styles.heroTitle}>Find your next watch</Text>
          <Text style={styles.heroMeta}>The Pirate Bay and YTS, together</Text>
        </View>
        <View style={styles.heroAction}>
          <Text style={styles.heroButton}>Search</Text>
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore sources</Text>
        <Text style={[styles.sectionLink, {color: colors.primary}]}>4 sources</Text>
      </View>

      <View style={styles.sourceGrid}>
        {sourceCards.map(source => (
          <Pressable
            accessibilityRole="button"
            key={source.name}
            onPress={onSearch}
            style={[styles.sourceCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <View style={[styles.sourceIcon, {backgroundColor: colors.primarySoft}]}>
              <Text style={[styles.sourceGlyph, {color: colors.primary}]}>{source.glyph}</Text>
            </View>
            <Text style={styles.sourceTitle}>{source.name}</Text>
            <Text style={styles.sourceDescription}>{source.detail}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: (typeof palette)['light']) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      paddingBottom: 120,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    miniLabel: {
      color: colors.textSoft,
      fontSize: typography.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      marginTop: 4,
      color: colors.text,
      fontSize: typography.title,
      fontWeight: '800',
      letterSpacing: -0.8,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: radius.pill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: typography.body,
      fontWeight: '700',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      marginBottom: spacing.lg,
    },
    searchIcon: {
      fontSize: 18,
      marginRight: spacing.sm,
      color: colors.textSoft,
    },
    searchText: {
      color: colors.textSoft,
      fontSize: typography.body,
      fontWeight: '500',
      flex: 1,
    },
    searchArrow: {
      fontSize: 20,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    statValue: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      color: colors.textSoft,
      fontSize: typography.caption,
      fontWeight: '600',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '700',
    },
    sectionLink: {
      fontSize: typography.caption,
      fontWeight: '700',
    },
    trendingRow: {
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      marginRight: spacing.sm,
    },
    tagText: {
      color: colors.text,
      fontSize: typography.body,
      fontWeight: '700',
    },
    tagTextActive: {
      color: '#ffffff',
    },
    heroCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginTop: spacing.md,
      backgroundColor: colors.surface,
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: {width: 0, height: 10},
      elevation: 4,
    },
    sourceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    sourceCard: {
      flexBasis: '47%',
      flexGrow: 1,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      minHeight: 136,
    },
    sourceIcon: {
      alignItems: 'center',
      borderRadius: radius.md,
      height: 38,
      justifyContent: 'center',
      marginBottom: spacing.sm,
      width: 38,
    },
    sourceGlyph: {
      fontSize: 17,
      fontWeight: '900',
    },
    sourceTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    sourceDescription: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 4,
    },
    heroContent: {
      flex: 1,
    },
    heroBadge: {
      color: colors.primary,
      fontSize: typography.caption,
      fontWeight: '700',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    heroTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    heroMeta: {
      color: colors.textSoft,
      fontSize: typography.body,
      fontWeight: '500',
    },
    heroAction: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    heroButton: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: typography.body,
    },
    resultCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    resultInfo: {
      flex: 1,
    },
    resultBadge: {
      alignSelf: 'flex-start',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      marginBottom: 8,
    },
    resultBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    resultTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    metaText: {
      color: colors.textSoft,
      fontSize: typography.caption,
      fontWeight: '600',
    },
    resultStats: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginLeft: spacing.md,
    },
    seedText: {
      color: colors.accent,
      fontSize: typography.body,
      fontWeight: '700',
      marginBottom: 4,
    },
    peerText: {
      color: colors.textSoft,
      fontSize: typography.body,
      fontWeight: '600',
    },
  });
