export interface Note {
    id: string;
    content: string;
    createdAt: number;
    fileId?: string;
    fileName?: string;
    pageNumber?: number;
}
