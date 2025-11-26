// رابط الخادم على Render
const API_BASE = 'https://vitube-backend.onrender.com/api';

// دوال للاتصال بالخادم الحقيقي
const api = {
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            return { 
                success: false, 
                message: 'خطأ في الاتصال بالخادم' 
            };
        }
    },

    async register(name, email, password) {
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            return await response.json();
        } catch (error) {
            return { 
                success: false, 
                message: 'خطأ في الاتصال بالخادم' 
            };
        }
    },

    async getVideos() {
        try {
            const response = await fetch(`${API_BASE}/videos`);
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    },

    async addVideo(videoData) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/videos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(videoData)
            });
            return await response.json();
        } catch (error) {
            return { 
                success: false, 
                message: 'خطأ في الاتصال بالخادم' 
            };
        }
    },

    async addComment(videoId, commentData) {
        try {
            const response = await fetch(`${API_BASE}/videos/${videoId}/comments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            });
            return await response.json();
        } catch (error) {
            return { 
                success: false, 
                message: 'خطأ في الاتصال بالخادم' 
            };
        }
    }
};

// تحديث دوال التطبيق لاستخدام الخادم الحقيقي
async function handleRealLogin(email, password) {
    const result = await api.login(email, password);
    
    if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        return { success: true, user: result.user };
    } else {
        return { success: false, message: result.message };
    }
}

async function handleRealRegister(name, email, password) {
    const result = await api.register(name, email, password);
    
    if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        return { success: true, user: result.user };
    } else {
        return { success: false, message: result.message };
    }
}

// استبدال الدوال القديمة في كودك
async function displayVideosFromServer() {
    const videos = await api.getVideos();
    // استخدم videos بدلاً من البيانات الثابتة
}
