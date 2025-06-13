import { IResource } from '../models/Resource';
type ResourceSource = 'MoPSE' | 'CollegePress' | 'Teacha' | 'YouTube' | 'Custom';
interface ResourceFetchOptions {
    subject: string;
    grade: 'O' | 'A';
    type?: 'book' | 'video' | 'document' | 'quiz' | 'practice';
    source?: ResourceSource;
    limit?: number;
    skip?: number;
}
declare class EducationResourceService {
    private fetchMoPSEResources;
    private fetchCollegePressResources;
    private fetchTeachaResources;
    private mapGradeToDifficulty;
    private mapTeachaType;
    fetchResources(options: ResourceFetchOptions): Promise<IResource[]>;
    getRecommendations(_userId: string, subject: string, grade: 'O' | 'A'): Promise<IResource[]>;
}
declare const _default: EducationResourceService;
export default _default;
