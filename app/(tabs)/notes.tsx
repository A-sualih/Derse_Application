import { Colors } from '@/constants/theme';
import { AddNoteModal } from '@/src/components/AddNoteModal';
import { NoteList } from '@/src/components/NoteList';
import { useNotes } from '@/src/context/NoteContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const { notes, addNote, deleteNote } = useNotes();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Your Notes',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { fontWeight: '800', fontSize: 22 },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                }}
            />

            <NoteList notes={notes} onDelete={deleteNote} />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <AddNoteModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={addNote}
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
        right: 24,
        bottom: 110, // Adjusted for MiniPlayer space
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
});
