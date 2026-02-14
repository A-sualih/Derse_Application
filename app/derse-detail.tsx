import { FileListItem } from '@/src/components/FileListItem';
import { CATEGORIES } from '@/src/constants/mockData';
import { useAudioPlayer } from '@/src/hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DerseDetailScreen() {
    const router = useRouter();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

    // Fixed dark theme colors for consistency with new design
    const theme = {
        background: 'transparent',
        text: '#f8fafc',
        secondaryText: '#94a3b8',
        tint: '#38bdf8', // Light blue tint for distinct page feel
        border: 'rgba(56, 189, 248, 0.2)'
    };

    const category = CATEGORIES.find(c => c.id === categoryId);

    const {
        playSound,
        pauseSound,
        seekScroll,
        isPlaying,
        currentUri,
        currentFileId,
        isLoading,
        position,
        duration,
        playbackRate,
        setPlaybackRate
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
            {/* Complementary Dark Slate Gradient - Different from Home but similar vibe */}
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{category.title}</Text>
                        <View style={styles.headerActions}>
                            {/* Actions if needed */}
                        </View>
                    </View>
                </View>
                <FlatList
                    data={category.files}
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
                                position={isItemCurrent ? position : 0}
                                duration={isItemCurrent ? duration : 0}
                            />
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
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
        alignItems: 'center',
        width: '100%',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        flex: 1,
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    listContent: {
        paddingVertical: 10,
        paddingBottom: 100, // Space for MiniPlayer
    },
});
