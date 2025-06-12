import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Resource from '../models/Resource';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sampleResources = [
  {
    title: 'Mathematics O Level Textbook',
    description: 'Comprehensive textbook covering all O Level Mathematics topics including Algebra, Geometry, and Statistics',
    type: 'book',
    url: 'https://mopse.co.zw/books/mathematics-o-level',
    thumbnailUrl: 'https://example.com/math-book-cover.jpg',
    subject: 'Mathematics',
    grade: 'O',
    source: 'MoPSE',
    author: 'Ministry of Primary and Secondary Education',
    difficulty: 'intermediate',
    tags: ['Mathematics', 'O Level', 'Textbook', 'MoPSE'],
    isActive: true,
    metadata: {
      publisher: 'MoPSE',
      year: 2023,
      language: 'English',
      format: 'PDF'
    }
  },
  {
    title: 'Physics A Level Study Guide',
    description: 'Advanced Physics study guide covering Mechanics, Electricity, and Modern Physics',
    type: 'book',
    url: 'https://collegepress.co.zw/books/physics-a-level',
    thumbnailUrl: 'https://example.com/physics-guide-cover.jpg',
    subject: 'Physics',
    grade: 'A',
    source: 'CollegePress',
    author: 'College Press Publishers',
    difficulty: 'advanced',
    tags: ['Physics', 'A Level', 'Study Guide', 'CollegePress'],
    isActive: true,
    metadata: {
      publisher: 'College Press',
      year: 2023,
      language: 'English',
      format: 'PDF',
      price: 25,
      currency: 'USD'
    }
  },
  {
    title: 'Chemistry Practical Experiments',
    description: 'Collection of practical experiments for O Level Chemistry students',
    type: 'document',
    url: 'https://teacha.co.zw/resources/chemistry-practicals',
    thumbnailUrl: 'https://example.com/chemistry-practicals.jpg',
    subject: 'Chemistry',
    grade: 'O',
    source: 'Teacha',
    author: 'Teacha! Zimbabwe',
    difficulty: 'intermediate',
    tags: ['Chemistry', 'O Level', 'Practical', 'Teacha'],
    isActive: true,
    metadata: {
      resourceType: 'Practical Guide',
      fileSize: 2500000,
      downloadCount: 1500,
      rating: 4.5
    }
  },
  {
    title: 'Biology Past Exam Papers',
    description: 'Collection of past ZIMSEC Biology exam papers with solutions',
    type: 'practice',
    url: 'https://teacha.co.zw/resources/biology-past-papers',
    thumbnailUrl: 'https://example.com/biology-papers.jpg',
    subject: 'Biology',
    grade: 'O',
    source: 'Teacha',
    author: 'Teacha! Zimbabwe',
    difficulty: 'intermediate',
    tags: ['Biology', 'O Level', 'Past Papers', 'Teacha'],
    isActive: true,
    metadata: {
      resourceType: 'Past Papers',
      fileSize: 1800000,
      downloadCount: 2000,
      rating: 4.8
    }
  },
  {
    title: 'English Literature Analysis',
    description: 'In-depth analysis of set books and poems for A Level English',
    type: 'document',
    url: 'https://collegepress.co.zw/books/english-literature',
    thumbnailUrl: 'https://example.com/english-literature.jpg',
    subject: 'English',
    grade: 'A',
    source: 'CollegePress',
    author: 'College Press Publishers',
    difficulty: 'advanced',
    tags: ['English', 'A Level', 'Literature', 'CollegePress'],
    isActive: true,
    metadata: {
      publisher: 'College Press',
      year: 2023,
      language: 'English',
      format: 'PDF',
      price: 20,
      currency: 'USD'
    }
  },
  {
    title: 'History of Zimbabwe',
    description: 'Comprehensive study of Zimbabwean history from pre-colonial to modern times',
    type: 'book',
    url: 'https://mopse.co.zw/books/zimbabwe-history',
    thumbnailUrl: 'https://example.com/history-book.jpg',
    subject: 'History',
    grade: 'O',
    source: 'MoPSE',
    author: 'Ministry of Primary and Secondary Education',
    difficulty: 'intermediate',
    tags: ['History', 'O Level', 'Textbook', 'MoPSE'],
    isActive: true,
    metadata: {
      publisher: 'MoPSE',
      year: 2023,
      language: 'English',
      format: 'PDF'
    }
  }
];

async function seedResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Insert new resources
    const result = await Resource.insertMany(sampleResources);
    console.log(`Successfully seeded ${result.length} resources`);

    // Log the resources by subject
    const resourcesBySubject = await Resource.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          resources: { $push: { title: '$title', type: '$type', source: '$source' } }
        }
      }
    ]);

    console.log('\nResources by subject:');
    resourcesBySubject.forEach(subject => {
      console.log(`\n${subject._id} (${subject.count} resources):`);
      subject.resources.forEach((resource: any) => {
        console.log(`- ${resource.title} (${resource.type}, ${resource.source})`);
      });
    });

  } catch (error) {
    console.error('Error seeding resources:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedResources(); 