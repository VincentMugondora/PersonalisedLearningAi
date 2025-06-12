import axios from 'axios';
import Resource, { IResource } from '../models/Resource';
import { youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

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

// Helper function to safely extract YouTube video data
const extractYouTubeVideoData = (item: youtube_v3.Schema$SearchResult): Partial<IResource> | null => {
  const videoId = item.id?.videoId;
  if (!videoId) {
    console.warn('Skipping video with no videoId');
    return null;
  }

  const snippet = item.snippet;
  if (!snippet) {
    console.warn(`Skipping video ${videoId} with no snippet data`);
    return null;
  }

  // Get the best available thumbnail URL
  const thumbnailUrl = snippet.thumbnails?.high?.url || 
                      snippet.thumbnails?.medium?.url || 
                      snippet.thumbnails?.default?.url || 
                      undefined;

  return {
    title: snippet.title || 'Untitled Video',
    description: snippet.description || 'No description available',
    type: 'video' as const,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl, // Now properly typed as string | undefined
    source: 'YouTube',
    author: snippet.channelTitle || 'Unknown Author',
    difficulty: 'intermediate' as const,
    isActive: true,
    // Additional metadata
    metadata: {
      publishedAt: snippet.publishedAt || undefined,
      channelId: snippet.channelId || undefined,
      videoId
    }
  };
};

class ResourceService {
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

  // Fetch resources from YouTube
  async fetchYouTubeResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    try {
      const searchQuery = `${subject} ${grade} Level Zimbabwe curriculum`;
      const response = await youtube.search.list({
        part: ['snippet'],
        q: searchQuery,
        type: ['video'],
        maxResults: 10,
        relevanceLanguage: 'en',
        regionCode: 'ZW'
      });

      if (!response.data.items || response.data.items.length === 0) {
        console.log('No YouTube videos found for query:', searchQuery);
        return [];
      }

      const videos = response.data.items
        .map((item) => {
          const videoData = extractYouTubeVideoData(item);
          if (!videoData) return null;

          return {
            ...videoData,
            subject,
            grade,
            tags: [subject, grade, 'video', 'youtube'],
          } as IResource;
        })
        .filter((video): video is IResource => video !== null);

      // Save to database if we have valid videos
      if (videos.length > 0) {
        try {
          await Resource.insertMany(videos, { ordered: false });
          console.log(`Successfully saved ${videos.length} YouTube videos to database`);
        } catch (error) {
          console.error('Error saving videos to database:', error);
          // Continue execution even if save fails
        }
      }

      return videos;
    } catch (error) {
      console.error('Error fetching YouTube resources:', error);
      throw error;
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
  async getRecommendations(userId: string, limit: number = 5) {
    // TODO: Implement recommendation algorithm based on user's learning history
    // For now, return popular resources
    return Resource.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default new ResourceService(); 