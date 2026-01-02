import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Note } from '../types/note';

interface NoteContextType {
    notes: Note[];
    addNote: (content: string) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const savedNotes = await AsyncStorage.getItem('user_notes');
            if (savedNotes) {
                setNotes(JSON.parse(savedNotes));
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    };

    const saveNotes = async (newNotes: Note[]) => {
        try {
            await AsyncStorage.setItem('user_notes', JSON.stringify(newNotes));
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    };

    const addNote = async (content: string) => {
        const newNote: Note = {
            id: Date.now().toString(),
            content,
            createdAt: Date.now(),
        };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        await saveNotes(updatedNotes);
    };

    const deleteNote = async (id: string) => {
        const updatedNotes = notes.filter(note => note.id !== id);
        setNotes(updatedNotes);
        await saveNotes(updatedNotes);
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote }}>
            {children}
        </NoteContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NoteContext);
    if (context === undefined) {
        throw new Error('useNotes must be used within a NoteProvider');
    }
    return context;
}
