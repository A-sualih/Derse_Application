import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AddNoteModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (content: string) => void;
}

export function AddNoteModal({ visible, onClose, onSave }: AddNoteModalProps) {
    const [content, setContent] = useState('');
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const handleSave = () => {
        if (content.trim()) {
            onSave(content);
            setContent('');
            onClose();
        }
    };

    const handleClose = () => {
        setContent('');
        onClose();
    };

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
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>New Note</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}
                        placeholder="Write your note here..."
                        placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                        multiline
                        textAlignVertical="top"
                        value={content}
                        onChangeText={setContent}
                        autoFocus
                    />

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.tint, opacity: content.trim() ? 1 : 0.5 }]}
                        onPress={handleSave}
                        disabled={!content.trim()}
                    >
                        <Text style={styles.saveButtonText}>Save Note</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
