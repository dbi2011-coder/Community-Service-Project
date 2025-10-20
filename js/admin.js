// تنظيف كامل
localStorage.clear();

document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
    
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    // تأكد من إظهار نموذج الدخول
    if (adminLoginSection) adminLoginSection.classList.remove('hidden');
    if (adminPanel) adminPanel.classList.add('hidden');
    
    // بيانات الدخول
    const ADMIN_CREDENTIALS = {
        username: "admin",
        password: "admin123"
    };
    
    // حدث تسجيل الدخول
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('تم النقر على زر الدخول');
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            console.log('اسم المستخدم:', username);
            console.log('كلمة المرور:', password);
            
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                console.log('الدخول ناجح');
                localStorage.setItem('adminLoggedIn', 'true');
                adminLoginSection.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                alert('✅ تم الدخول بنجاح!');
            } else {
                console.log('الدخول فاشل');
                alert('❌ بيانات الدخول غير صحيحة');
            }
        });
    } else {
        console.error('لم يتم العثور على نموذج الدخول');
    }
    
    // باقي الكود للوحة التحكم...
    const contentType = document.getElementById('contentType');
    const linkInput = document.getElementById('linkInput');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    
    if (contentType) {
        contentType.addEventListener('change', function() {
            [linkInput, fileInput, textInput].forEach(el => {
                if (el) el.classList.add('hidden');
            });
            
            switch(this.value) {
                case 'link':
                    if (linkInput) linkInput.classList.remove('hidden');
                    break;
                case 'file':
                    if (fileInput) fileInput.classList.remove('hidden');
                    break;
                case 'text':
                    if (textInput) textInput.classList.remove('hidden');
                    break;
            }
        });
    }
});
