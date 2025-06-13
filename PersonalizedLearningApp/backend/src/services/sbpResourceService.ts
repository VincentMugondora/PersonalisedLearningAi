import axios from 'axios';
import Resource, { IResource } from '../models/Resource';
import * as cheerio from 'cheerio';

// Secondary Book Press base URL
const SBP_BASE_URL = 'https://www.secondarybookpress.co.zw';

interface SBPFetchOptions {
  subject: string;
  grade: 'O' | 'A';
  type?: 'textbook' | 'revision-guide';
  limit?: number;
}

// Define a type for resource creation data
interface IResourceCreate {
  title: string;
  description: string;
  type: 'book' | 'document';
  url: string;
  subject: string;
  grade: 'O' | 'A';
  source: 'SecondaryBookPress';
  author: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isActive: boolean;
  metadata?: {
    publisher?: string;
    year?: number;
    language?: string;
    format?: string;
    fileSize?: number;
  };
}

class SBPResourceService {
  // Map our subjects to SBP subjects
  private mapSubjectToSBP(subject: string): string {
    const subjectMap: Record<string, string> = {
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

  // Map our grades to SBP form levels
  private mapGradeToSBP(grade: 'O' | 'A'): string[] {
    return grade === 'O' 
      ? ['form-1', 'form-2', 'form-3', 'form-4'] // Ordinary Level
      : ['form-5', 'form-6']; // Advanced Level
  }

  // Fetch resources from Secondary Book Press
  async fetchResources(options: SBPFetchOptions): Promise<IResource[]> {
    const { subject, grade, type, limit = 20 } = options;
    let resources: IResource[] = [];

    try {
      // Fetch the downloads page
      const response = await axios.get(`${SBP_BASE_URL}/downloads`);
      const $ = cheerio.load(response.data);

      // Map subject and grade to SBP format
      const sbpSubject = this.mapSubjectToSBP(subject);
      const sbpGrades = this.mapGradeToSBP(grade);

      // Find all download sections
      $('.download-section').each((_: number, section: cheerio.Element) => {
        const sectionTitle = $(section).find('h3').text().toLowerCase();
        
        // Check if this section matches our subject and grade
        const isMatchingSection = sbpGrades.some(grade => 
          sectionTitle.includes(grade) && 
          sectionTitle.includes(sbpSubject)
        );

        if (isMatchingSection) {
          // Find all download links in this section
          $(section).find('a[href*=".pdf"]').each((_: number, link: cheerio.Element) => {
            const $link = $(link);
            const title = $link.text().trim();
            const url = $link.attr('href');
            const fileSize = $link.next('.file-size').text().trim();

            if (url && title) {
              // Determine resource type
              const resourceType = this.determineResourceType(title, type);
              
              // Create resource data
              const resourceData: IResourceCreate = {
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

              // Create a new Resource document
              const resource = new Resource(resourceData);
              resources.push(resource);
            }
          });
        }
      });

      // Apply limit
      const limitedResources = resources.slice(0, limit);

      // Save to database if we have resources
      if (limitedResources.length > 0) {
        try {
          const savedResources = await Resource.insertMany(limitedResources, { ordered: false });
          console.log(`Successfully saved ${savedResources.length} SBP resources to database`);
          return savedResources;
        } catch (error) {
          console.error('Error saving SBP resources to database:', error);
          // Return the unsaved resources if save fails
          return limitedResources;
        }
      }

      return limitedResources;
    } catch (error) {
      console.error('Error fetching SBP resources:', error);
      throw error;
    }
  }

  // Determine resource type from title and options
  private determineResourceType(title: string, type?: 'textbook' | 'revision-guide'): 'book' | 'document' {
    if (type) {
      return type === 'textbook' ? 'book' : 'document';
    }
    
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('revision') || lowerTitle.includes('guide')) {
      return 'document';
    }
    return 'book';
  }

  // Map grade to difficulty level
  private mapGradeToDifficulty(grade: 'O' | 'A'): 'beginner' | 'intermediate' | 'advanced' {
    return grade === 'O' ? 'intermediate' : 'advanced';
  }

  // Parse file size string to number of bytes
  private parseFileSize(sizeStr: string): number {
    if (!sizeStr) return 0;
    
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i);
    if (!match) return 0;

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

export default new SBPResourceService(); 