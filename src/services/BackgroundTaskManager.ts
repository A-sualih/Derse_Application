import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackgroundTask } from '../types/background';

const TASKS_STORAGE_KEY = '@background_tasks_v1';

type Listener = (tasks: BackgroundTask[]) => void;

class BackgroundTaskManager {
    private tasks: BackgroundTask[] = [];
    private listeners: Set<Listener> = new Set();
    private initialized = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadTasks();
        }
    }

    on(event: 'update', listener: Listener) {
        this.listeners.add(listener);
    }

    off(event: 'update', listener: Listener) {
        this.listeners.delete(listener);
    }

    private async loadTasks() {
        try {
            const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
            if (stored) {
                this.tasks = JSON.parse(stored);
                // On reload, move 'running' tasks to 'paused' or 'failed' if they were interrupted
                this.tasks = this.tasks.map(t => 
                    t.status === 'running' ? { ...t, status: 'paused', currentStep: 'Interrupted' } : t
                );
                this.emitUpdate();
            }
        } catch (e) {
            console.error('Failed to load background tasks', e);
        } finally {
            this.initialized = true;
        }
    }

    private async saveTasks() {
        try {
            await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Failed to save background tasks', e);
        }
    }

    private emitUpdate() {
        const tasksCopy = [...this.tasks];
        this.listeners.forEach(listener => listener(tasksCopy));
        this.saveTasks();
    }

    getTasks() {
        return this.tasks;
    }

    addTask(taskData: Omit<BackgroundTask, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>) {
        const id = Math.random().toString(36).substring(2, 11);
        const newTask: BackgroundTask = {
            ...taskData,
            id,
            status: 'pending',
            progress: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        this.tasks = [newTask, ...this.tasks];
        this.emitUpdate();
        return id;
    }

    updateTask(id: string, updates: Partial<BackgroundTask>) {
        this.tasks = this.tasks.map(t => 
            t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
        );
        this.emitUpdate();
    }

    removeTask(id: string) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.emitUpdate();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(t => t.status !== 'completed');
        this.emitUpdate();
    }

    // Task Execution Logic
    async runDownload(id: string, url: string, filename: string) {
        this.updateTask(id, { status: 'running', currentStep: 'Initializing download...', data: { url, filename } });
        
        try {
            let progress = 0;
            const interval = setInterval(() => {
                const task = this.tasks.find(t => t.id === id);
                if (!task || task.status !== 'running') {
                    clearInterval(interval);
                    return;
                }

                progress += Math.random() * 8;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    this.updateTask(id, { 
                        status: 'completed', 
                        progress: 100, 
                        currentStep: 'Download finished',
                        estimatedTimeRemaining: '0s'
                    });
                } else {
                    this.updateTask(id, { 
                        progress, 
                        currentStep: 'Downloading data...',
                        estimatedTimeRemaining: `${Math.max(1, Math.round((100 - progress) / 5))}s`,
                        speed: `${(Math.random() * 3 + 2).toFixed(1)} MB/s`
                    });
                }
            }, 600);

        } catch (error: any) {
            this.updateTask(id, { status: 'failed', error: error.message || 'Unknown error' });
        }
    }

    async retryTask(id: string) {
        const task = this.tasks.find(t => t.id === id);
        if (task && (task.status === 'failed' || task.status === 'cancelled')) {
            this.updateTask(id, { status: 'pending', error: undefined });
            setTimeout(() => this.runDownload(id, task.data?.url || 'fake-url', task.data?.filename || 'fake-file'), 1000);
        }
    }

    private async checkNetwork() {
        return true;
    }

    private setupAutoRetry() {
        setInterval(() => {
            const failedTasks = this.tasks.filter(t => t.status === 'failed');
            failedTasks.forEach(t => {
                const retryCount = (t.data?.retryCount || 0);
                if (retryCount < 3) {
                    this.updateTask(t.id, { data: { ...t.data, retryCount: retryCount + 1 } });
                    this.retryTask(t.id);
                }
            });
        }, 60000);
    }
}

export const backgroundTaskManager = new BackgroundTaskManager();
