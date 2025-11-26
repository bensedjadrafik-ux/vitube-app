const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // إذا كان لديك ملفات ثابتة

// Routes الأساسية
app.get('/', (req, res) => {
    res.json({ message: 'مرحباً! الخادم يعمل بنجاح' });
});

app.get('/api/videos', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, title: 'فيديو تجريبي', url: 'https://example.com/video1' }
        ]
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // منطق التحقق من المستخدم
    res.json({ 
        success: true, 
        message: 'تم التسجيل بنجاح',
        token: 'token_here',
        user: { name: 'مستخدم', email: email }
    });
});

// تأكد من أن الخادم يستمع على المنفذ الصحيح
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
});

// معالجة الأخطاء
process.on('unhandledRejection', (err) => {
    console.error('❌ خطأ غير معالج:', err);
});
