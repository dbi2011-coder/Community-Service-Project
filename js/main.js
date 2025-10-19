// دالة للتنقل بين الصفحات
function navigateTo(page) {
    window.location.href = page;
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة البيانات إذا لم تكن موجودة
    if (!localStorage.getItem('adminContent')) {
        localStorage.setItem('adminContent', JSON.stringify({
            type: '',
            title: '',
            content: '',
            date: ''
        }));
    }
    
    if (!localStorage.getItem('studentsLog')) {
        localStorage.setItem('studentsLog', JSON.stringify([]));
    }
    
    // تحميل الشعار إذا كان موجوداً
    const logoImg = document.getElementById('logo-img');
    if (logoImg) {
        logoImg.onerror = function() {
            this.style.display = 'none';
        };
    }
});