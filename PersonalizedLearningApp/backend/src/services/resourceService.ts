import Resource, { IResource, IResourceMetadata } from '../models/Resource';
import { youtube_v3 } from 'googleapis';

// YouTube API setup
const youtube = new youtube_v3.Youtube({
  auth: process.env.YOUTUBE_API_KEY
});

// ZIMSEC API setup (mock for now)
const ZIMSEC_API_URL = process.env.ZIMSEC_API_URL || 'https://api.zimsec.co.zw';

interface ResourceSearchParams {
  subject?: string;
  grade?: 'O' | 'A';
  type?: 'video' | 'document' | 'quiz' | 'practice';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  limit?: number;
  skip?: number;
}

class ResourceService {
  // Helper method to map grade to difficulty
  private mapGradeToDifficulty(grade: 'O' | 'A'): 'beginner' | 'intermediate' | 'advanced' {
    return grade === 'O' ? 'beginner' : 'advanced';
  }

  // Search resources with filters
  async searchResources(params: ResourceSearchParams) {
    const query: any = { isActive: true };

    if (params.subject) query.subject = params.subject;
    if (params.grade) query.grade = params.grade;
    if (params.type) query.type = params.type;
    if (params.difficulty) query.difficulty = params.difficulty;
    if (params.tags && params.tags.length > 0) {
      query.tags = { $in: params.tags };
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(params.skip || 0)
      .limit(params.limit || 20);

    const total = await Resource.countDocuments(query);

    return {
      resources,
      total,
      hasMore: total > (params.skip || 0) + (params.limit || 20)
    };
  }

  // Helper method to safely extract YouTube video data
  private async fetchYouTubeResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
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
      const videoIds = videos.map(video => video.id?.videoId).filter(Boolean) as string[];

      if (videoIds.length === 0) {
        return [];
      }

      const videoDetailsResponse = await youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoIds
      });

      const resources = videoDetailsResponse.data.items?.map((video: youtube_v3.Schema$Video) => {
        const snippet = video.snippet!;
        const videoId = video.id!;

        // Create metadata object with only valid fields
        const metadata: IResourceMetadata = {
          publisher: snippet.channelTitle || undefined,
          year: snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : undefined,
          language: snippet.defaultLanguage || 'en',
          format: 'video',
          resourceType: 'video',
          // Optional fields
          rating: parseFloat(video.statistics?.likeCount || '0')
        };

        // Create resource document
        const resource = new Resource({
          title: snippet.title!,
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

      // Save resources to database
      if (resources.length > 0) {
        await Resource.insertMany(resources, { ordered: false });
      }

      return resources;
    } catch (error) {
      console.error('Error fetching YouTube resources:', error);
      return [];
    }
  }

  // Fetch resources from ZIMSEC (mock implementation)
  async fetchZimsecResources(subject: string, grade: 'O' | 'A') {
    try {
      // Mock ZIMSEC API call
      const mockResources = [
        {
          title: `${subject} ${grade} Level Past Paper 2023`,
          description: `Official ${subject} ${grade} Level past paper from ZIMSEC`,
          subject,
          grade,
          type: 'document' as const,
          url: `${ZIMSEC_API_URL}/papers/${subject.toLowerCase()}-${grade.toLowerCase()}-2023.pdf`,
          source: 'ZIMSEC',
          difficulty: 'advanced' as const,
          tags: [subject, grade, 'past-paper', 'zimsec'],
          isActive: true
        }
      ];

      // Save to database
      await Resource.insertMany(mockResources, { ordered: false });

      return mockResources;
    } catch (error) {
      console.error('Error fetching ZIMSEC resources:', error);
      throw error;
    }
  }

  // Add a custom resource
  async addCustomResource(resourceData: Partial<IResource>) {
    const resource = new Resource({
      ...resourceData,
      source: 'Custom',
      isActive: true
    });

    await resource.save();
    return resource;
  }

  // Update a resource
  async updateResource(id: string, updates: Partial<IResource>) {
    const resource = await Resource.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    return resource;
  }

  // Delete a resource (soft delete)
  async deleteResource(id: string) {
    const resource = await Resource.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return resource;
  }

  // Get resource recommendations based on user's learning history
  async getRecommendations(_userId: string, limit: number = 5) {
    // TODO: Implement recommendation algorithm based on user's learning history
    // For now, return popular resources
    return Resource.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async createResource(data: {
    title: string;
    description: string;
    url: string;
    type: string;
    subject: string;
    grade: string;
    metadata?: any;
  }) {
    try {
      const { title, description, url, type, subject, grade, metadata: rawMetadata } = data;
      
      // Process metadata - only include fields that exist in IResourceMetadata
      const metadata: IResourceMetadata = {
        publisher: rawMetadata?.channelTitle || undefined,
        year: rawMetadata?.publishedAt ? new Date(rawMetadata.publishedAt).getFullYear() : undefined,
        language: rawMetadata?.language || 'en',
        format: rawMetadata?.format || 'video',
        resourceType: type,
        // Optional fields
        price: rawMetadata?.price,
        currency: rawMetadata?.currency,
        fileSize: rawMetadata?.fileSize,
        downloadCount: rawMetadata?.downloadCount,
        rating: rawMetadata?.rating
      };

      // Create resource with main fields and metadata
      const resource = new Resource({
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
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  // Add a method to fetch and sync YouTube resources
  async syncYouTubeResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    return this.fetchYouTubeResources(subject, grade);
  }
}

export default new ResourceService(); 