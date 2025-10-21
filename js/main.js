// دالة للتنقل بين الصفحات
function navigateTo(page) {
    window.location.href = page;
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة التطبيق...');
    
    // تهيئة البيانات إذا لم تكن موجودة
    if (!localStorage.getItem('adminContents')) {
        localStorage.setItem('adminContents', JSON.stringify([]));
        console.log('تم تهيئة adminContents');
    }
    
    if (!localStorage.getItem('studentsLog')) {
        localStorage.setItem('studentsLog', JSON.stringify([]));
        console.log('تم تهيئة studentsLog');
    }
    
    if (!localStorage.getItem('studentsData')) {
        localStorage.setItem('studentsData', JSON.stringify([]));
        console.log('تم تهيئة studentsData');
    }
    
    if (!localStorage.getItem('contentRatings')) {
        localStorage.setItem('contentRatings', JSON.stringify([]));
        console.log('تم تهيئة contentRatings');
    }
    
    // تحميل الشعار إذا كان موجوداً
    const logoImg = document.getElementById('logo-img');
    if (logoImg) {
        logoImg.onerror = function() {
            this.style.display = 'none';
            console.log('تم إخفاء الشعار لأنه غير موجود');
        };
        
        logoImg.onload = function() {
            console.log('تم تحميل الشعار بنجاح');
        };
    }
    
    console.log('تم تهيئة التطبيق بنجاح');
    
    // إضافة event listeners لأزرار التنقل إذا كانت موجودة
    const adminButton = document.querySelector('[onclick*="admin.html"]');
    const studentButton = document.querySelector('[onclick*="student.html"]');
    
    if (adminButton) {
        adminButton.addEventListener('click', function() {
            navigateTo('admin.html');
        });
    }
    
    if (studentButton) {
        studentButton.addEventListener('click', function() {
            navigateTo('student.html');
        });
    }
});

// دالة مساعدة للتحقق من حالة التطبيق
function checkAppStatus() {
    console.log('=== حالة التطبيق ===');
    console.log('adminContents:', JSON.parse(localStorage.getItem('adminContents') || '[]').length + ' عنصر');
    console.log('studentsLog:', JSON.parse(localStorage.getItem('studentsLog') || '[]').length + ' سجل');
    console.log('studentsData:', JSON.parse(localStorage.getItem('studentsData') || '[]').length + ' طالب');
    console.log('contentRatings:', JSON.parse(localStorage.getItem('contentRatings') || '[]').length + ' تقييم');
    console.log('==================');
}

// دالة لمسح جميع البيانات (لأغراض التطوير)
function clearAllData() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
        localStorage.removeItem('adminContents');
        localStorage.removeItem('studentsLog');
        localStorage.removeItem('studentsData');
        localStorage.removeItem('contentRatings');
        alert('تم مسح جميع البيانات');
        location.reload();
    }
}

// دالة لإضافة محتوى تجريبي
function addSampleData() {
    const sampleContent = [
        {
            id: '1',
            type: 'text',
            title: 'مرحباً بكم في المشروع',
            content: 'هذا محتوى تجريبي للاختبار. يمكنك تجربة النظام مع هذا المحتوى.',
            date: new Date().toLocaleString('ar-SA')
        },
        {
            id: '2', 
            type: 'link',
            title: 'رابط تعريفي',
            content: 'https://www.example.com',
            date: new Date().toLocaleString('ar-SA')
        }
    ];
    
    localStorage.setItem('adminContents', JSON.stringify(sampleContent));
    alert('تم إضافة محتوى تجريبي');
    checkAppStatus();
}

// جعل الدوال متاحة globally لل debugging
window.checkAppStatus = checkAppStatus;
window.clearAllData = clearAllData;
window.addSampleData = addSampleData;
