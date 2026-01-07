import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MiniPlayer } from '@/src/components/MiniPlayer';
import NativePdf from '@/src/components/NativePdf';
import { NotesManagerModal } from '@/src/components/NotesManagerModal';

import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PdfViewer() {
    const { url, remoteUrl, name } = useLocalSearchParams<{ url: string; remoteUrl: string; name: string }>();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [notesModalVisible, setNotesModalVisible] = useState(false);


    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const persistenceKey = `pdf_res_page_${name}`;

    useEffect(() => {
        const loadPage = async () => {
            try {
                const saved = await AsyncStorage.getItem(persistenceKey);
                if (saved && !isPageLoaded) {
                    setCurrentPage(parseInt(saved, 10));
                }
            } catch (e) {
            } finally {
                setIsPageLoaded(true);
            }
        };
        loadPage();
    }, [name, persistenceKey]);

    const [zoom, setZoom] = useState(1.0);

    const handleZoom = (type: 'in' | 'out') => {
        setZoom(prev => {
            if (type === 'in') return Math.min(prev + 0.25, 3.0);
            return Math.max(prev - 0.25, 0.75);
        });
    };

    const handlePageUpdate = (page: number) => {
        AsyncStorage.setItem(persistenceKey, page.toString());
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={[styles.zoomControls, { backgroundColor: theme.border + '50' }]}>
                    <TouchableOpacity onPress={() => handleZoom('out')} style={styles.zoomBtn}>
                        <Ionicons name="remove" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.zoomDivider} />
                    <Text style={[styles.zoomText, { color: theme.text }]}>{Math.round(zoom * 100)}%</Text>
                    <View style={{ width: 1, height: 16, backgroundColor: theme.border, marginHorizontal: 8 }} />
                    <TouchableOpacity onPress={() => handleZoom('in')} style={styles.zoomBtn}>
                        <Ionicons name="add" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => setNotesModalVisible(true)}
                        style={[styles.headerBtn, { backgroundColor: theme.tint + '15' }]}
                    >
                        <Ionicons name="document-text" size={20} color={theme.tint} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => Linking.openURL(remoteUrl || url)}
                        style={[styles.headerBtn, { backgroundColor: theme.border + '50' }]}
                    >
                        <Ionicons name="share-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <NotesManagerModal
                visible={notesModalVisible}
                onClose={() => setNotesModalVisible(false)}
                currentFileMetadata={{
                    fileId: name || (url as string),
                    fileName: name || 'PDF Document',
                    pageNumber: currentPage
                }}
            />

            <View style={[styles.pdfContainer, { backgroundColor: colorScheme === 'dark' ? '#151718' : '#F8FAFC' }]}>
                <NativePdf
                    url={url as string}
                    remoteUrl={remoteUrl as string}
                    targetPage={currentPage}
                    zoom={zoom}
                    onPageChanged={handlePageUpdate}
                />
            </View>

            <MiniPlayer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    zoomBtn: {
        padding: 4,
    },
    zoomDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 12,
    },
    zoomText: {
        fontSize: 13,
        fontWeight: '800',
        minWidth: 44,
        textAlign: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdfContainer: {
        flex: 1,
    },
});
