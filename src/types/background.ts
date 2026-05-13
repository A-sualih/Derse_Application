export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface BackgroundTask {
    id: string;
    title: string;
    type: 'upload' | 'download' | 'sync' | 'backup' | 'report' | 'batch';
    status: TaskStatus;
    progress: number; // 0 to 100
    currentStep?: string;
    estimatedTimeRemaining?: string; // e.g., "2 minutes"
    speed?: string; // e.g., "1.2 MB/s"
    error?: string;
    createdAt: number;
    updatedAt: number;
    data?: any; // Task specific data (e.g., file path, URL)
}

export interface TaskStore {
    tasks: BackgroundTask[];
    addTask: (task: Omit<BackgroundTask, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>) => string;
    updateTask: (id: string, updates: Partial<BackgroundTask>) => void;
    removeTask: (id: string) => void;
    retryTask: (id: string) => void;
    cancelTask: (id: string) => void;
}
