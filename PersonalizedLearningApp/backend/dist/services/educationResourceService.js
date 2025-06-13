"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Resource_1 = __importDefault(require("../models/Resource"));
const MOPSE_API_URL = process.env.MOPSE_API_URL || 'https://api.mopse-library.zw';
const TEACH_API_URL = process.env.TEACH_API_URL || 'https://api.teacha.co.zw';
const COLLEGE_PRESS_API_URL = process.env.COLLEGE_PRESS_API_URL || 'https://api.collegepress.co.zw';
class EducationResourceService {
    async fetchMoPSEResources(subject, grade) {
        try {
            const response = await axios_1.default.get(`${MOPSE_API_URL}/books`, {
                params: {
                    subject,
                    grade: grade === 'O' ? 'Ordinary' : 'Advanced',
                    format: 'digital'
                }
            });
            return response.data.map((book) => ({
                title: book.title,
                description: book.description || 'No description available',
                type: 'book',
                url: book.downloadUrl || book.readUrl,
                thumbnailUrl: book.coverImage,
                subject,
                grade,
                source: 'MoPSE',
                author: book.author || 'MoPSE',
                difficulty: this.mapGradeToDifficulty(grade),
                tags: [subject, grade, 'book', 'MoPSE'],
                isActive: true,
                metadata: {
                    isbn: book.isbn,
                    publisher: 'MoPSE',
                    year: book.publicationYear,
                    language: book.language,
                    format: book.format
                }
            }));
        }
        catch (error) {
            console.error('Error fetching MoPSE resources:', error);
            return [];
        }
    }
    async fetchCollegePressResources(subject, grade) {
        try {
            const response = await axios_1.default.get(`${COLLEGE_PRESS_API_URL}/textbooks`, {
                params: {
                    subject,
                    level: grade,
                    format: 'digital'
                }
            });
            return response.data.map((book) => ({
                title: book.title,
                description: book.description || 'No description available',
                type: 'book',
                url: book.purchaseUrl || book.previewUrl,
                thumbnailUrl: book.coverImage,
                subject,
                grade,
                source: 'CollegePress',
                author: book.author || 'College Press',
                difficulty: this.mapGradeToDifficulty(grade),
                tags: [subject, grade, 'book', 'CollegePress'],
                isActive: true,
                metadata: {
                    isbn: book.isbn,
                    publisher: 'College Press',
                    year: book.publicationYear,
                    language: book.language,
                    price: book.price,
                    currency: book.currency
                }
            }));
        }
        catch (error) {
            console.error('Error fetching College Press resources:', error);
            return [];
        }
    }
    async fetchTeachaResources(subject, grade) {
        try {
            const response = await axios_1.default.get(`${TEACH_API_URL}/resources`, {
                params: {
                    subject,
                    grade,
                    type: 'all'
                }
            });
            return response.data.map((resource) => ({
                title: resource.title,
                description: resource.description || 'No description available',
                type: this.mapTeachaType(resource.type),
                url: resource.downloadUrl || resource.previewUrl,
                thumbnailUrl: resource.thumbnail,
                subject,
                grade,
                source: 'Teacha',
                author: resource.author || 'Teacha!',
                difficulty: this.mapGradeToDifficulty(grade),
                tags: [subject, grade, resource.type, 'Teacha'],
                isActive: true,
                metadata: {
                    resourceType: resource.type,
                    fileSize: resource.fileSize,
                    downloadCount: resource.downloadCount,
                    rating: resource.rating
                }
            }));
        }
        catch (error) {
            console.error('Error fetching Teacha! resources:', error);
            return [];
        }
    }
    mapGradeToDifficulty(grade) {
        return grade === 'O' ? 'intermediate' : 'advanced';
    }
    mapTeachaType(type) {
        const typeMap = {
            'lesson-plan': 'document',
            'worksheet': 'practice',
            'test': 'quiz',
            'textbook': 'book',
            'video': 'video'
        };
        return typeMap[type] || 'document';
    }
    async fetchResources(options) {
        const { subject, grade, source, limit = 20, skip = 0 } = options;
        let resources = [];
        try {
            if (!source || source === 'MoPSE') {
                const moPSEResources = await this.fetchMoPSEResources(subject, grade);
                resources = resources.concat(moPSEResources);
            }
            if (!source || source === 'CollegePress') {
                const collegePressResources = await this.fetchCollegePressResources(subject, grade);
                resources = resources.concat(collegePressResources);
            }
            if (!source || source === 'Teacha') {
                const teachaResources = await this.fetchTeachaResources(subject, grade);
                resources = resources.concat(teachaResources);
            }
            const paginatedResources = resources.slice(skip, skip + limit);
            if (paginatedResources.length > 0) {
                try {
                    await Resource_1.default.insertMany(paginatedResources, { ordered: false });
                    console.log(`Successfully saved ${paginatedResources.length} resources to database`);
                }
                catch (error) {
                    console.error('Error saving resources to database:', error);
                }
            }
            return paginatedResources;
        }
        catch (error) {
            console.error('Error fetching resources:', error);
            throw error;
        }
    }
    async getRecommendations(_userId, subject, grade) {
        try {
            const resources = await Resource_1.default.find({
                subject,
                grade,
                isActive: true
            })
                .sort({ createdAt: -1 })
                .limit(10);
            return resources;
        }
        catch (error) {
            console.error('Error getting recommendations:', error);
            throw error;
        }
    }
}
exports.default = new EducationResourceService();
//# sourceMappingURL=educationResourceService.js.map