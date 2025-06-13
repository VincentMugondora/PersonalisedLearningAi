"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Resource_1 = __importDefault(require("../models/Resource"));
const educationResourceService_1 = __importDefault(require("../services/educationResourceService"));
const sbpResourceService_1 = __importDefault(require("../services/sbpResourceService"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { subject, grade, type, source, limit = 20, skip = 0 } = req.query;
        const query = { isActive: true };
        if (subject)
            query.subject = subject;
        if (grade)
            query.grade = grade;
        if (type)
            query.type = type;
        if (source)
            query.source = source;
        const resources = await Resource_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit));
        res.json(resources);
    }
    catch (error) {
        console.error('Error searching resources:', error);
        res.status(500).json({ message: 'Error searching resources' });
    }
});
router.get('/recommendations', auth_1.authenticateToken, async (req, res) => {
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
        const recommendations = await educationResourceService_1.default.getRecommendations(req.user.id, subject, grade);
        res.json(recommendations);
    }
    catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ message: 'Error getting recommendations' });
    }
});
router.post('/fetch/mopse', auth_1.authenticateToken, auth_1.isAdmin, async (req, res) => {
    try {
        const { subject, grade } = req.body;
        if (!subject || !grade) {
            res.status(400).json({ message: 'Subject and grade are required' });
            return;
        }
        const resources = await educationResourceService_1.default.fetchResources({
            subject,
            grade,
            source: 'MoPSE'
        });
        res.json({
            message: `Successfully fetched ${resources.length} resources from MoPSE`,
            resources
        });
    }
    catch (error) {
        console.error('Error fetching MoPSE resources:', error);
        res.status(500).json({ message: 'Error fetching MoPSE resources' });
    }
});
router.post('/fetch/collegepress', auth_1.authenticateToken, auth_1.isAdmin, async (req, res) => {
    try {
        const { subject, grade } = req.body;
        if (!subject || !grade) {
            res.status(400).json({ message: 'Subject and grade are required' });
            return;
        }
        const resources = await educationResourceService_1.default.fetchResources({
            subject,
            grade,
            source: 'CollegePress'
        });
        res.json({
            message: `Successfully fetched ${resources.length} resources from College Press`,
            resources
        });
    }
    catch (error) {
        console.error('Error fetching College Press resources:', error);
        res.status(500).json({ message: 'Error fetching College Press resources' });
    }
});
router.post('/fetch/teacha', auth_1.authenticateToken, auth_1.isAdmin, async (req, res) => {
    try {
        const { subject, grade } = req.body;
        if (!subject || !grade) {
            res.status(400).json({ message: 'Subject and grade are required' });
            return;
        }
        const resources = await educationResourceService_1.default.fetchResources({
            subject,
            grade,
            source: 'Teacha'
        });
        res.json({
            message: `Successfully fetched ${resources.length} resources from Teacha!`,
            resources
        });
    }
    catch (error) {
        console.error('Error fetching Teacha! resources:', error);
        res.status(500).json({ message: 'Error fetching Teacha! resources' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.isAdmin, async (req, res) => {
    try {
        const resource = new Resource_1.default({
            ...req.body,
            source: 'Custom'
        });
        await resource.save();
        res.status(201).json(resource);
    }
    catch (error) {
        console.error('Error adding resource:', error);
        res.status(500).json({ message: 'Error adding resource' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.isAdmin, async (req, res) => {
    try {
        const resource = await Resource_1.default.findByIdAndUpdate(req.params.id, { ...req.body, source: 'Custom' }, { new: true });
        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        res.json(resource);
    }
    catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ message: 'Error updating resource' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.isAdmin, async (req, res) => {
    try {
        const resource = await Resource_1.default.findByIdAndDelete(req.params.id);
        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        res.json({ message: 'Resource deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Error deleting resource' });
    }
});
router.post('/fetch', auth_1.authenticateToken, async (req, res) => {
    try {
        const { subject, grade, source } = req.body;
        if (!subject || !grade) {
            res.status(400).json({ message: 'Subject and grade are required' });
            return;
        }
        if (!['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History',
            'Geography', 'Commerce', 'Accounts', 'Literature', 'Agriculture', 'Computer Science'].includes(subject)) {
            res.status(400).json({ message: 'Invalid subject' });
            return;
        }
        if (!['O', 'A'].includes(grade)) {
            res.status(400).json({ message: 'Invalid grade' });
            return;
        }
        const resources = await educationResourceService_1.default.fetchResources({
            subject,
            grade,
            source: source,
            limit: 50
        });
        res.json({
            message: `Successfully fetched ${resources.length} resources`,
            resources
        });
    }
    catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Error fetching resources' });
    }
});
router.post('/fetch/sbp', auth_1.authenticateToken, async (req, res) => {
    try {
        const { subject, grade, type } = req.body;
        if (!subject || !grade) {
            res.status(400).json({ message: 'Subject and grade are required' });
            return;
        }
        if (!['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History',
            'Geography', 'Commerce', 'Accounts', 'Literature', 'Agriculture', 'Computer Science',
            'Business Enterprise', 'Food Technology', 'Family Religious Studies', 'Shona', 'Ndebele'].includes(subject)) {
            res.status(400).json({ message: 'Invalid subject' });
            return;
        }
        if (!['O', 'A'].includes(grade)) {
            res.status(400).json({ message: 'Invalid grade' });
            return;
        }
        const resources = await sbpResourceService_1.default.fetchResources({
            subject,
            grade,
            type: type
        });
        res.json({
            message: `Successfully fetched ${resources.length} resources from Secondary Book Press`,
            resources
        });
    }
    catch (error) {
        console.error('Error fetching SBP resources:', error);
        res.status(500).json({ message: 'Error fetching resources from Secondary Book Press' });
    }
});
exports.default = router;
//# sourceMappingURL=resources.js.map