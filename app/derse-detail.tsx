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
                        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{category.title}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' }}>
                                {category.files.length} Files Available
                            </Text>
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
});
