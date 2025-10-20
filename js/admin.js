// بيانات تسجيل الدخول الافتراضية
const ADMIN_CREDENTIALS = {
    username: "عمرو بن العاص",
    password: "10243"
};

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const contentType = document.getElementById('contentType');
    const linkInput = document.getElementById('linkInput');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const fileWithNoteInput = document.getElementById('fileWithNoteInput');
    const uploadForm = document.getElementById('uploadForm');
    const filesList = document.getElementById('filesList');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const printBtn = document.getElementById('printBtn');

    // التحقق من حالة تسجيل الدخول
    checkAdminLogin();

    // التعامل مع تسجيل الدخول
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    });

    // التعامل مع تغيير نوع المحتوى
    contentType.addEventListener('change', function() {
        linkInput.classList.add('hidden');
        fileInput.classList.add('hidden');
        textInput.classList.add('hidden');
        fileWithNoteInput.classList.add('hidden');
        
        switch(this.value) {
            case 'link':
                linkInput.classList.remove('hidden');
                break;
            case 'file':
                fileInput.classList.remove('hidden');
                break;
            case 'text':
                textInput.classList.remove('hidden');
                break;
            case 'fileWithNote':
                fileWithNoteInput.classList.remove('hidden');
                break;
        }
    });

    // التعامل مع رفع المحتوى
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const type = contentType.value;
        const title = document.getElementById('contentTitle').value.trim();
        let content = '';
        let note = '';
        
        switch(type) {
            case 'link':
                content = document.getElementById('contentLink').value.trim();
                if (!isValidUrl(content)) {
                    alert('يرجى إدخال رابط صحيح');
                    return;
                }
                break;
            case 'file':
                const file = document.getElementById('contentFile').files[0];
                if (file) {
                    content = URL.createObjectURL(file);
                } else {
                    alert('يرجى اختيار ملف');
                    return;
                }
                break;
            case 'text':
                content = document.getElementById('contentText').value.trim();
                if (content.length < 5) {
                    alert('يرجى إدخال نص ذو محتوى');
                    return;
                }
                break;
            case 'fileWithNote':
                const fileWithNote = document.getElementById('contentFileWithNote').files[0];
                note = document.getElementById('contentNote').value.trim();
                if (fileWithNote) {
                    content = URL.createObjectURL(fileWithNote);
                } else {
                    alert('يرجى اختيار ملف');
                    return;
                }
                if (note.length < 3) {
                    alert('يرجى إدخال ملاحظة حول الملف');
                    return;
                }
                break;
        }
        
        if (title && content) {
            addNewContent(type, title, content, note);
            uploadForm.reset();
        } else {
            alert('يرجى ملء جميع الحقول المطلوبة');
        }
    });

    // زر الطباعة
    printBtn.addEventListener('click', function() {
        window.print();
    });

    // وظائف مساعدة
    function checkAdminLogin() {
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            showAdminPanel();
        }
    }

    function showAdminPanel() {
        adminLoginSection.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadFilesList();
        loadStudentsList();
    }

    function addNewContent(type, title, content, note = '') {
        const contents = getContents();
        const newContent = {
            id: Date.now().toString(),
            type: type,
            title: title,
            content: content,
            note: note,
            date: new Date().toLocaleString('ar-SA')
        };
        
        contents.push(newContent);
        localStorage.setItem('adminContents', JSON.stringify(contents));
        loadFilesList();
        alert('تم إضافة المحتوى بنجاح!');
    }

    function getContents() {
        return JSON.parse(localStorage.getItem('adminContents')) || [];
    }

    function loadFilesList() {
        const contents = getContents();
        filesList.innerHTML = '';
        
        if (contents.length === 0) {
            filesList.innerHTML = '<p class="no-files">لا توجد محتويات مضافة</p>';
            return;
        }
        
        contents.forEach(content => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            
            let noteHtml = '';
            if (content.type === 'fileWithNote' && content.note) {
                noteHtml = `<p class="file-note">ملاحظة: ${content.note}</p>`;
            }
            
            fileElement.innerHTML = `
                <div class="file-info">
                    <h4>${content.title}</h4>
                    <p>نوع: ${getContentTypeText(content.type)}</p>
                    <p>تاريخ الإضافة: ${content.date}</p>
                    ${noteHtml}
                </div>
                <button class="btn delete-btn" onclick="adminDeleteContent('${content.id}')">حذف</button>
            `;
            filesList.appendChild(fileElement);
        });
    }

    function getContentTypeText(type) {
        const types = {
            'link': 'رابط',
            'file': 'ملف',
            'text': 'نص',
            'fileWithNote': 'ملف مع ملاحظة'
        };
        return types[type] || type;
    }

    function adminDeleteContent(contentId) {
        if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
            const contents = getContents();
            const filteredContents = contents.filter(content => content.id !== contentId);
            localStorage.setItem('adminContents', JSON.stringify(filteredContents));
            loadFilesList();
        }
    }

    function loadStudentsList() {
        const studentsLog = JSON.parse(localStorage.getItem('studentsLog')) || [];
        studentsTableBody.innerHTML = '';
        
        if (studentsLog.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد بيانات</td></tr>';
            return;
        }
        
        studentsLog.sort((a, b) => b.timestamp - a.timestamp);
        
        studentsLog.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.studentName}</td>
                <td>${log.contentTitle}</td>
                <td>${log.date}</td>
                <td>${log.time}</td>
            `;
            studentsTableBody.appendChild(row);
        });
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // جعل الدوال متاحة globally
    window.adminDeleteContent = adminDeleteContent;
    
    // تحديث القائمة كل 5 ثواني
    setInterval(loadStudentsList, 5000);
});
