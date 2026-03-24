import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotes } from '../context/NoteContext';
import { useTheme } from '../context/ThemeContext';
import { NoteModal } from './NoteModal';
import { NoteList } from './NoteList';
import { Note } from '../types/note';

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
    const { notes, addNote, updateNote, deleteNote } = useNotes();
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [filterByFile, setFilterByFile] = useState(!!currentFileMetadata);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const filteredNotes = filterByFile && currentFileMetadata
        ? notes.filter(n => n.fileId === currentFileMetadata.fileId)
        : notes;

    const handleEdit = (note: Note) => {
        setEditingNote(note);
        setNoteModalVisible(true);
    };

    const handleCloseModal = () => {
        setNoteModalVisible(false);
        setEditingNote(null);
    };

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
                        <Text style={[styles.title, { color: theme.text }]}>Study Reflections</Text>
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

                <NoteList 
                    notes={filteredNotes} 
                    onDelete={deleteNote} 
                    onEdit={handleEdit}
                />

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.tint }]}
                    onPress={() => {
                        setEditingNote(null);
                        setNoteModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>

                <NoteModal
                    visible={noteModalVisible}
                    onClose={handleCloseModal}
                    onSave={addNote}
                    onUpdate={updateNote}
                    noteToEdit={editingNote}
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
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 40,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
});
