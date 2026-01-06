import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Note } from '../types/note';

interface NoteListProps {
    notes: Note[];
    onDelete: (id: string) => void;
}

export function NoteList({ notes, onDelete }: NoteListProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (notes.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={colorScheme === 'dark' ? '#333' : '#ccc'} />
                <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
                    No notes yet
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={notes}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <View style={[styles.noteItem, { backgroundColor: theme.background, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
                    <View style={styles.noteContent}>
                        <Text style={[styles.noteText, { color: theme.text }]}>{item.content}</Text>
                        <View style={styles.noteMetadata}>
                            <Text style={[styles.dateText, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
                                {formatDate(item.createdAt)}
                            </Text>
                            {item.fileName && (
                                <Text style={[styles.contextText, { color: theme.tint }]}>
                                    • {item.fileName}{item.pageNumber ? `, p. ${item.pageNumber}` : ''}
                                </Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        style={styles.deleteButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
    },
    noteItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    noteContent: {
        flex: 1,
        marginRight: 10,
    },
    noteText: {
        fontSize: 16,
        marginBottom: 8,
        lineHeight: 22,
    },
    dateText: {
        fontSize: 12,
    },
    noteMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contextText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    deleteButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
});
