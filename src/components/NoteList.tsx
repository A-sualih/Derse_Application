import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Note } from '../types/note';

interface NoteListProps {
    notes: Note[];
    onDelete: (id: string) => void;
    onEdit: (note: Note) => void;
}

export function NoteList({ notes, onDelete, onEdit }: NoteListProps) {
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
                <View style={[styles.emptyIconBox, { backgroundColor: theme.tint + '10' }]}>
                    <Ionicons name="document-text" size={56} color={theme.tint} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Start Your Reflection</Text>
                <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
                    Capture your study journey. Your notes for each Derse will organize here beautifully.
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
                    {/* Header: Date and Source (if any) */}
                    <View style={styles.noteHeader}>
                        <View style={styles.dateInfo}>
                           <Ionicons name="calendar-outline" size={14} color={theme.secondaryText} style={{ marginRight: 6 }} />
                           <Text style={[styles.dateText, { color: theme.secondaryText }]}>
                               {formatDate(item.createdAt)}
                               {item.updatedAt ? ' (Edited)' : ''}
                           </Text>
                        </View>
                        {item.fileName && (
                           <View style={[styles.sourceBadge, { backgroundColor: theme.tint + '10' }]}>
                               <Ionicons name="book-outline" size={12} color={theme.tint} style={{ marginRight: 4 }} />
                               <Text style={[styles.sourceText, { color: theme.tint }]} numberOfLines={1}>
                                   {item.fileName}{item.pageNumber ? ` • p. ${item.pageNumber}` : ''}
                               </Text>
                           </View>
                        )}
                    </View>

                    {/* Content */}
                    <Text style={[styles.noteText, { color: theme.text }]}>{item.content}</Text>

                    {/* Actions */}
                    <View style={[styles.noteActions, { borderTopColor: theme.border + '50' }]}>
                        <TouchableOpacity
                            onPress={() => onEdit(item)}
                            style={styles.actionBtn}
                        >
                            <Ionicons name="create-outline" size={20} color={theme.tint} />
                            <Text style={[styles.actionLabel, { color: theme.tint }]}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => onDelete(item.id)}
                            style={styles.actionBtn}
                        >
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                            <Text style={[styles.actionLabel, { color: '#FF3B30' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: 20,
        paddingBottom: 120, // More space for Floating button
    },
    noteItem: {
        borderRadius: 28,
        marginBottom: 20,
        borderWidth: 1,
        borderBottomWidth: 4, // Professional "lifted" look
        overflow: 'hidden',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
    },
    sourceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        maxWidth: '50%',
    },
    sourceText: {
        fontSize: 11,
        fontWeight: '800',
    },
    noteText: {
        fontSize: 17,
        lineHeight: 26,
        fontWeight: '500',
        marginBottom: 20,
    },
    noteActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingTop: 16,
        gap: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 6,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingBottom: 60,
    },
    emptyIconBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
});
