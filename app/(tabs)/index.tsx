import { Colors } from '@/constants/theme';
import { CategoryCard } from '@/src/components/CategoryCard';
import { CATEGORIES } from '@/src/constants/mockData';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const router = useRouter();
  const { colorScheme, setThemePreference } = useTheme();
  const theme = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const toggleTheme = () => {
    setThemePreference(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const allTracks = CATEGORIES.flatMap(cat =>
    cat.files.filter(f => f.type === 'audio').map(f => ({ ...f, categoryTitle: cat.title }))
  );

  const filteredTracks = searchQuery.trim()
    ? allTracks.filter(track =>
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
        <View style={styles.headerContent}>
          {isSearching ? (
            <View style={styles.searchContainer}>
              <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.searchInput, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#1a1a1b' : '#f0f0f0' }]}
                placeholder="Search tracks..."
                placeholderTextColor={theme.secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
          ) : (
            <>
              <Text style={[styles.headerTitle, { color: theme.text }]}>ደርሶች</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.iconButton}>
                  <Ionicons name="search" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/about')} style={styles.iconButton}>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color={theme.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                  <Ionicons
                    name={colorScheme === 'dark' ? "sunny" : "moon"}
                    size={24}
                    color={theme.text}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {isSearching && searchQuery.trim() !== '' ? (
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
              onPress={() => {
                router.push({
                  pathname: '/derse-detail',
                  params: { categoryId: CATEGORIES.find(c => c.files.some(f => f.id === item.id))?.id }
                });
              }}
            >
              <View style={[styles.resultIcon, { backgroundColor: theme.tint + '10' }]}>
                <Ionicons name="musical-note" size={20} color={theme.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.resultCategory, { color: theme.secondaryText }]}>{item.categoryTitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.border} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.secondaryText }}>No tracks found matching "{searchQuery}"</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() => router.push({
                pathname: '/derse-detail',
                params: { categoryId: item.id }
              })}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  themeToggle: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
