import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {TorrentResult} from '../data/mockData';
import {
  searchTorrents,
  TorrentSource,
} from '../services/torrentSearch';
import {palette, radius, spacing, typography} from '../theme/theme';

type SearchResultsScreenProps = {
  theme: 'light' | 'dark';
  initialQuery?: string;
  torrentsApiBaseUrl: string;
  onSelectTorrent: (torrent: TorrentResult) => void;
};

const sources: TorrentSource[] = [
  'All',
  'The Pirate Bay',
  'YTS',
  'MagnetDL',
  'LimeTorrents',
];

export function SearchResultsScreen({
  theme,
  initialQuery,
  torrentsApiBaseUrl,
  onSelectTorrent,
}: SearchResultsScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);
  const [query, setQuery] = useState(initialQuery ?? '');
  const [source, setSource] = useState<TorrentSource>('All');
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const requestId = useRef(0);

  const performSearch = async (searchQuery = query, searchSource = source) => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) {
      requestId.current += 1;
      setLoading(false);
      setError('Enter a title or keyword to search.');
      setNotice(null);
      setResults([]);
      setSearched(false);
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    setNotice(null);
    setSearched(true);
    try {
      const response = await searchTorrents(
        normalizedQuery,
        searchSource,
        torrentsApiBaseUrl,
      );
      if (currentRequest === requestId.current) {
        setResults(response.results);
        setNotice(response.warning ?? null);
      }
    } catch (searchError) {
      if (currentRequest === requestId.current) {
        setResults([]);
        setNotice(null);
        setError(
          searchError instanceof Error
            ? searchError.message
            : 'Search failed. Please try again.',
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (initialQuery?.trim()) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
    // Initial search only; source selection and form submission run searches explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const selectSource = (nextSource: TorrentSource) => {
    setSource(nextSource);
    if (searched && query.trim()) {
      performSearch(query, nextSource);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>Find your next watch</Text>
          <Text style={styles.title}>Search</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE SOURCES</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search torrents"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          onSubmitEditing={() => performSearch()}
          placeholder="Search movies and torrents"
          placeholderTextColor={colors.textSoft}
          returnKeyType="search"
          style={styles.input}
          value={query}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={() => {
              setQuery('');
              setResults([]);
              setError(null);
              setNotice(null);
              setSearched(false);
            }}>
            <Text style={styles.clearIcon}>×</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => performSearch()}
          style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.sourceRow}
        showsHorizontalScrollIndicator={false}>
        {sources.map(item => {
          const active = source === item;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              key={item}
              onPress={() => selectSource(item)}
              style={[styles.sourceChip, active && styles.sourceChipActive]}>
              <Text
                style={[
                  styles.sourceText,
                  active && styles.sourceTextActive,
                ]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>
          {loading
            ? 'Searching…'
            : searched
              ? 'Results'
              : 'Search across sources'}
        </Text>
        {searched && !loading ? (
          <Text style={styles.resultCount}>{results.length} FOUND</Text>
        ) : null}
      </View>

      {notice && !loading ? (
        <Text style={styles.partialWarning}>{notice}</Text>
      ) : null}

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateTitle}>Finding the best matches</Text>
          <Text style={styles.stateCaption}>
            Checking {source === 'All' ? 'both sources' : source}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateIcon}>!</Text>
          <Text style={styles.stateTitle}>Search unavailable</Text>
          <Text style={styles.stateCaption}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => performSearch()}
            style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateIcon}>⌕</Text>
          <Text style={styles.stateTitle}>No matches yet</Text>
          <Text style={styles.stateCaption}>
            Try a different title or switch to another source.
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.stateCard}>
          <View style={styles.sourceArtwork}>
            <Text style={styles.sourceArtworkGlyph}>T</Text>
          </View>
          <Text style={styles.stateTitle}>Search across four sources</Text>
          <Text style={styles.stateCaption}>
            Search The Pirate Bay and YTS directly, or configure a Torrents API
            server in Settings to enable MagnetDL and LimeTorrents.
          </Text>
        </View>
      ) : (
        results.map(item => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => onSelectTorrent(item)}
            style={({pressed}) => [
              styles.resultCard,
              pressed && styles.resultCardPressed,
            ]}>
            <View style={styles.cardTop}>
              <View style={styles.providerPill}>
                <Text style={styles.providerText}>{item.provider}</Text>
              </View>
              <Text style={styles.sourceDate}>{item.age}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardBottom}>
              <View style={styles.cardMeta}>
                <Text style={styles.sizeText}>{item.size}</Text>
                {item.quality ? (
                  <View style={styles.qualityPill}>
                    <Text style={styles.qualityText}>{item.quality}</Text>
                  </View>
                ) : null}
                {typeof item.rating === 'number' ? (
                  <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
                ) : null}
              </View>
              <View style={styles.peerStats}>
                <Text style={styles.seedText}>↑ {item.seeds.toLocaleString()}</Text>
                <Text style={styles.peerText}>↓ {item.peers.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.tapHint}>TAP FOR DETAILS  ›</Text>
          </Pressable>
        ))
      )}

      <Text style={styles.disclaimer}>
        Search results are provided by third-party public APIs.
      </Text>
    </ScrollView>
  );
}

const createStyles = (colors: (typeof palette)['light']) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      paddingBottom: 32,
    },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    eyebrow: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 5,
    },
    title: {
      color: colors.text,
      fontSize: typography.title,
      fontWeight: '800',
      letterSpacing: -0.8,
    },
    livePill: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      flexDirection: 'row',
      gap: 6,
      marginBottom: 5,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    liveDot: {
      backgroundColor: colors.accent,
      borderRadius: radius.pill,
      height: 6,
      width: 6,
    },
    liveText: {
      color: colors.primary,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
    },
    searchBox: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      minHeight: 58,
      paddingHorizontal: spacing.sm,
      shadowColor: colors.cardShadow,
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },
    searchIcon: {
      color: colors.primary,
      fontSize: 24,
      marginHorizontal: 5,
    },
    input: {
      color: colors.text,
      flex: 1,
      fontSize: 14,
      minWidth: 0,
      paddingHorizontal: 8,
      paddingVertical: 12,
    },
    clearIcon: {
      color: colors.textSoft,
      fontSize: 22,
      paddingHorizontal: 7,
    },
    searchButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    searchButtonText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
    },
    sourceRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
      marginBottom: spacing.xl,
      paddingRight: spacing.lg,
    },
    sourceChip: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.pill,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    sourceChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sourceText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
    },
    sourceTextActive: {
      color: '#ffffff',
    },
    resultsHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    resultCount: {
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    stateCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.xl,
      borderWidth: 1,
      minHeight: 220,
      justifyContent: 'center',
      padding: spacing.xl,
    },
    stateTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
      marginTop: spacing.md,
      textAlign: 'center',
    },
    stateCaption: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      marginTop: spacing.xs,
      maxWidth: 280,
      textAlign: 'center',
    },
    stateIcon: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      color: colors.primary,
      fontSize: 24,
      fontWeight: '800',
      height: 48,
      lineHeight: 48,
      overflow: 'hidden',
      textAlign: 'center',
      width: 48,
    },
    sourceArtwork: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      height: 54,
      justifyContent: 'center',
      width: 54,
    },
    sourceArtworkGlyph: {
      color: '#ffffff',
      fontSize: 27,
      fontWeight: '900',
    },
    retryButton: {
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      marginTop: spacing.md,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    retryText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '800',
    },
    resultCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      marginBottom: spacing.md,
      padding: spacing.md,
    },
    resultCardPressed: {
      opacity: 0.82,
      transform: [{scale: 0.99}],
    },
    cardTop: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    providerPill: {
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    providerText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    sourceDate: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '600',
    },
    cardTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 23,
    },
    cardBottom: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    cardMeta: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      flex: 1,
    },
    sizeText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
    },
    qualityPill: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 4,
    },
    qualityText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '800',
    },
    ratingText: {
      color: colors.warning,
      fontSize: 12,
      fontWeight: '800',
    },
    peerStats: {
      alignItems: 'flex-end',
      marginLeft: spacing.sm,
    },
    seedText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
    peerText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 3,
    },
    tapHint: {
      color: colors.textSoft,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginTop: spacing.md,
      textAlign: 'right',
    },
    disclaimer: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 16,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    partialWarning: {
      color: colors.warning,
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 18,
      marginBottom: spacing.md,
    },
  });
