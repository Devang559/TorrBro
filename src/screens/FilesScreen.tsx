import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fileTree } from '../data/mockData';
import { palette, radius, spacing } from '../theme/theme';

type FilesScreenProps = {
  theme: 'light' | 'dark';
};

export function FilesScreen({theme}: FilesScreenProps) {
  const colors = palette[theme];
  const styles = createStyles(colors);

  const renderNode = (node: typeof fileTree[number], depth = 0) => (
    <View key={node.id} style={{marginLeft: depth * 18}}>
      <View style={[styles.nodeRow, {backgroundColor: node.type === 'folder' ? colors.surfaceAlt : colors.surface}]}>
        <Text style={styles.nodeIcon}>{node.type === 'folder' ? '▾' : '◫'}</Text>
        <Text style={[styles.nodeName, {color: colors.text}]}>{node.name}</Text>
        {node.size ? <Text style={[styles.nodeSize, {color: colors.textSoft}]}>{node.size}</Text> : null}
      </View>
      {node.children?.map(child => renderNode(child, depth + 1))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.heading, {color: colors.text}]}>Files</Text>
      {fileTree.map(node => renderNode(node))}
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
    nodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 0.5,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    nodeIcon: {
      fontSize: 14,
      color: colors.primary,
      marginRight: spacing.sm,
      width: 16,
    },
    nodeName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
    },
    nodeSize: {
      fontSize: 11,
      fontWeight: '700',
    },
  });
