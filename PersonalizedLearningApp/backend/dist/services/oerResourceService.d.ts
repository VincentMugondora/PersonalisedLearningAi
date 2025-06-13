import { IResource } from '../models/Resource';
interface OERFetchOptions {
    subject: string;
    grade: 'O' | 'A';
    source?: 'OERCommons' | 'CK12' | 'Kolibri';
    limit?: number;
}
declare class OERResourceService {
    private mapSubjectToOER;
    private mapGradeToOER;
    private fetchOERCommonsResources;
    private fetchCK12Resources;
    private mapSubjectToCK12;
    private mapGradeToCK12;
    private determineResourceType;
    private mapGradeToDifficulty;
    fetchResources(options: OERFetchOptions): Promise<IResource[]>;
}
declare const _default: OERResourceService;
export default _default;
