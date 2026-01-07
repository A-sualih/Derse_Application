import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AddNoteModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (content: string, metadata?: any) => void;
    metadata?: {
        fileId?: string;
        fileName?: string;
        pageNumber?: number;
    };
}

export function AddNoteModal({ visible, onClose, onSave, metadata }: AddNoteModalProps) {
    const [content, setContent] = useState('');
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const handleSave = () => {
        if (content.trim()) {
            onSave(content, metadata);
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
                            <Text style={[styles.title, { color: theme.text }]}>New Note</Text>
                            {metadata?.fileName && (
                                <View style={[styles.metaBadge, { backgroundColor: theme.tint + '10' }]}>
                                    <Ionicons name="document-outline" size={12} color={theme.tint} style={{ marginRight: 4 }} />
                                    <Text style={[styles.subtitle, { color: theme.tint }]} numberOfLines={1}>
                                        {metadata.fileName}{metadata.pageNumber ? ` • Page ${metadata.pageNumber}` : ''}
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
                        placeholder="What did you learn today?"
                        placeholderTextColor={theme.secondaryText}
                        multiline
                        textAlignVertical="top"
                        value={content}
                        onChangeText={setContent}
                        autoFocus
                    />

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
                        <Text style={styles.saveButtonText}>Save Note</Text>
                    </TouchableOpacity>
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
        height: '85%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -1,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    saveButton: {
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
