// API endpoints
let API_BASE_URL = '';
let NEWS_API = '';

// دالة جلب عنوان API من ملف JSON
async function getApiBaseUrl() {
  try {
    const response = await fetch('aupril.json');
    if (!response.ok) {
      throw new Error('فشل في تحميل ملف الإعدادات');
    }
    const config = await response.json();
    API_BASE_URL = config.API_BASE_URL;
    NEWS_API = `${API_BASE_URL}/mcs/news`;
  } catch (error) {
    console.error('خطأ في تحميل الإعدادات:', error);
  }
}

getApiBaseUrl();


// عناصر DOM
const newsContainer = document.getElementById('newsContainer');
const emptyState = document.getElementById('emptyState');

// دالة إنشاء بطاقة خبر
function createNewsCard(newsItem) {
    return `
        <div class="news-card" data-news-id="${newsItem.id}">
            <div class="news-text">${newsItem.text}</div>
            ${newsItem.image_path ? `<img src="${newsItem.image_path}" alt="صورة الخبر" class="news-image" onerror="this.style.display='none'">` : ''}
        </div>
    `;
}

// دالة جلب الأخبار من السيرفر
async function fetchNews() {
    try {
        const response = await fetch(NEWS_API);
        
        if (!response.ok) {
            throw new Error('فشل في جلب البيانات من السيرفر');
        }
        
        const newsData = await response.json();
        return newsData;
    } catch (error) {
        console.error('خطأ في جلب الأخبار:', error);
        showError('تعذر تحميل الأخبار. يرجى المحاولة لاحقاً.');
        return [];
    }
}

// دالة عرض الأخبار
function displayNews(newsData) {
    // تفريغ الحاوية أولاً
    newsContainer.innerHTML = '';
    
    if (newsData && newsData.length > 0) {
        // إخفاء حالة عدم وجود أخبار
        emptyState.style.display = 'none';
        newsContainer.style.display = 'flex';
        
        // إضافة كل خبر إلى الحاوية
        newsData.forEach(newsItem => {
            const newsCardHTML = createNewsCard(newsItem);
            newsContainer.innerHTML += newsCardHTML;
        });
    } else {
        // عرض حالة عدم وجود أخبار
        showEmptyState();
    }
}

// دالة عرض حالة عدم وجود أخبار
function showEmptyState() {
    newsContainer.style.display = 'none';
    emptyState.style.display = 'block';
}

// دالة عرض خطأ
function showError(message) {
    newsContainer.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>حدث خطأ</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="retry-btn">إعادة المحاولة</button>
        </div>
    `;
}

// إضافة CSS للخطأ وإعادة المحاولة
const errorStyles = `
    .error-state {
        text-align: center;
        padding: 40px 20px;
        background: rgba(255, 0, 0, 0.1);
        border-radius: 15px;
        border: 1px solid rgba(255, 0, 0, 0.3);
    }
    
    .error-icon {
        font-size: 3rem;
        margin-bottom: 15px;
    }
    
    .error-state h3 {
        color: #ff6b6b;
        margin-bottom: 10px;
    }
    
    .retry-btn {
        background: #ffd700;
        color: #1e3c72;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 15px;
        transition: background 0.3s ease;
    }
    
    .retry-btn:hover {
        background: #ffed4a;
    }
`;

// إضافة styles للخطأ إلى head المستند
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', async function() {
    // عرض حالة التحميل
    newsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; width: 100%;">
            <div style="font-size: 2rem; margin-bottom: 15px;">⏳</div>
            <p>جاري تحميل الأخبار...</p>
        </div>
    `;
    
    await getApiBaseUrl();
const newsData = await fetchNews();
displayNews(newsData);
});

// تحديث الأخبار تلقائياً كل دقيقة (اختياري)
setInterval(async () => {
    const newsData = await fetchNews();
    displayNews(newsData);
}, 60000);