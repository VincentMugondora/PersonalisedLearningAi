import mongoose, { Schema, Document } from 'mongoose';

// Define the metadata interface for better type safety
export interface IResourceMetadata {
  publishedAt?: string;
  channelId?: string;
  videoId?: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface IResource extends Document {
  title: string;
  description: string;
  subject: string;
  grade: 'O' | 'A';  
  type: 'video' | 'document' | 'quiz' | 'practice';
  url: string;
  thumbnailUrl?: string;
  source: 'YouTube' | 'ZIMSEC' | 'Custom';
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
    enum: ['video', 'document', 'quiz', 'practice']
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
    enum: ['YouTube', 'ZIMSEC', 'Custom']
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
    type: Schema.Types.Mixed,
    default: {}
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
ResourceSchema.index({ type: 1, difficulty: 1 });
ResourceSchema.index({ source: 1, isActive: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema); 