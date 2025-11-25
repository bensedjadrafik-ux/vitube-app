const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vitube';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// النماذج
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' }
}, { timestamps: true });

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    channel: { type: String, required: true },
    comments: [{
        user: String,
        text: String,
        likes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Video = mongoose.model('Video', videoSchema);

// Routes
// تسجيل مستخدم جديد
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // التحقق من وجود المستخدم
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'البريد الإلكتروني مستخدم بالفعل' 
            });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // إنشاء مستخدم جديد
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword 
        });
        
        await user.save();

        // إنشاء توكن
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح 🎉',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في الخادم' 
        });
    }
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
            });
        }

        // التحقق من كلمة المرور
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
            });
        }

        // إنشاء توكن
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح 👋',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في الخادم' 
        });
    }
});

// جلب جميع الفيديوهات
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في جلب الفيديوهات' 
        });
    }
});

// إضافة فيديو جديد
app.post('/api/videos', async (req, res) => {
    try {
        const { title, description, videoUrl, thumbnailUrl, channel } = req.body;
        
        const video = new Video({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            channel,
            views: 0,
            likes: 0,
            dislikes: 0,
            comments: []
        });

        await video.save();

        res.json({
            success: true,
            message: 'تم رفع الفيديو بنج� ✨',
            data: video
        });

    } catch (error) {
        console.error('Add video error:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في رفع الفيديو' 
        });
    }
});

// إضافة تعليق
app.post('/api/videos/:id/comments', async (req, res) => {
    try {
        const { user, text } = req.body;
        const videoId = req.params.id;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ 
                success: false,
                message: 'الفيديو غير موجود' 
            });
        }

        video.comments.push({
            user,
            text,
            likes: 0,
            createdAt: new Date()
        });

        await video.save();

        res.json({
            success: true,
            message: 'تم إضافة التعليق',
            data: video.comments
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في إضافة التعليق' 
        });
    }
});

// زيادة المشاهدات
app.put('/api/videos/:id/views', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ 
                success: false,
                message: 'الفيديو غير موجود' 
            });
        }

        video.views += 1;
        await video.save();

        res.json({
            success: true,
            data: { views: video.views }
        });

    } catch (error) {
        console.error('Update views error:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في تحديث المشاهدات' 
        });
    }
});

// Route للتحقق من حالة الخادم
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        message: 'ViTube Server is running 🚀',
        timestamp: new Date().toISOString()
    });
});

// خدمة الملفات الثابتة (للواجهة الأمامية إذا كانت في نفس المشروع)
app.use(express.static(path.join(__dirname, '../client')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 ViTube Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});