import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Note } from '../types/note';

interface NoteModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (content: string, metadata?: any) => void;
    onUpdate?: (id: string, content: string) => void;
    noteToEdit?: Note | null;
    metadata?: {
        fileId?: string;
        fileName?: string;
        pageNumber?: number;
    };
}

export function NoteModal({ visible, onClose, onSave, onUpdate, noteToEdit, metadata }: NoteModalProps) {
    const [content, setContent] = useState('');
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    useEffect(() => {
        if (noteToEdit) {
            setContent(noteToEdit.content);
        } else {
            setContent('');
        }
    }, [noteToEdit, visible]);

    const handleSave = () => {
        if (content.trim()) {
            if (noteToEdit && onUpdate) {
                onUpdate(noteToEdit.id, content);
            } else {
                onSave(content, metadata);
            }
            setContent('');
            onClose();
        }
    };

    const handleClose = () => {
        setContent('');
        onClose();
    };

    const isDark = colorScheme === 'dark';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <BlurView
                    intensity={isDark ? 80 : 100}
                    tint={isDark ? 'dark' : 'light'}
                    style={[styles.modalContent, { borderTopColor: theme.border }]}
                >
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.text }]}>
                                {noteToEdit ? 'Edit Note' : 'New Note'}
                            </Text>
                            {(metadata?.fileName || noteToEdit?.fileName) && (
                                <View style={[styles.metaBadge, { backgroundColor: theme.tint + '15' }]}>
                                    <Ionicons name="document-outline" size={14} color={theme.tint} style={{ marginRight: 6 }} />
                                    <Text style={[styles.subtitle, { color: theme.tint }]} numberOfLines={1}>
                                        {metadata?.fileName || noteToEdit?.fileName}
                                        {(metadata?.pageNumber || noteToEdit?.pageNumber) ? ` • Page ${metadata?.pageNumber || noteToEdit?.pageNumber}` : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={[styles.closeBtn, { backgroundColor: theme.border + '50' }]}
                        >
                            <Ionicons name="close" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: theme.text,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                borderColor: theme.border
                            }
                        ]}
                        placeholder="Reflection / Study notes..."
                        placeholderTextColor={theme.secondaryText}
                        multiline
                        textAlignVertical="top"
                        value={content}
                        onChangeText={setContent}
                        autoFocus
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                {
                                    backgroundColor: theme.tint,
                                    opacity: content.trim() ? 1 : 0.6,
                                    shadowColor: theme.tint
                                }
                            ]}
                            onPress={handleSave}
                            disabled={!content.trim()}
                        >
                            <Text style={styles.saveButtonText}>
                                {noteToEdit ? 'Update Note' : 'Save Note'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        height: '80%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        padding: 24,
        fontSize: 18,
        lineHeight: 28,
        marginBottom: 24,
    },
    footer: {
        width: '100%',
    },
    saveButton: {
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        elevation: 10,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});
