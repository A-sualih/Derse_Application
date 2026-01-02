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
                    title: 'Notes',
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                }}
            />

            <NoteList notes={notes} onDelete={deleteNote} />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint }]}
                onPress={() => setModalVisible(true)}
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
        right: 20,
        bottom: 20,
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
