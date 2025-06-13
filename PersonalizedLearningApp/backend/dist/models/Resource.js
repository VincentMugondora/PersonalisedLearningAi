"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ResourceSchema = new mongoose_1.Schema({
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
ResourceSchema.index({
    title: 'text',
    description: 'text',
    subject: 'text',
    tags: 'text'
});
ResourceSchema.index({ subject: 1, grade: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ source: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ isActive: 1 });
exports.default = mongoose_1.default.model('Resource', ResourceSchema);
//# sourceMappingURL=Resource.js.map