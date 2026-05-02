import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useOTAUpdate = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const onFetchUpdateAsync = async () => {
    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setIsUpdating(true);
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to restart the app to apply the update?',
          [
            {
              text: 'Later',
              style: 'cancel',
            },
            {
              text: 'Restart',
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ]
        );
      } else {
        // Only show alert if manually triggered
        // For automatic checks, we might want to stay silent
      }
    } catch (error) {
      console.error('Error fetching latest Expo update:', error);
    } finally {
      setIsChecking(false);
      setIsUpdating(false);
    }
  };

  const checkManually = async () => {
    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setIsUpdating(true);
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'Update Found',
          'The update has been downloaded. Restart the app to apply changes?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Restart Now', onPress: () => Updates.reloadAsync() }
          ]
        );
      } else {
        Alert.alert('Up to Date', 'You are already running the latest version of Derse App.');
      }
    } catch (error) {
      Alert.alert('Update Error', 'Failed to check for updates. Please check your internet connection.');
      console.error(error);
    } finally {
      setIsChecking(false);
      setIsUpdating(false);
    }
  };

  return { onFetchUpdateAsync, checkManually, isChecking, isUpdating };
};
