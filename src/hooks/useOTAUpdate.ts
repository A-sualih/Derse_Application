import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { backgroundTaskManager } from '../services/BackgroundTaskManager';

export const useOTAUpdate = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const onFetchUpdateAsync = async () => {
    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setIsUpdating(true);
        const taskId = backgroundTaskManager.addTask({ 
          title: 'System Update', 
          type: 'sync' 
        });
        
        backgroundTaskManager.updateTask(taskId, { 
          status: 'running', 
          currentStep: 'Downloading new version...' 
        });

        await Updates.fetchUpdateAsync();
        
        backgroundTaskManager.updateTask(taskId, { 
          status: 'completed', 
          progress: 100, 
          currentStep: 'Ready to restart' 
        });
        
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
    } catch (error: any) {
      console.error('Error fetching latest Expo update:', error);
      // If we have a running task, mark it as failed
      const activeTasks = backgroundTaskManager.getTasks();
      const updateTask = activeTasks.find(t => t.title === 'System Update' && t.status === 'running');
      if (updateTask) {
        backgroundTaskManager.updateTask(updateTask.id, { 
          status: 'failed', 
          error: error.message || 'Update failed' 
        });
      }
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
        const taskId = backgroundTaskManager.addTask({ 
          title: 'OTA Update', 
          type: 'sync' 
        });
        
        backgroundTaskManager.updateTask(taskId, { 
          status: 'running', 
          currentStep: 'Installing update...' 
        });

        await Updates.fetchUpdateAsync();

        backgroundTaskManager.updateTask(taskId, { 
          status: 'completed', 
          progress: 100, 
          currentStep: 'Update installed' 
        });

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
