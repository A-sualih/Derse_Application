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
                <View style={[styles.emptyIconBox, { backgroundColor: theme.border + '50' }]}>
                    <Ionicons name="document-text-outline" size={48} color={theme.icon} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No notes yet</Text>
                <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
                    Your study notes will appear here.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={notes}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <View style={[styles.noteItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.noteContent}>
                        <Text style={[styles.noteText, { color: theme.text }]}>{item.content}</Text>
                        <View style={styles.noteMetadata}>
                            <View style={styles.dateBox}>
                                <Ionicons name="time-outline" size={12} color={theme.secondaryText} style={{ marginRight: 4 }} />
                                <Text style={[styles.dateText, { color: theme.secondaryText }]}>
                                    {formatDate(item.createdAt)}
                                </Text>
                            </View>
                            {item.fileName && (
                                <View style={[styles.badge, { backgroundColor: theme.tint + '10' }]}>
                                    <Text style={[styles.contextText, { color: theme.tint }]} numberOfLines={1}>
                                        {item.fileName}{item.pageNumber ? ` • p. ${item.pageNumber}` : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        style={[styles.deleteButton, { backgroundColor: '#FF3B3010' }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    noteItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        alignItems: 'flex-start',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    noteContent: {
        flex: 1,
        marginRight: 10,
    },
    noteText: {
        fontSize: 16,
        marginBottom: 12,
        lineHeight: 24,
        fontWeight: '500',
    },
    noteMetadata: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        maxWidth: '80%',
    },
    contextText: {
        fontSize: 11,
        fontWeight: '600',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
});
