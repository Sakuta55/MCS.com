// API endpoints
const API_BASE_URL = ''; // سيتم تغييرها لرابط السيرفر الفعلي
const DOWNLOAD_API = `${API_BASE_URL}/mcs/download`; // تغيير من NEWS_API إلى DOWNLOAD_API

// عناصر DOM
const downloadsContainer = document.getElementById('newsContainer'); // سأبقيه كما هو لأن الـ HTML لم يتغير
const emptyState = document.getElementById('emptyState');

// دالة إنشاء بطاقة إصدار تحميل
function createDownloadCard(downloadItem) {
    return `
        <div class="news-card" data-download-id="${downloadItem.id}">
            <div class="news-text">${downloadItem.text}</div>
            ${downloadItem.image_path ? `<img src="${downloadItem.image_path}" alt="صورة الإصدار" class="news-image" onerror="this.style.display='none'">` : ''}
            ${downloadItem.download_url ? `
                <div class="download-button-container">
                    <a href="${downloadItem.download_url}" target="_blank" class="download-btn">
                        ⬇️ تحميل
                    </a>
                </div>
            ` : ''}
        </div>
    `;
}

// دالة جلب عنوان API من ملف JSON
async function getApiBaseUrl() {
    try {
        const response = await fetch('./aupril.json');
        
        if (!response.ok) {
            throw new Error('فشل في تحميل ملف الإعدادات');
        }
        
        const config = await response.json();
        return config.API_BASE_URL || 'http://192.168.223.28:5000'; // قيمة افتراضية إذا لم توجد
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
        //return 'http://192.168.223.28:5000'; // قيمة افتراضية في حالة الخطأ
    }
}

// دالة جلب إصدارات التحميل من السيرفر
async function fetchDownloads() {
  try {
    // جلب عنوان API أولاً
    const API_BASE_URL = await getApiBaseUrl();
    const DOWNLOAD_API = `${API_BASE_URL}/mcs/download`;
    const response = await fetch(DOWNLOAD_API);
    if (!response.ok) {
      throw new Error('فشل في جلب البيانات من السيرفر');
    }
    const downloadsData = await response.json();
    return downloadsData;
  } catch (error) {
    console.error('خطأ في جلب إصدارات التحميل:', error);
    showError('تعذر تحميل الإصدارات. يرجى المحاولة لاحقاً.');
    return [];
  }
}

// دالة عرض إصدارات التحميل
function displayDownloads(downloadsData) {
    // تفريغ الحاوية أولاً
    downloadsContainer.innerHTML = '';
    
    if (downloadsData && downloadsData.length > 0) {
        // إخفاء حالة عدم وجود إصدارات
        emptyState.style.display = 'none';
        downloadsContainer.style.display = 'flex';
        
        // إضافة كل إصدار إلى الحاوية
        downloadsData.forEach(downloadItem => {
            const downloadCardHTML = createDownloadCard(downloadItem);
            downloadsContainer.innerHTML += downloadCardHTML;
        });
    } else {
        // عرض حالة عدم وجود إصدارات
        showEmptyState();
    }
}

// دالة عرض حالة عدم وجود إصدارات
function showEmptyState() {
    downloadsContainer.style.display = 'none';
    emptyState.style.display = 'block';
}

// دالة عرض خطأ
function showError(message) {
    downloadsContainer.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>حدث خطأ</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="retry-btn">إعادة المحاولة</button>
        </div>
    `;
}

// إضافة CSS للخطأ وإعادة المحاولة وزر التحميل
const additionalStyles = `
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

    /* تنسيقات زر التحميل */
    .download-button-container {
        text-align: center;
        margin-top: 20px;
    }

    .download-btn {
        display: inline-block;
        background: #ffd700;
        color: #1e3c72;
        padding: 12px 30px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: bold;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .download-btn:hover {
        background: #ffed4a;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .download-btn:active {
        transform: translateY(0);
    }
`;

// إضافة styles الإضافية إلى head المستند
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', async function() {
    // عرض حالة التحميل
    downloadsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; width: 100%;">
            <div style="font-size: 2rem; margin-bottom: 15px;">⏳</div>
            <p>جاري تحميل الإصدارات...</p>
        </div>
    `;
    
    const downloadsData = await fetchDownloads();
    displayDownloads(downloadsData);
});

// تحديث الإصدارات تلقائياً كل دقيقة (اختياري)
setInterval(async () => {
    const downloadsData = await fetchDownloads();
    displayDownloads(downloadsData);
}, 60000);







