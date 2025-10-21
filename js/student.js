// دالة للتحقق من صحة رقم الهوية
function isValidId(id) {
    return /^\d{10}$/.test(id);
}

// دالة للتحقق من صحة رقم الجوال
function isValidPhone(phone) {
    return /^05\d{8}$/.test(phone);
}

// دالة للحصول على المحتويات
function getContents() {
    return JSON.parse(localStorage.getItem('adminContents')) || [];
}

// دالة للحصول على سجلات الطلاب
function getStudentLogs() {
    return JSON.parse(localStorage.getItem('studentsLog')) || [];
}

// دالة للحصول على بيانات الطلاب
function getStudentsData() {
    return JSON.parse(localStorage.getItem('studentsData')) || [];
}

// دالة للبحث عن طالب برقم الهوية
function getStudentById(studentId) {
    const studentsData = getStudentsData();
    return studentsData.find(s => s.id === studentId);
}

// دالة لحفظ بيانات الطالب
function saveStudentData(student) {
    const studentsData = getStudentsData();
    const existingStudent = studentsData.find(s => s.id === student.id);
    
    if (!existingStudent) {
        studentsData.push({
            name: student.name,
            id: student.id,
            phone: student.phone,
            firstLogin: new Date().toLocaleString('ar-SA'),
            lastLogin: new Date().toLocaleString('ar-SA')
        });
        localStorage.setItem('studentsData', JSON.stringify(studentsData));
        return 'new';
    } else {
        // تحديث وقت آخر دخول
        existingStudent.lastLogin = new Date().toLocaleString('ar-SA');
        localStorage.setItem('studentsData', JSON.stringify(studentsData));
        return 'existing';
    }
}

// دالة لتسجيل الاطلاع على المحتوى
function studentViewContent(contentId, contentTitle) {
    if (!window.currentStudent || !window.currentStudent.id) {
        alert('يرجى تسجيل الدخول أولاً');
        return;
    }
    
    const studentsLog = getStudentLogs();
    const now = new Date();
    
    // التحقق إذا كان قد سجل الاطلاع مسبقاً
    const alreadyViewed = studentsLog.some(log => 
        log.studentId === window.currentStudent.id && log.contentId === contentId
    );
    
    if (alreadyViewed) {
        alert('لقد سجلت الاطلاع على هذا المحتوى مسبقاً');
        return;
    }
    
    studentsLog.push({
        studentName: window.currentStudent.name,
        studentId: window.currentStudent.id,
        studentPhone: window.currentStudent.phone,
        contentId: contentId,
        contentTitle: contentTitle,
        date: now.toLocaleDateString('ar-SA'),
        time: now.toLocaleTimeString('ar-SA'),
        timestamp: now.getTime()
    });
    
    localStorage.setItem('studentsLog', JSON.stringify(studentsLog));
    
    // إعادة تحميل المحتويات لتحديث الواجهة
    if (window.loadStudentContents) {
        window.loadStudentContents();
    }
    
    alert('تم تسجيل الاطلاع بنجاح!');
}

// دالة لعرض تاريخ الاطلاع
function getViewDate(logs, contentId) {
    if (!window.currentStudent || !window.currentStudent.id) return '';
    
    const log = logs.find(log => 
        log.studentId === window.currentStudent.id && log.contentId === contentId
    );
    return log ? `${log.date} ${log.time}` : '';
}

// دالة لعرض المحتوى
function renderContent(content) {
    switch(content.type) {
        case 'link':
            return `
                <div class="content-preview">
                    <p>رابط خارجي:</p>
                    <a href="${content.content}" target="_blank" class="file-link" onclick="event.stopPropagation()">
                        ${content.title} - اضغط هنا لفتح الرابط
                    </a>
                </div>`;
        case 'file':
            return `
                <div class="content-preview">
                    <p>ملف مرفوع:</p>
                    <a href="${content.content}" download="${content.title}" class="file-link" onclick="event.stopPropagation()">
                        ${content.title} - اضغط هنا لتحميل الملف
                    </a>
                </div>`;
        case 'text':
            return `
                <div class="content-preview">
                    <h4>${content.title}</h4>
                    <p>${content.content}</p>
                </div>`;
        case 'fileWithNote':
            return `
                <div class="content-preview">
                    <p>ملف مرفوع:</p>
                    <a href="${content.content}" download="${content.title}" class="file-link" onclick="event.stopPropagation()">
                        ${content.title} - اضغط هنا لتحميل الملف
                    </a>
                    ${content.note ? `
                        <div class="note-section">
                            <h4>ملاحظة:</h4>
                            <p class="note-text">${content.note}</p>
                        </div>
                    ` : ''}
                </div>`;
        default:
            return '<p>نوع المحتوى غير معروف</p>';
    }
}

// الكود الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('studentLoginForm');
    const contentSection = document.getElementById('contentSection');
    const filesContainer = document.getElementById('filesContainer');
    const displayStudentName = document.getElementById('displayStudentName');
    const displayStudentId = document.getElementById('displayStudentId');
    const displayStudentPhone = document.getElementById('displayStudentPhone');
    const loginTime = document.getElementById('loginTime');
    
    // تعريف الدالة globally
    window.loadStudentContents = function() {
        const contents = getContents();
        const studentLogs = getStudentLogs();
        
        filesContainer.innerHTML = '';
        
        if (contents.length === 0) {
            filesContainer.innerHTML = '<p>لا توجد محتويات متاحة حالياً.</p>';
            return;
        }
        
        contents.forEach(content => {
            const hasViewed = studentLogs.some(log => 
                log.studentId === window.currentStudent.id && log.contentId === content.id
            );
            
            const contentElement = document.createElement('div');
            contentElement.className = `student-file-item ${hasViewed ? 'viewed' : ''}`;
            contentElement.innerHTML = `
                <div class="file-header">
                    <h3>${content.title}</h3>
                    <span class="status">${hasViewed ? 'تم الاطلاع ✓' : 'لم يتم الاطلاع'}</span>
                </div>
                <div class="file-content">
                    ${renderContent(content)}
                </div>
                <div class="file-actions">
                    ${!hasViewed ? `
                        <label class="checkbox-label">
                            <input type="checkbox" id="agreement-${content.id}">
                           نعم اطلعت على المحتوى المرفق
                        </label>
                        <button class="btn view-btn" data-content-id="${content.id}" data-content-title="${content.title}" disabled>
                            تأكيد الاطلاع
                        </button>
                    ` : `
                        <p class="viewed-message">تم تأكيد الاطلاع في: ${getViewDate(studentLogs, content.id)}</p>
                    `}
                </div>
            `;
            filesContainer.appendChild(contentElement);
            
            // إضافة event listener للزر مباشرة بدلاً من استخدام onclick
            if (!hasViewed) {
                const checkbox = document.getElementById(`agreement-${content.id}`);
                const viewBtn = contentElement.querySelector('.view-btn');
                
                checkbox.addEventListener('change', function() {
                    viewBtn.disabled = !this.checked;
                });
                
                // إضافة event listener للزر
                viewBtn.addEventListener('click', function() {
                    const contentId = this.getAttribute('data-content-id');
                    const contentTitle = this.getAttribute('data-content-title');
                    studentViewContent(contentId, contentTitle);
                });
            }
        });
    };
    
    // التعامل مع تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const studentName = document.getElementById('studentName').value.trim();
        const studentId = document.getElementById('studentId').value.trim();
        const studentPhone = document.getElementById('studentPhone').value.trim();
        
        if (studentName && studentId && studentPhone) {
            // التحقق من صحة رقم الهوية
            if (!isValidId(studentId)) {
                alert('يرجى إدخال رقم هوية صحيح (10 أرقام بالضبط)');
                return;
            }
            
            // التحقق من صحة رقم الجوال
            if (!isValidPhone(studentPhone)) {
                alert('يرجى إدخال رقم جوال صحيح (يبدأ بـ 05 ويتبعه 8 أرقام)');
                return;
            }
            
            // التحقق إذا كان رقم الهوية مسجل مسبقاً
            const existingStudent = getStudentById(studentId);
            if (existingStudent) {
                // التحقق إذا كانت البيانات مطابقة للبيانات المسجلة
                if (existingStudent.name !== studentName || existingStudent.phone !== studentPhone) {
                    const alertMessage = `⚠️ تنبيه: رقم الهوية مسجل مسبقًا\n\n❗ يرجى التأكد من صحة الاسم ورقم الجوال\n🔐 في حال النسيان، الرجاء التواصل مع مشرف البرنامج`;
                    alert(alertMessage);
                    return;
                }
            }
            
            window.currentStudent = {
                name: studentName,
                id: studentId,
                phone: studentPhone
            };
            
            // حفظ بيانات الطالب
            const saveResult = saveStudentData(window.currentStudent);
            if (saveResult === 'new') {
                alert('تم تسجيل دخولك بنجاح! 🎉');
            } else {
                alert('تم الدخول بنجاح! ✅');
            }
            
            // عرض بيانات الطالب
            displayStudentName.textContent = window.currentStudent.name;
            displayStudentId.textContent = window.currentStudent.id;
            displayStudentPhone.textContent = window.currentStudent.phone;
            loginTime.textContent = new Date().toLocaleString('ar-SA');
            
            loginForm.classList.add('hidden');
            contentSection.classList.remove('hidden');
            window.loadStudentContents();
        } else {
            alert('يرجى ملء جميع الحقول المطلوبة');
        }
    });
});
