import { FileListItem } from '@/src/components/FileListItem';
import { CATEGORIES } from '@/src/constants/mockData';
import { NoteModal } from '@/src/components/NoteModal';
import { useAudioPlayer } from '@/src/hooks/useAudioPlayer';
import { useNotes } from '@/src/context/NoteContext';
import { DriveFile } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DerseDetailScreen() {
    const router = useRouter();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
    const { addNote } = useNotes();
    const [noteFile, setNoteFile] = useState<DriveFile | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Fixed dark theme colors for consistency with new design
    const theme = {
        background: 'transparent',
        text: '#f8fafc',
        secondaryText: '#94a3b8',
        tint: '#38bdf8', // Light blue tint for distinct page feel
        border: 'rgba(56, 189, 248, 0.2)'
    };

    const category = CATEGORIES.find(c => c.id === categoryId);

    const filteredFiles = React.useMemo(() => {
        if (!category) return [];
        if (!searchQuery.trim()) return category.files;
        return category.files.filter(file =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [category, searchQuery]);

    const {
        playSound,
        pauseSound,
        seekScroll,
        isPlaying,
        currentUri,
        currentFileId,
        isLoading,
    } = useAudioPlayer();

    if (!category) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#0f172a', '#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <SafeAreaView style={styles.safeArea}>
                    <Text style={{ color: theme.text }}>Category not found</Text>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* Ultra-Premium Deep Midnight Gradient */}
            <LinearGradient
                colors={['#020617', '#0f172a', '#020617']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Subtle Abstract Light Overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(56, 189, 248, 0.03)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={styles.headerContent}>
                        {isSearching ? (
                            <View style={styles.searchContainer}>
                                <TouchableOpacity 
                                    onPress={() => { setIsSearching(false); setSearchQuery(''); }}
                                    style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="arrow-back" size={22} color={theme.text} />
                                </TouchableOpacity>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.searchInput, { color: theme.text }]}
                                        placeholder="Search lessons..."
                                        placeholderTextColor="rgba(255,255,255,0.35)"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        autoFocus
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity 
                                            onPress={() => setSearchQuery('')}
                                            style={styles.clearButton}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{category.title}</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' }}>
                                        {category.files.length} Files Available
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => setIsSearching(true)} 
                                    style={[styles.searchToggleButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="search" size={20} color={theme.text} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
                <FlatList
                    data={filteredFiles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isItemCurrent = currentFileId === item.id;
                        return (
                            <FileListItem
                                file={item}
                                onPlay={(uri, title) => playSound(uri, title, category.files, item.id)}
                                onPause={pauseSound}
                                onSeek={seekScroll}
                                isPlaying={isPlaying}
                                isCurrent={isItemCurrent}
                                isAudioLoading={isLoading}
                                onAddNote={(file) => setNoteFile(file)}
                            />
                        );
                    }}
                    ListEmptyComponent={
                        searchQuery.trim() !== '' ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.15)" />
                                <Text style={styles.emptyText}>No lessons found matching "{searchQuery}"</Text>
                            </View>
                        ) : null
                    }
                    contentContainerStyle={styles.listContent}
                />
            </SafeAreaView>

            <NoteModal
                visible={!!noteFile}
                onClose={() => setNoteFile(null)}
                onSave={addNote}
                metadata={noteFile ? {
                    fileId: noteFile.id,
                    fileName: noteFile.name
                } : undefined}
            />
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
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 14,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -1,
    },
    listContent: {
        paddingVertical: 10,
        paddingBottom: 120, // More space for MiniPlayer
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1.5,
        borderColor: 'rgba(56, 189, 248, 0.25)', // Smooth light blue glass border
        paddingHorizontal: 14,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        fontWeight: '500',
        paddingRight: 8,
    },
    clearButton: {
        padding: 4,
    },
    searchToggleButton: {
        padding: 10,
        borderRadius: 14,
    },
    emptyContainer: {
        paddingTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
});
