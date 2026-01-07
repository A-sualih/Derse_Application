import { Colors } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useUser } from '@/src/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const router = useRouter();
    const { userProfile, saveProfile } = useUser();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name);
            setPhoneNumber(userProfile.phoneNumber);
            setUsername(userProfile.username);
        }
    }, [userProfile]);

    const handleSave = async () => {
        await saveProfile({ name, phoneNumber, username });
        Alert.alert('Success', 'Profile updated successfully!');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out Derse App! Download it now: https://expo.dev/artifacts/eas/k7VYj8PW7dCaQNMKWzALoe.apk',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share the app.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Profile & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.secondaryText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>Username</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            placeholderTextColor={theme.secondaryText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            placeholderTextColor={theme.secondaryText}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 24 }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Connect With Us</Text>

                    <TouchableOpacity
                        style={[styles.supportBtn, { borderColor: theme.border }]}
                        onPress={() => Linking.openURL('tel:+251926342943')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.tint + '15' }]}>
                            <Ionicons name="call" size={20} color={theme.tint} />
                        </View>
                        <View style={styles.supportInfo}>
                            <Text style={[styles.supportLabel, { color: theme.secondaryText }]}>Phone Support</Text>
                            <Text style={[styles.supportValue, { color: theme.text }]}>+251 926 342 943</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.supportBtn, { borderColor: theme.border, marginTop: 12 }]}
                        onPress={() => Linking.openURL('https://t.me/SofleetoAllah26')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#0088cc15' }]}>
                            <Ionicons name="paper-plane" size={20} color="#0088cc" />
                        </View>
                        <View style={styles.supportInfo}>
                            <Text style={[styles.supportLabel, { color: theme.secondaryText }]}>Telegram</Text>
                            <Text style={[styles.supportValue, { color: theme.text }]}>@SofleetoAllah26</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.tint + '10', marginTop: 20 }]}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-social" size={20} color={theme.tint} style={{ marginRight: 8 }} />
                        <Text style={[styles.actionBtnText, { color: theme.tint }]}>Share Application</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                        Developed with love by Derse App Team.
                    </Text>
                    <View style={[styles.versionBadge, { backgroundColor: theme.border + '50' }]}>
                        <Text style={[styles.versionText, { color: theme.text }]}>
                            Version 1.0.0
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 20,
        letterSpacing: -0.3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        marginBottom: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        marginTop: 10,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    supportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    supportInfo: {
        flex: 1,
    },
    supportLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    supportValue: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 2,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    infoSection: {
        marginTop: 48,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 12,
    },
    versionBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    versionText: {
        fontSize: 11,
        fontWeight: '700',
    }
});
