"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const user_1 = __importDefault(require("./routes/user"));
const resources_1 = __importDefault(require("./routes/resources"));
const env_1 = require("./config/env");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
try {
    (0, env_1.validateEnv)();
}
catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
const connectWithRetry = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};
connectWithRetry();
app.use('/api/auth', user_1.default);
app.use('/api/resources', resources_1.default);
app.get('/', (_req, res) => {
    res.send('API is running...');
});
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map