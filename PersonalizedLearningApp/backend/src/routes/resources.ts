import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import resourceService from '../services/resourceService';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

// Get resources with filters (public)
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    subject,
    grade,
    type,
    difficulty,
    tags,
    limit,
    skip
  } = req.query;

  const result = await resourceService.searchResources({
    subject: subject as string,
    grade: grade as 'O' | 'A',
    type: type as 'video' | 'document' | 'quiz' | 'practice',
    difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
    tags: tags ? (tags as string).split(',') : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    skip: skip ? parseInt(skip as string) : undefined
  });

  res.json(result);
}));

// Get resource recommendations for a user
router.get('/recommendations', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }
  const recommendations = await resourceService.getRecommendations(req.user.id);
  res.json(recommendations);
}));

// Fetch resources from YouTube (admin only)
router.post('/fetch/youtube', authenticateToken, isAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { subject, grade } = req.body;
  
  if (!subject || !grade) {
    res.status(400).json({ message: 'Subject and grade are required' });
    return;
  }

  const resources = await resourceService.fetchYouTubeResources(subject, grade);
  res.json(resources);
}));

// Fetch resources from ZIMSEC (admin only)
router.post('/fetch/zimsec', authenticateToken, isAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { subject, grade } = req.body;
  
  if (!subject || !grade) {
    res.status(400).json({ message: 'Subject and grade are required' });
    return;
  }

  const resources = await resourceService.fetchZimsecResources(subject, grade);
  res.json(resources);
}));

// Add a custom resource (admin only)
router.post('/', authenticateToken, isAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const resource = await resourceService.addCustomResource(req.body);
  res.status(201).json(resource);
}));

// Update a resource (admin only)
router.put('/:id', authenticateToken, isAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const resource = await resourceService.updateResource(req.params.id, req.body);
  if (!resource) {
    res.status(404).json({ message: 'Resource not found' });
    return;
  }
  res.json(resource);
}));

// Delete a resource (admin only)
router.delete('/:id', authenticateToken, isAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const resource = await resourceService.deleteResource(req.params.id);
  if (!resource) {
    res.status(404).json({ message: 'Resource not found' });
    return;
  }
  res.json({ message: 'Resource deleted successfully' });
}));

export default router; 