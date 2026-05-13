import React, { createContext, useContext, useEffect, useState } from 'react';
import { BackgroundTask } from '../types/background';
import { backgroundTaskManager } from '../services/BackgroundTaskManager';

interface BackgroundTaskContextType {
    tasks: BackgroundTask[];
    addTask: (task: Omit<BackgroundTask, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>) => string;
    updateTask: (id: string, updates: Partial<BackgroundTask>) => void;
    removeTask: (id: string) => void;
    clearCompleted: () => void;
    runSimulation: (title: string, type: BackgroundTask['type']) => void;
}

const BackgroundTaskContext = createContext<BackgroundTaskContextType | undefined>(undefined);

export const BackgroundTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<BackgroundTask[]>(backgroundTaskManager.getTasks());

    useEffect(() => {
        const handleUpdate = (updatedTasks: BackgroundTask[]) => {
            setTasks(updatedTasks);
        };
        backgroundTaskManager.on('update', handleUpdate);
        return () => {
            backgroundTaskManager.off('update', handleUpdate);
        };
    }, []);

    const addTask = (task: any) => backgroundTaskManager.addTask(task);
    const updateTask = (id: string, updates: any) => backgroundTaskManager.updateTask(id, updates);
    const removeTask = (id: string) => backgroundTaskManager.removeTask(id);
    const clearCompleted = () => backgroundTaskManager.clearCompleted();

    const runSimulation = (title: string, type: BackgroundTask['type']) => {
        const id = addTask({ title, type });
        backgroundTaskManager.runDownload(id, 'fake-url', 'fake-file');
    };

    return (
        <BackgroundTaskContext.Provider value={{ 
            tasks, 
            addTask, 
            updateTask, 
            removeTask, 
            clearCompleted,
            runSimulation 
        }}>
            {children}
        </BackgroundTaskContext.Provider>
    );
};

export const useBackgroundTasks = () => {
    const context = useContext(BackgroundTaskContext);
    if (!context) {
        throw new Error('useBackgroundTasks must be used within a BackgroundTaskProvider');
    }
    return context;
};
