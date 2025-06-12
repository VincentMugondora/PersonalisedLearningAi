import express, { Request, Response } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import Resource from '../models/Resource';
import educationResourceService from '../services/educationResourceService';

const router = express.Router();

// Public route - Search resources
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, grade, type, source, limit = 20, skip = 0 } = req.query;
    
    const query: any = { isActive: true };
    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (type) query.type = type;
    if (source) query.source = source;

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.json(resources);
  } catch (error) {
    console.error('Error searching resources:', error);
    res.status(500).json({ message: 'Error searching resources' });
  }
});

// Authenticated route - Get personalized recommendations
router.get('/recommendations', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { subject, grade } = req.query;
    if (!subject || !grade) {
      res.status(400).json({ message: 'Subject and grade are required' });
      return;
    }

    const recommendations = await educationResourceService.getRecommendations(
      req.user.id,
      subject as string,
      grade as 'O' | 'A'
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Error getting recommendations' });
  }
});

// Admin route - Fetch resources from MoPSE
router.post('/fetch/mopse', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, grade } = req.body;
    if (!subject || !grade) {
      res.status(400).json({ message: 'Subject and grade are required' });
      return;
    }

    const resources = await educationResourceService.fetchResources({
      subject,
      grade,
      source: 'MoPSE'
    });

    res.json({
      message: `Successfully fetched ${resources.length} resources from MoPSE`,
      resources
    });
  } catch (error) {
    console.error('Error fetching MoPSE resources:', error);
    res.status(500).json({ message: 'Error fetching MoPSE resources' });
  }
});

// Admin route - Fetch resources from College Press
router.post('/fetch/collegepress', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, grade } = req.body;
    if (!subject || !grade) {
      res.status(400).json({ message: 'Subject and grade are required' });
      return;
    }

    const resources = await educationResourceService.fetchResources({
      subject,
      grade,
      source: 'CollegePress'
    });

    res.json({
      message: `Successfully fetched ${resources.length} resources from College Press`,
      resources
    });
  } catch (error) {
    console.error('Error fetching College Press resources:', error);
    res.status(500).json({ message: 'Error fetching College Press resources' });
  }
});

// Admin route - Fetch resources from Teacha!
router.post('/fetch/teacha', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, grade } = req.body;
    if (!subject || !grade) {
      res.status(400).json({ message: 'Subject and grade are required' });
      return;
    }

    const resources = await educationResourceService.fetchResources({
      subject,
      grade,
      source: 'Teacha'
    });

    res.json({
      message: `Successfully fetched ${resources.length} resources from Teacha!`,
      resources
    });
  } catch (error) {
    console.error('Error fetching Teacha! resources:', error);
    res.status(500).json({ message: 'Error fetching Teacha! resources' });
  }
});

// Admin route - Add custom resource
router.post('/', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = new Resource({
      ...req.body,
      source: 'Custom'
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Error adding resource' });
  }
});

// Admin route - Update resource
router.put('/:id', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, source: 'Custom' },
      { new: true }
    );
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Error updating resource' });
  }
});

// Admin route - Delete resource
router.delete('/:id', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
});

export default router; 