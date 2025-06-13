import axios from 'axios';
import Resource, { IResource } from '../models/Resource';

// API endpoints
const OER_COMMONS_API = 'https://api.oercommons.org/v1';
const CK12_API = 'https://api.ck12.org/v1';
// const KOLIBRI_API = 'https://api.learningequality.org/v1';

interface OERFetchOptions {
  subject: string;
  grade: 'O' | 'A';
  source?: 'OERCommons' | 'CK12' | 'Kolibri';
  limit?: number;
}

class OERResourceService {
  // Map our subjects to OER Commons subjects
  private mapSubjectToOER(subject: string): string {
    const subjectMap: Record<string, string> = {
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

  // Map our grades to OER Commons grade levels
  private mapGradeToOER(grade: 'O' | 'A'): string[] {
    return grade === 'O' 
      ? ['9-10', '11-12'] // Ordinary Level
      : ['11-12', '13-14']; // Advanced Level
  }

  // Fetch resources from OER Commons
  private async fetchOERCommonsResources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    try {
      const mappedSubject = this.mapSubjectToOER(subject);
      const gradeLevels = this.mapGradeToOER(grade);
      
      const response = await axios.get(`${OER_COMMONS_API}/search`, {
        params: {
          subject: mappedSubject,
          grade_level: gradeLevels.join(','),
          format: 'json',
          per_page: 20
        }
      });

      return response.data.items.map((item: any) => ({
        title: item.title,
        description: item.description || 'No description available',
        type: this.determineResourceType(item.material_type),
        url: item.url,
        thumbnailUrl: item.thumbnail_url,
        subject,
        grade,
        source: 'OERCommons' as const,
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
    } catch (error) {
      console.error('Error fetching OER Commons resources:', error);
      return [];
    }
  }

  // Fetch resources from CK-12
  private async fetchCK12Resources(subject: string, grade: 'O' | 'A'): Promise<IResource[]> {
    try {
      const mappedSubject = this.mapSubjectToCK12(subject);
      const gradeLevel = this.mapGradeToCK12(grade);

      const response = await axios.get(`${CK12_API}/concepts`, {
        params: {
          subject: mappedSubject,
          grade: gradeLevel,
          limit: 20
        }
      });

      return response.data.concepts.map((concept: any) => ({
        title: concept.title,
        description: concept.description || 'No description available',
        type: 'document' as const,
        url: concept.url,
        thumbnailUrl: concept.thumbnail_url,
        subject,
        grade,
        source: 'CK12' as const,
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
    } catch (error) {
      console.error('Error fetching CK-12 resources:', error);
      return [];
    }
  }

  // Map our subjects to CK-12 subjects
  private mapSubjectToCK12(subject: string): string {
    const subjectMap: Record<string, string> = {
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

  // Map our grades to CK-12 grade levels
  private mapGradeToCK12(grade: 'O' | 'A'): string {
    return grade === 'O' ? '9-12' : '11-12';
  }

  // Determine resource type from OER Commons material type
  private determineResourceType(materialType: string): 'book' | 'video' | 'document' | 'practice' | 'quiz' {
    const typeMap: Record<string, 'book' | 'video' | 'document' | 'practice' | 'quiz'> = {
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

  // Map grade to difficulty level
  private mapGradeToDifficulty(grade: 'O' | 'A'): 'beginner' | 'intermediate' | 'advanced' {
    return grade === 'O' ? 'intermediate' : 'advanced';
  }

  // Main method to fetch resources from all sources
  async fetchResources(options: OERFetchOptions): Promise<IResource[]> {
    const { subject, grade, source, limit = 20 } = options;
    let resources: IResource[] = [];

    try {
      // Fetch from specified source or all sources
      if (!source || source === 'OERCommons') {
        const oerResources = await this.fetchOERCommonsResources(subject, grade);
        resources = resources.concat(oerResources);
      }

      if (!source || source === 'CK12') {
        const ck12Resources = await this.fetchCK12Resources(subject, grade);
        resources = resources.concat(ck12Resources);
      }

      // Apply limit
      const limitedResources = resources.slice(0, limit);

      // Save to database if we have resources
      if (limitedResources.length > 0) {
        try {
          await Resource.insertMany(limitedResources, { ordered: false });
          console.log(`Successfully saved ${limitedResources.length} OER resources to database`);
        } catch (error) {
          console.error('Error saving OER resources to database:', error);
          // Continue execution even if save fails
        }
      }

      return limitedResources;
    } catch (error) {
      console.error('Error fetching OER resources:', error);
      throw error;
    }
  }
}

export default new OERResourceService(); 