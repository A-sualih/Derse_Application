import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotes } from '../context/NoteContext';
import { useTheme } from '../context/ThemeContext';
import { AddNoteModal } from './AddNoteModal';
import { NoteList } from './NoteList';

interface NotesManagerModalProps {
    visible: boolean;
    onClose: () => void;
    currentFileMetadata?: {
        fileId: string;
        fileName: string;
        pageNumber: number;
    };
}

export function NotesManagerModal({ visible, onClose, currentFileMetadata }: NotesManagerModalProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const { notes, addNote, deleteNote } = useNotes();
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [filterByFile, setFilterByFile] = useState(!!currentFileMetadata);

    const filteredNotes = filterByFile && currentFileMetadata
        ? notes.filter(n => n.fileId === currentFileMetadata.fileId)
        : notes;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Notes</Text>
                        {currentFileMetadata && (
                            <TouchableOpacity onPress={() => setFilterByFile(!filterByFile)}>
                                <Text style={[styles.filterText, { color: theme.tint }]}>
                                    {filterByFile ? 'Showing this file' : 'Showing all notes'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <NoteList notes={filteredNotes} onDelete={deleteNote} />

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.tint }]}
                    onPress={() => setAddModalVisible(true)}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>

                <AddNoteModal
                    visible={addModalVisible}
                    onClose={() => setAddModalVisible(false)}
                    onSave={addNote}
                    metadata={currentFileMetadata}
                />
            </SafeAreaView>
        </Modal>
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
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 40,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});
