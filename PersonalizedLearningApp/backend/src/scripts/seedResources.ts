import mongoose from 'mongoose';
import Resource, { IResource } from '../models/Resource';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personalized-learning';

const initialResources: Partial<IResource>[] = [
  {
    title: 'Introduction to Mathematics O-Level',
    description: 'A comprehensive guide to O-Level Mathematics covering basic concepts and problem-solving techniques.',
    subject: 'Mathematics',
    grade: 'O',
    type: 'book',
    url: 'https://example.com/math-o-level',
    source: 'MoPSE',
    author: 'Ministry of Education',
    difficulty: 'beginner',
    tags: ['Mathematics', 'O', 'book', 'MoPSE'],
    isActive: true,
    metadata: {
      publisher: 'MoPSE',
      year: 2023,
      language: 'English',
      format: 'PDF'
    }
  },
  {
    title: 'Advanced Mathematics A-Level',
    description: 'Advanced Mathematics concepts for A-Level students, including calculus and complex numbers.',
    subject: 'Mathematics',
    grade: 'A',
    type: 'book',
    url: 'https://example.com/math-a-level',
    source: 'CollegePress',
    author: 'College Press',
    difficulty: 'advanced',
    tags: ['Mathematics', 'A', 'book', 'CollegePress'],
    isActive: true,
    metadata: {
      publisher: 'College Press',
      year: 2023,
      language: 'English',
      format: 'PDF'
    }
  },
  {
    title: 'O-Level English Literature Guide',
    description: 'Complete guide to O-Level English Literature, including poetry, prose, and drama analysis.',
    subject: 'English',
    grade: 'O',
    type: 'book',
    url: 'https://example.com/english-o-level',
    source: 'Teacha',
    author: 'Teacha!',
    difficulty: 'intermediate',
    tags: ['English', 'O', 'book', 'Teacha'],
    isActive: true,
    metadata: {
      publisher: 'Teacha!',
      year: 2023,
      language: 'English',
      format: 'PDF'
    }
  },
  {
    title: 'Physics O-Level Video Tutorials',
    description: 'Video tutorials covering all O-Level Physics topics with practical demonstrations.',
    subject: 'Physics',
    grade: 'O',
    type: 'video',
    url: 'https://youtube.com/playlist?list=physics-o-level',
    source: 'YouTube',
    author: 'Physics Tutor ZW',
    difficulty: 'intermediate',
    tags: ['Physics', 'O', 'video', 'YouTube'],
    isActive: true,
    metadata: {
      resourceType: 'video',
      language: 'English'
    }
  },
  {
    title: 'Chemistry A-Level Practice Questions',
    description: 'Comprehensive set of practice questions for A-Level Chemistry with detailed solutions.',
    subject: 'Chemistry',
    grade: 'A',
    type: 'practice',
    url: 'https://example.com/chemistry-a-level-practice',
    source: 'Teacha',
    author: 'Chemistry Expert',
    difficulty: 'advanced',
    tags: ['Chemistry', 'A', 'practice', 'Teacha'],
    isActive: true,
    metadata: {
      resourceType: 'practice',
      language: 'English',
      format: 'PDF'
    }
  }
];

async function seedResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Insert new resources
    const resources = await Resource.insertMany(initialResources);
    console.log(`Successfully seeded ${resources.length} resources`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding resources:', error);
    process.exit(1);
  }
}

// Run the seed function
seedResources(); 