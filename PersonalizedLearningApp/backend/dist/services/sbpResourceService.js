"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Resource_1 = __importDefault(require("../models/Resource"));
const cheerio = __importStar(require("cheerio"));
const SBP_BASE_URL = 'https://www.secondarybookpress.co.zw';
class SBPResourceService {
    mapSubjectToSBP(subject) {
        const subjectMap = {
            'Mathematics': 'maths',
            'Physics': 'physics',
            'Chemistry': 'chemistry',
            'Biology': 'biology',
            'English': 'english',
            'History': 'history',
            'Geography': 'geography',
            'Computer Science': 'computer-science',
            'Commerce': 'commerce',
            'Accounts': 'accounts',
            'Literature': 'english-literature',
            'Agriculture': 'agriculture',
            'Business Enterprise': 'business-enterprise',
            'Food Technology': 'food-technology',
            'Family Religious Studies': 'frs',
            'Shona': 'shona',
            'Ndebele': 'ndebele'
        };
        return subjectMap[subject] || subject.toLowerCase();
    }
    mapGradeToSBP(grade) {
        return grade === 'O'
            ? ['form-1', 'form-2', 'form-3', 'form-4']
            : ['form-5', 'form-6'];
    }
    async fetchResources(options) {
        const { subject, grade, type, limit = 20 } = options;
        let resources = [];
        try {
            const response = await axios_1.default.get(`${SBP_BASE_URL}/downloads`);
            const $ = cheerio.load(response.data);
            const sbpSubject = this.mapSubjectToSBP(subject);
            const sbpGrades = this.mapGradeToSBP(grade);
            $('.download-section').each((_, section) => {
                const sectionTitle = $(section).find('h3').text().toLowerCase();
                const isMatchingSection = sbpGrades.some(grade => sectionTitle.includes(grade) &&
                    sectionTitle.includes(sbpSubject));
                if (isMatchingSection) {
                    $(section).find('a[href*=".pdf"]').each((_, link) => {
                        const $link = $(link);
                        const title = $link.text().trim();
                        const url = $link.attr('href');
                        const fileSize = $link.next('.file-size').text().trim();
                        if (url && title) {
                            const resourceType = this.determineResourceType(title, type);
                            const resourceData = {
                                title,
                                description: `Secondary Book Press ${resourceType} for ${subject} ${grade} Level`,
                                type: resourceType,
                                url: url.startsWith('http') ? url : `${SBP_BASE_URL}${url}`,
                                subject,
                                grade,
                                source: 'SecondaryBookPress',
                                author: 'Secondary Book Press',
                                difficulty: this.mapGradeToDifficulty(grade),
                                tags: [subject, grade, resourceType, 'SecondaryBookPress'],
                                isActive: true,
                                metadata: {
                                    publisher: 'Secondary Book Press',
                                    year: new Date().getFullYear(),
                                    language: 'en',
                                    format: 'pdf',
                                    fileSize: this.parseFileSize(fileSize)
                                }
                            };
                            const resource = new Resource_1.default(resourceData);
                            resources.push(resource);
                        }
                    });
                }
            });
            const limitedResources = resources.slice(0, limit);
            if (limitedResources.length > 0) {
                try {
                    const savedResources = await Resource_1.default.insertMany(limitedResources, { ordered: false });
                    console.log(`Successfully saved ${savedResources.length} SBP resources to database`);
                    return savedResources;
                }
                catch (error) {
                    console.error('Error saving SBP resources to database:', error);
                    return limitedResources;
                }
            }
            return limitedResources;
        }
        catch (error) {
            console.error('Error fetching SBP resources:', error);
            throw error;
        }
    }
    determineResourceType(title, type) {
        if (type) {
            return type === 'textbook' ? 'book' : 'document';
        }
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('revision') || lowerTitle.includes('guide')) {
            return 'document';
        }
        return 'book';
    }
    mapGradeToDifficulty(grade) {
        return grade === 'O' ? 'intermediate' : 'advanced';
    }
    parseFileSize(sizeStr) {
        if (!sizeStr)
            return 0;
        const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i);
        if (!match)
            return 0;
        const [, size, unit] = match;
        const numSize = parseFloat(size);
        switch (unit.toUpperCase()) {
            case 'KB': return numSize * 1024;
            case 'MB': return numSize * 1024 * 1024;
            case 'GB': return numSize * 1024 * 1024 * 1024;
            default: return 0;
        }
    }
}
exports.default = new SBPResourceService();
//# sourceMappingURL=sbpResourceService.js.map