import { Colors } from '@/constants/theme';
import { FileListItem } from '@/src/components/FileListItem';
import { CATEGORIES } from '@/src/constants/mockData';
import { useTheme } from '@/src/context/ThemeContext';
import { useAudioPlayer } from '@/src/hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DerseDetailScreen() {
    const router = useRouter();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
    const { colorScheme, setThemePreference } = useTheme();
    const theme = Colors[colorScheme];

    const category = CATEGORIES.find(c => c.id === categoryId);

    const {
        playSound,
        pauseSound,
        seekScroll,
        isPlaying,
        currentUri,
        isLoading,
        position,
        duration,
        playbackRate,
        setPlaybackRate
    } = useAudioPlayer();

    const toggleTheme = () => {
        setThemePreference(colorScheme === 'dark' ? 'light' : 'dark');
    };

    // Available playback speeds
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    const handleSpeedCycle = () => {
        const currentIndex = speeds.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setPlaybackRate(speeds[nextIndex]);
    };

    if (!category) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Category not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{category.title}</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                            <Ionicons
                                name={colorScheme === 'dark' ? "sunny" : "moon"}
                                size={24}
                                color={theme.text}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <FlatList
                data={category.files}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isItemCurrent = currentUri?.endsWith(encodeURIComponent(item.name));
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
        alignItems: 'center',
        width: '100%',
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    speedBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        minWidth: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    themeToggle: {
        padding: 8,
    },
    listContent: {
        paddingVertical: 10,
    },
});
