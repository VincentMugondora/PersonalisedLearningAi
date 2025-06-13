"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Resource_1 = __importDefault(require("../models/Resource"));
const googleapis_1 = require("googleapis");
const youtube = new googleapis_1.youtube_v3.Youtube({
    auth: process.env.YOUTUBE_API_KEY
});
const ZIMSEC_API_URL = process.env.ZIMSEC_API_URL || 'https://api.zimsec.co.zw';
class ResourceService {
    mapGradeToDifficulty(grade) {
        return grade === 'O' ? 'beginner' : 'advanced';
    }
    async searchResources(params) {
        const query = { isActive: true };
        if (params.subject)
            query.subject = params.subject;
        if (params.grade)
            query.grade = params.grade;
        if (params.type)
            query.type = params.type;
        if (params.difficulty)
            query.difficulty = params.difficulty;
        if (params.tags && params.tags.length > 0) {
            query.tags = { $in: params.tags };
        }
        const resources = await Resource_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(params.skip || 0)
            .limit(params.limit || 20);
        const total = await Resource_1.default.countDocuments(query);
        return {
            resources,
            total,
            hasMore: total > (params.skip || 0) + (params.limit || 20)
        };
    }
    async fetchYouTubeResources(subject, grade) {
        try {
            const searchResponse = await youtube.search.list({
                part: ['snippet'],
                q: `${subject} ${grade} level education`,
                type: ['video'],
                maxResults: 20,
                relevanceLanguage: 'en',
                videoEmbeddable: 'true',
                videoDuration: 'medium'
            });
            const videos = searchResponse.data.items || [];
            const videoIds = videos.map(video => video.id?.videoId).filter(Boolean);
            if (videoIds.length === 0) {
                return [];
            }
            const videoDetailsResponse = await youtube.videos.list({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: videoIds
            });
            const resources = videoDetailsResponse.data.items?.map((video) => {
                const snippet = video.snippet;
                const videoId = video.id;
                const metadata = {
                    publisher: snippet.channelTitle || undefined,
                    year: snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : undefined,
                    language: snippet.defaultLanguage || 'en',
                    format: 'video',
                    resourceType: 'video',
                    rating: parseFloat(video.statistics?.likeCount || '0')
                };
                const resource = new Resource_1.default({
                    title: snippet.title,
                    description: snippet.description || 'No description available',
                    type: 'video',
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    thumbnailUrl: snippet.thumbnails?.high?.url,
                    subject,
                    grade,
                    source: 'YouTube',
                    author: snippet.channelTitle || 'Unknown Author',
                    difficulty: this.mapGradeToDifficulty(grade),
                    tags: [subject, grade, 'video', 'YouTube', ...(snippet.tags || [])],
                    isActive: true,
                    metadata
                });
                return resource;
            }) || [];
            if (resources.length > 0) {
                await Resource_1.default.insertMany(resources, { ordered: false });
            }
            return resources;
        }
        catch (error) {
            console.error('Error fetching YouTube resources:', error);
            return [];
        }
    }
    async fetchZimsecResources(subject, grade) {
        try {
            const mockResources = [
                {
                    title: `${subject} ${grade} Level Past Paper 2023`,
                    description: `Official ${subject} ${grade} Level past paper from ZIMSEC`,
                    subject,
                    grade,
                    type: 'document',
                    url: `${ZIMSEC_API_URL}/papers/${subject.toLowerCase()}-${grade.toLowerCase()}-2023.pdf`,
                    source: 'ZIMSEC',
                    difficulty: 'advanced',
                    tags: [subject, grade, 'past-paper', 'zimsec'],
                    isActive: true
                }
            ];
            await Resource_1.default.insertMany(mockResources, { ordered: false });
            return mockResources;
        }
        catch (error) {
            console.error('Error fetching ZIMSEC resources:', error);
            throw error;
        }
    }
    async addCustomResource(resourceData) {
        const resource = new Resource_1.default({
            ...resourceData,
            source: 'Custom',
            isActive: true
        });
        await resource.save();
        return resource;
    }
    async updateResource(id, updates) {
        const resource = await Resource_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true });
        return resource;
    }
    async deleteResource(id) {
        const resource = await Resource_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
        return resource;
    }
    async getRecommendations(_userId, limit = 5) {
        return Resource_1.default.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
    async createResource(data) {
        try {
            const { title, description, url, type, subject, grade, metadata: rawMetadata } = data;
            const metadata = {
                publisher: rawMetadata?.channelTitle || undefined,
                year: rawMetadata?.publishedAt ? new Date(rawMetadata.publishedAt).getFullYear() : undefined,
                language: rawMetadata?.language || 'en',
                format: rawMetadata?.format || 'video',
                resourceType: type,
                price: rawMetadata?.price,
                currency: rawMetadata?.currency,
                fileSize: rawMetadata?.fileSize,
                downloadCount: rawMetadata?.downloadCount,
                rating: rawMetadata?.rating
            };
            const resource = new Resource_1.default({
                title,
                description,
                url,
                type,
                subject,
                grade,
                source: rawMetadata?.source || 'YouTube',
                author: rawMetadata?.channelTitle || 'Unknown Author',
                difficulty: rawMetadata?.difficulty || 'intermediate',
                tags: rawMetadata?.tags || [subject, grade, type],
                isActive: true,
                metadata
            });
            await resource.save();
            return resource;
        }
        catch (error) {
            console.error('Error creating resource:', error);
            throw error;
        }
    }
    async syncYouTubeResources(subject, grade) {
        return this.fetchYouTubeResources(subject, grade);
    }
}
exports.default = new ResourceService();
//# sourceMappingURL=resourceService.js.map