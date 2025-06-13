"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Resource_1 = __importDefault(require("../models/Resource"));
const OER_COMMONS_API = 'https://api.oercommons.org/v1';
const CK12_API = 'https://api.ck12.org/v1';
class OERResourceService {
    mapSubjectToOER(subject) {
        const subjectMap = {
            'Mathematics': 'mathematics',
            'Physics': 'physics',
            'Chemistry': 'chemistry',
            'Biology': 'biology',
            'English': 'english-language-arts',
            'History': 'history',
            'Geography': 'geography',
            'Computer Science': 'computer-science',
            'Commerce': 'business',
            'Accounts': 'accounting',
            'Literature': 'literature',
            'Agriculture': 'agriculture'
        };
        return subjectMap[subject] || subject.toLowerCase();
    }
    mapGradeToOER(grade) {
        return grade === 'O'
            ? ['9-10', '11-12']
            : ['11-12', '13-14'];
    }
    async fetchOERCommonsResources(subject, grade) {
        try {
            const mappedSubject = this.mapSubjectToOER(subject);
            const gradeLevels = this.mapGradeToOER(grade);
            const response = await axios_1.default.get(`${OER_COMMONS_API}/search`, {
                params: {
                    subject: mappedSubject,
                    grade_level: gradeLevels.join(','),
                    format: 'json',
                    per_page: 20
                }
            });
            return response.data.items.map((item) => ({
                title: item.title,
                description: item.description || 'No description available',
                type: this.determineResourceType(item.material_type),
                url: item.url,
                thumbnailUrl: item.thumbnail_url,
                subject,
                grade,
                source: 'OERCommons',
                author: item.provider || 'OER Commons',
                difficulty: this.mapGradeToDifficulty(grade),
                tags: [subject, grade, item.material_type, 'OERCommons', ...(item.keywords || [])],
                isActive: true,
                metadata: {
                    publisher: item.provider,
                    year: new Date(item.date_created).getFullYear(),
                    language: item.language,
                    format: item.material_type,
                    license: item.license
                }
            }));
        }
        catch (error) {
            console.error('Error fetching OER Commons resources:', error);
            return [];
        }
    }
    async fetchCK12Resources(subject, grade) {
        try {
            const mappedSubject = this.mapSubjectToCK12(subject);
            const gradeLevel = this.mapGradeToCK12(grade);
            const response = await axios_1.default.get(`${CK12_API}/concepts`, {
                params: {
                    subject: mappedSubject,
                    grade: gradeLevel,
                    limit: 20
                }
            });
            return response.data.concepts.map((concept) => ({
                title: concept.title,
                description: concept.description || 'No description available',
                type: 'document',
                url: concept.url,
                thumbnailUrl: concept.thumbnail_url,
                subject,
                grade,
                source: 'CK12',
                author: 'CK-12 Foundation',
                difficulty: this.mapGradeToDifficulty(grade),
                tags: [subject, grade, 'CK12', ...(concept.tags || [])],
                isActive: true,
                metadata: {
                    publisher: 'CK-12 Foundation',
                    year: new Date().getFullYear(),
                    language: 'en',
                    format: 'interactive',
                    license: 'CC BY-NC-SA'
                }
            }));
        }
        catch (error) {
            console.error('Error fetching CK-12 resources:', error);
            return [];
        }
    }
    mapSubjectToCK12(subject) {
        const subjectMap = {
            'Mathematics': 'math',
            'Physics': 'physics',
            'Chemistry': 'chemistry',
            'Biology': 'biology',
            'English': 'english',
            'History': 'history',
            'Geography': 'geography',
            'Computer Science': 'computer-science'
        };
        return subjectMap[subject] || subject.toLowerCase();
    }
    mapGradeToCK12(grade) {
        return grade === 'O' ? '9-12' : '11-12';
    }
    determineResourceType(materialType) {
        const typeMap = {
            'textbook': 'book',
            'video': 'video',
            'lesson': 'document',
            'activity': 'practice',
            'assessment': 'quiz',
            'simulation': 'practice',
            'interactive': 'practice'
        };
        return typeMap[materialType] || 'document';
    }
    mapGradeToDifficulty(grade) {
        return grade === 'O' ? 'intermediate' : 'advanced';
    }
    async fetchResources(options) {
        const { subject, grade, source, limit = 20 } = options;
        let resources = [];
        try {
            if (!source || source === 'OERCommons') {
                const oerResources = await this.fetchOERCommonsResources(subject, grade);
                resources = resources.concat(oerResources);
            }
            if (!source || source === 'CK12') {
                const ck12Resources = await this.fetchCK12Resources(subject, grade);
                resources = resources.concat(ck12Resources);
            }
            const limitedResources = resources.slice(0, limit);
            if (limitedResources.length > 0) {
                try {
                    await Resource_1.default.insertMany(limitedResources, { ordered: false });
                    console.log(`Successfully saved ${limitedResources.length} OER resources to database`);
                }
                catch (error) {
                    console.error('Error saving OER resources to database:', error);
                }
            }
            return limitedResources;
        }
        catch (error) {
            console.error('Error fetching OER resources:', error);
            throw error;
        }
    }
}
exports.default = new OERResourceService();
//# sourceMappingURL=oerResourceService.js.map