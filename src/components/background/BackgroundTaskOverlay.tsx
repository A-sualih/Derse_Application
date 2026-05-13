import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { 
    FlatList, 
    Modal, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View,
    Platform 
} from 'react-native';
import { useBackgroundTasks } from '../../context/BackgroundTaskContext';
import { BackgroundTask } from '../../types/background';

export const BackgroundTaskOverlay: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
    const { tasks, clearCompleted, removeTask } = useBackgroundTasks();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const getStatusIcon = (status: BackgroundTask['status']) => {
        switch (status) {
            case 'completed': return { name: 'checkmark-circle', color: '#10B981' };
            case 'failed': return { name: 'alert-circle', color: '#EF4444' };
            case 'running': return { name: 'sync', color: '#3B82F6' };
            case 'paused': return { name: 'pause-circle', color: '#F59E0B' };
            default: return { name: 'ellipsis-horizontal-circle', color: '#64748B' };
        }
    };

    const renderTask = ({ item }: { item: BackgroundTask }) => {
        const icon = getStatusIcon(item.status);
        return (
            <View style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.taskHeader}>
                    <View style={[styles.iconBox, { backgroundColor: icon.color + '20' }]}>
                        <Ionicons name={icon.name as any} size={24} color={icon.color} />
                    </View>
                    <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.taskMeta, { color: theme.secondaryText }]}>
                            {item.currentStep || item.status.toUpperCase()}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeTask(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={theme.icon} />
                    </TouchableOpacity>
                </View>

                {item.status === 'running' || item.status === 'paused' || item.status === 'completed' ? (
                    <View style={styles.progressSection}>
                        <View style={styles.progressLabels}>
                            <Text style={[styles.progressText, { color: theme.text }]}>{Math.round(item.progress)}%</Text>
                            <Text style={[styles.progressText, { color: theme.secondaryText }]}>{item.estimatedTimeRemaining || ''}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <LinearGradient
                                colors={['#3B82F6', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${item.progress}%` }]}
                            />
                        </View>
                        {item.speed && (
                            <Text style={[styles.speedText, { color: theme.secondaryText }]}>{item.speed}</Text>
                        )}
                    </View>
                ) : null}

                {item.error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{item.error}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
                
                <View style={[styles.container, { backgroundColor: theme.background + 'EE' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Task Center</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={clearCompleted} style={styles.clearBtn}>
                                <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Clear Finished</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTask}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="documents-outline" size={64} color={theme.icon} />
                                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No background tasks</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        height: '85%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    closeBtn: {
        padding: 5,
    },
    clearBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    listContent: {
        paddingBottom: 40,
    },
    taskCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    taskMeta: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    progressSection: {
        marginTop: 10,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    speedText: {
        fontSize: 10,
        marginTop: 6,
        textAlign: 'right',
        fontStyle: 'italic',
    },
    errorBox: {
        marginTop: 12,
        padding: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 10,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
});
