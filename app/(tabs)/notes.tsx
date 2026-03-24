import { Colors } from '@/constants/theme';
import { NoteModal } from '@/src/components/NoteModal';
import { NoteList } from '@/src/components/NoteList';
import { useNotes } from '@/src/context/NoteContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Note } from '@/src/types/note';

export default function NotesScreen() {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const { notes, addNote, updateNote, deleteNote } = useNotes();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const handleEdit = (note: Note) => {
        setEditingNote(note);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingNote(null);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Your Reflections',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { fontWeight: '900', fontSize: 26 },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                }}
            />

            <NoteList 
                notes={notes} 
                onDelete={deleteNote} 
                onEdit={handleEdit}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                onPress={() => {
                    setEditingNote(null);
                    setModalVisible(true);
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={40} color="#fff" />
            </TouchableOpacity>

            <NoteModal
                visible={modalVisible}
                onClose={handleCloseModal}
                onSave={addNote}
                onUpdate={updateNote}
                noteToEdit={editingNote}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 28,
        bottom: 110, // Adjusted for MiniPlayer space
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
    },
});
