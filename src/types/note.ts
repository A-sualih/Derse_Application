export interface Note {
    id: string;
    content: string;
    createdAt: number;
    updatedAt?: number;
    fileId?: string;
    fileName?: string;
    pageNumber?: number;
}
