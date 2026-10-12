import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../theme/theme';

type SplashScreenProps = {
  theme?: 'light' | 'dark';
};

export function SplashScreen({theme = 'dark'}: SplashScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Text style={styles.logoMark}>T</Text>
      </View>
      <Text style={styles.brand}>TorrBro</Text>
      <Text style={styles.caption}>Your modern torrent hub</Text>
    </View>
  );
}

const createStyles = (colors: (typeof palette)['light']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: spacing.xl,
    },
    logoWrap: {
      width: 104,
      height: 104,
      borderRadius: radius.xl,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.25,
      shadowRadius: 20,
      shadowOffset: {width: 0, height: 14},
      elevation: 10,
      marginBottom: spacing.lg,
    },
    logoMark: {
      fontSize: 42,
      fontWeight: '800',
      color: '#ffffff',
    },
    brand: {
      fontSize: typography.title,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.6,
    },
    caption: {
      marginTop: spacing.xs,
      fontSize: typography.body,
      fontWeight: '500',
      color: colors.textSoft,
    },
  });
