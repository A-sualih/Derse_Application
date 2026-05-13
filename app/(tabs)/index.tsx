import { Colors } from '@/constants/theme';
import { CategoryCard } from '@/src/components/CategoryCard';
import { CATEGORIES } from '@/src/constants/mockData';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBackgroundTasks } from '@/src/context/BackgroundTaskContext';
import { useAppStore } from '@/src/store/appStore';

export default function App() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const setLastScreen = useAppStore(state => state.setLastScreen);
  
  // Track last screen for persistence
  useEffect(() => {
    setLastScreen('home');
  }, []);

  const theme = useMemo(() => ({ 
    ...Colors['dark'], 
    background: 'transparent', 
    text: '#FFFFFF', 
    secondaryText: '#bbf7d0', 
    tint: '#4ade80', 
    border: 'rgba(74, 222, 128, 0.2)' 
  }), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { runSimulation } = useBackgroundTasks();

  const handleSync = useCallback(() => {
    runSimulation('Syncing Library...', 'sync');
  }, [runSimulation]);

  const allTracks = useMemo(() => 
    CATEGORIES.flatMap(cat =>
      cat.files.filter(f => f.type === 'audio').map(f => ({ ...f, categoryTitle: cat.title }))
    ), []);

  const filteredTracks = useMemo(() => 
    searchQuery.trim()
      ? allTracks.filter(track =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : [], [searchQuery, allTracks]);

  const renderSearchItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
      onPress={() => {
        router.push({
          pathname: '/derse-detail',
          params: { categoryId: CATEGORIES.find(c => c.files.some(f => f.id === item.id))?.id }
        });
      }}
    >
      <View style={[styles.resultIcon, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <Ionicons name="musical-note" size={20} color={theme.tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.resultCategory, { color: theme.secondaryText }]}>{item.categoryTitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.border} />
    </TouchableOpacity>
  ), [theme, router]);

  const renderCategoryItem = useCallback(({ item }: { item: any }) => (
    <CategoryCard
      category={item}
      onPress={() => router.push({
        pathname: '/derse-detail',
        params: { categoryId: item.id }
      })}
    />
  ), [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#020617', '#14532d', '#020617']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            {isSearching ? (
              <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                  <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.searchInput, { color: theme.text, backgroundColor: 'rgba(255,255,255,0.1)' }]}
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
                  <TouchableOpacity onPress={handleSync} style={styles.iconButton}>
                    <Ionicons name="cloud-upload-outline" size={24} color={theme.tint} />
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
            renderItem={renderSearchItem}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
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
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.listContent}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 100,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderRadius: 23,
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
