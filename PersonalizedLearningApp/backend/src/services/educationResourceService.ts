import axios from 'axios';
import Resource, { IResource } from '../models/Resource';

// API endpoints and configurations
const MOPSE_API_URL = process.env.MOPSE_API_URL || 'https://api.mopse-library.zw';
const TEACH_API_URL = process.env.TEACH_API_URL || 'https://api.teacha.co.zw';
const COLLEGE_PRESS_API_URL = process.env.COLLEGE_PRESS_API_URL || 'https://api.collegepress.co.zw';

// Resource source types
type ResourceSource = 'MoPSE' | 'CollegePress' | 'Teacha' | 'YouTube' | 'Custom';

interface ResourceFetchOptions {
  subject: string;
  grade: 'O' | 'A';
  type?: 'book' | 'video' | 'document' | 'quiz' | 'practice';
  source?: ResourceSource;
  limit?: number;
  skip?: number;
}

class EducationResourceService {
  // Fetch resources from MoPSE Digital Library
  private async fetchMoPSEResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    try {
      const response = await axios.get(`${MOPSE_API_URL}/books`, {
        params: {
          subject,
          grade: grade === 'O' ? 'Ordinary' : 'Advanced',
          format: 'digital'
        }
      });

      return response.data.map((book: any) => ({
        title: book.title,
        description: book.description || 'No description available',
        type: 'book' as const,
        url: book.downloadUrl || book.readUrl,
        thumbnailUrl: book.coverImage,
        subject,
        grade,
        source: 'MoPSE' as const,
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
    } catch (error) {
      console.error('Error fetching MoPSE resources:', error);
      return [];
    }
  }

  // Fetch resources from College Press
  private async fetchCollegePressResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    try {
      const response = await axios.get(`${COLLEGE_PRESS_API_URL}/textbooks`, {
        params: {
          subject,
          level: grade,
          format: 'digital'
        }
      });

      return response.data.map((book: any) => ({
        title: book.title,
        description: book.description || 'No description available',
        type: 'book' as const,
        url: book.purchaseUrl || book.previewUrl,
        thumbnailUrl: book.coverImage,
        subject,
        grade,
        source: 'CollegePress' as const,
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
    } catch (error) {
      console.error('Error fetching College Press resources:', error);
      return [];
    }
  }

  // Fetch resources from Teacha!
  private async fetchTeachaResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    try {
      const response = await axios.get(`${TEACH_API_URL}/resources`, {
        params: {
          subject,
          grade,
          type: 'all'
        }
      });

      return response.data.map((resource: any) => ({
        title: resource.title,
        description: resource.description || 'No description available',
        type: this.mapTeachaType(resource.type),
        url: resource.downloadUrl || resource.previewUrl,
        thumbnailUrl: resource.thumbnail,
        subject,
        grade,
        source: 'Teacha' as const,
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
    } catch (error) {
      console.error('Error fetching Teacha! resources:', error);
      return [];
    }
  }

  // Helper function to map grade to difficulty level
  private mapGradeToDifficulty(grade: 'O' | 'A'): 'beginner' | 'intermediate' | 'advanced' {
    return grade === 'O' ? 'intermediate' : 'advanced';
  }

  // Helper function to map Teacha! resource types to our types
  private mapTeachaType(type: string): 'book' | 'video' | 'document' | 'quiz' | 'practice' {
    const typeMap: Record<string, 'book' | 'video' | 'document' | 'quiz' | 'practice'> = {
      'lesson-plan': 'document',
      'worksheet': 'practice',
      'test': 'quiz',
      'textbook': 'book',
      'video': 'video'
    };
    return typeMap[type] || 'document';
  }

  // Main method to fetch resources from all sources
  async fetchResources(options: ResourceFetchOptions): Promise<IResource[]> {
    const { subject, grade, source, limit = 20, skip = 0 } = options;
    let resources: IResource[] = [];

    try {
      // Fetch from specified source or all sources
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

      // Apply pagination
      const paginatedResources = resources.slice(skip, skip + limit);

      // Save to database if we have resources
      if (paginatedResources.length > 0) {
        try {
          await Resource.insertMany(paginatedResources, { ordered: false });
          console.log(`Successfully saved ${paginatedResources.length} resources to database`);
        } catch (error) {
          console.error('Error saving resources to database:', error);
          // Continue execution even if save fails
        }
      }

      return paginatedResources;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  // Get resource recommendations based on user's learning history
  async getRecommendations(_userId: string, subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    try {
      // TODO: Implement recommendation logic based on user's learning history
      // For now, return recent resources for the subject
      const resources = await Resource.find({
        subject,
        grade,
        isActive: true
      })
        .sort({ createdAt: -1 })
        .limit(10);

      return resources;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
}

export default new EducationResourceService(); 