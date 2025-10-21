// دالة للتنقل بين الصفحات
function navigateTo(page) {
    window.location.href = page;
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة البيانات إذا لم تكن موجودة
    if (!localStorage.getItem('adminContents')) {
        localStorage.setItem('adminContents', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('visitorsLog')) {
        localStorage.setItem('visitorsLog', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('visitorsData')) {
        localStorage.setItem('visitorsData', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('contentRatings')) {
        localStorage.setItem('contentRatings', JSON.stringify([]));
    }
    
    // تحميل الشعار إذا كان موجوداً
    const logoImg = document.getElementById('logo-img');
    if (logoImg) {
        logoImg.onerror = function() {
            this.style.display = 'none';
        };
    }
});
