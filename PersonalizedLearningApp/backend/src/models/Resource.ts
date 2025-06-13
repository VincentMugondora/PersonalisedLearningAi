import mongoose, { Schema, Document } from 'mongoose';

// Define the metadata interface for better type safety
export interface IResourceMetadata {
  publisher?: string;
  year?: number;
  language?: string;
  format?: string;
  price?: number;
  currency?: string;
  resourceType?: string;
  fileSize?: number;
  downloadCount?: number;
  rating?: number;
}

export interface IResource extends Document {
  title: string;
  description: string;
  subject: string;
  grade: 'O' | 'A';  
  type: 'book' | 'video' | 'document' | 'practice' | 'quiz';
  url: string;
  thumbnailUrl?: string;
  source: 'MoPSE' | 'CollegePress' | 'Teacha' | 'YouTube' | 'ZIMSEC' | 'SecondaryBookPress';
  author: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isActive: boolean;
  metadata?: IResourceMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'English',
      'History',
      'Geography',
      'Commerce',
      'Accounts',
      'Literature',
      'Agriculture',
      'Computer Science'
    ]
  },
  grade: {
    type: String,
    required: true,
    enum: ['O', 'A']
  },
  type: {
    type: String,
    required: true,
    enum: ['book', 'video', 'document', 'practice', 'quiz']
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    enum: ['MoPSE', 'CollegePress', 'Teacha', 'YouTube', 'ZIMSEC', 'SecondaryBookPress']
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    publisher: String,
    year: Number,
    language: String,
    format: String,
    price: Number,
    currency: String,
    resourceType: String,
    fileSize: Number,
    downloadCount: Number,
    rating: Number
  }
}, {
  timestamps: true
});

// Add text index for search functionality
ResourceSchema.index({
  title: 'text',
  description: 'text',
  subject: 'text',
  tags: 'text'
});

// Add compound indexes for common queries
ResourceSchema.index({ subject: 1, grade: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ source: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ isActive: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema); 