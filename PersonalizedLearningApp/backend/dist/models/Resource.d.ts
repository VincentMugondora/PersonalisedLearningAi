import mongoose, { Document } from 'mongoose';
export interface IResourceMetadata {
    publisher?: string;
    year?: number;
    language?: string;
    format?: string;
    price?: number;
    currency?: string;
    resourceType?: string;
    fileSize?: number;
    downloadCount?: number;
    rating?: number;
}
export interface IResource extends Document {
    title: string;
    description: string;
    subject: string;
    grade: 'O' | 'A';
    type: 'book' | 'video' | 'document' | 'practice' | 'quiz';
    url: string;
    thumbnailUrl?: string;
    source: 'MoPSE' | 'CollegePress' | 'Teacha' | 'YouTube' | 'ZIMSEC' | 'SecondaryBookPress';
    author: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    isActive: boolean;
    metadata?: IResourceMetadata;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IResource, {}, {}, {}, mongoose.Document<unknown, {}, IResource, {}> & IResource & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
