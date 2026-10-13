import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import { commonSettings } from '../data/mockData';
import { palette, radius, spacing, typography } from '../theme/theme';

type SettingsScreenProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  torrentsApiBaseUrl: string;
  onChangeTorrentsApiBaseUrl: (url: string) => void;
  downloadLocation: string;
  onPressDownloadLocation: () => void;
};

export function SettingsScreen({
  theme,
  onToggleTheme,
  torrentsApiBaseUrl,
  onChangeTorrentsApiBaseUrl,
  downloadLocation,
  onPressDownloadLocation,
}: SettingsScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.heading, {color: colors.text}]}>Settings</Text>

      <View style={[styles.panel, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Text style={[styles.panelTitle, {color: colors.text}]}>General</Text>
        <View style={styles.settingRow}>
          <View style={styles.themeCopy}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Dark mode</Text>
            <Text style={[styles.themeHint, {color: colors.textSoft}]}>
              Match your viewing preference
            </Text>
          </View>
          <Switch
            accessibilityLabel="Toggle dark mode"
            value={theme === 'dark'}
            onValueChange={onToggleTheme}
            thumbColor={theme === 'dark' ? colors.primary : '#cbd5e1'}
            trackColor={{false: colors.border, true: colors.primarySoft}}
          />
        </View>
        {commonSettings.map(setting => (
          setting.label === 'Dark mode' ? null :
          <View key={setting.label} style={styles.settingRow}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>{setting.label}</Text>
            <Switch
              value={setting.enabled}
              onValueChange={() => undefined}
              thumbColor={setting.enabled ? colors.primary : '#cbd5e1'}
              trackColor={{false: colors.border, true: colors.primarySoft}}
            />
          </View>
        ))}
      </View>

      <View style={[styles.panel, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Text style={[styles.panelTitle, {color: colors.text}]}>Search sources</Text>
        <Text style={[styles.themeHint, {color: colors.textSoft}]}>
          Add the base URL for your Torrents API server to enable MagnetDL and
          LimeTorrents. The app calls its /torrents/api/v1 routes.
        </Text>
        <TextInput
          accessibilityLabel="Torrents API server URL"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onChangeText={onChangeTorrentsApiBaseUrl}
          placeholder="https://your-torrents-api-host"
          placeholderTextColor={colors.textSoft}
          style={[
            styles.apiInput,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={torrentsApiBaseUrl}
        />
      </View>

      <View style={[styles.panel, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Text style={[styles.panelTitle, {color: colors.text}]}>Bandwidth</Text>
        <View style={styles.bandRow}>
          <Text style={[styles.bandLabel, {color: colors.textSoft}]}>Download limit</Text>
          <Text style={[styles.bandValue, {color: colors.text}]}>Unlimited</Text>
        </View>
        <View style={styles.bandRow}>
          <Text style={[styles.bandLabel, {color: colors.textSoft}]}>Upload limit</Text>
          <Text style={[styles.bandValue, {color: colors.text}]}>12 MB/s</Text>
        </View>
      </View>

      <View style={[styles.panel, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Text style={[styles.panelTitle, {color: colors.text}]}>Storage</Text>
        <View style={styles.settingRow}>
          <View style={styles.themeCopy}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Download folder</Text>
            <Text style={[styles.locationPath, {color: colors.textSoft}]} numberOfLines={1}>
              {downloadLocation}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select download folder"
            onPress={onPressDownloadLocation}
            style={[styles.locationButton, {borderColor: colors.border}]}>
            <Text style={[styles.locationButtonText, {color: colors.primary}]}>Change</Text>
          </Pressable>
        </View>
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
    heading: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
      marginBottom: spacing.lg,
    },
    panel: {
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    panelTitle: {
      fontSize: typography.subtitle,
      fontWeight: '800',
      marginBottom: spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLabel: {
      fontSize: typography.body,
      fontWeight: '600',
    },
    themeCopy: {
      flex: 1,
    },
    themeHint: {
      fontSize: 11,
      lineHeight: 17,
      marginTop: 3,
    },
    apiInput: {
      borderRadius: radius.md,
      borderWidth: 1,
      fontSize: typography.body,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    bandRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    bandLabel: {
      fontSize: typography.body,
      fontWeight: '600',
    },
    bandValue: {
      fontSize: typography.body,
      fontWeight: '700',
    },
    locationPath: {
      fontSize: 11,
      lineHeight: 16,
      marginTop: 3,
    },
    locationButton: {
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
    },
    locationButtonText: {
      fontSize: 12,
      fontWeight: '700',
    },
  });
