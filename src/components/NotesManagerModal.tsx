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
}

export function NotesManagerModal({ visible, onClose }: NotesManagerModalProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const { notes, addNote, deleteNote } = useNotes();
    const [addModalVisible, setAddModalVisible] = useState(false);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
                    <Text style={[styles.title, { color: theme.text }]}>Notes</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <NoteList notes={notes} onDelete={deleteNote} />

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
