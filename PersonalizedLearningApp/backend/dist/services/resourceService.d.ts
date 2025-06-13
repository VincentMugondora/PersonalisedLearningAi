import { IResource } from '../models/Resource';
interface ResourceSearchParams {
    subject?: string;
    grade?: 'O' | 'A';
    type?: 'video' | 'document' | 'quiz' | 'practice';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    limit?: number;
    skip?: number;
}
declare class ResourceService {
    private mapGradeToDifficulty;
    searchResources(params: ResourceSearchParams): Promise<{
        resources: (import("mongoose").Document<unknown, {}, IResource, {}> & IResource & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        hasMore: boolean;
    }>;
    private fetchYouTubeResources;
    fetchZimsecResources(subject: string, grade: 'O' | 'A'): Promise<{
        title: string;
        description: string;
        subject: string;
        grade: "O" | "A";
        type: "document";
        url: string;
        source: string;
        difficulty: "advanced";
        tags: string[];
        isActive: boolean;
    }[]>;
    addCustomResource(resourceData: Partial<IResource>): Promise<import("mongoose").Document<unknown, {}, IResource, {}> & IResource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateResource(id: string, updates: Partial<IResource>): Promise<(import("mongoose").Document<unknown, {}, IResource, {}> & IResource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    deleteResource(id: string): Promise<(import("mongoose").Document<unknown, {}, IResource, {}> & IResource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    getRecommendations(_userId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, IResource, {}> & IResource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    createResource(data: {
        title: string;
        description: string;
        url: string;
        type: string;
        subject: string;
        grade: string;
        metadata?: any;
    }): Promise<import("mongoose").Document<unknown, {}, IResource, {}> & IResource & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    syncYouTubeResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]>;
}
declare const _default: ResourceService;
export default _default;
