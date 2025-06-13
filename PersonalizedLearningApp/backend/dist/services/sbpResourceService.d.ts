import { IResource } from '../models/Resource';
interface SBPFetchOptions {
    subject: string;
    grade: 'O' | 'A';
    type?: 'textbook' | 'revision-guide';
    limit?: number;
}
declare class SBPResourceService {
    private mapSubjectToSBP;
    private mapGradeToSBP;
    fetchResources(options: SBPFetchOptions): Promise<IResource[]>;
    private determineResourceType;
    private mapGradeToDifficulty;
    private parseFileSize;
}
declare const _default: SBPResourceService;
export default _default;
