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
    const studentsDataTableBody = document.getElementById('studentsDataTableBody');
    const printBtn = document.getElementById('printBtn');
    const searchStudent = document.getElementById('searchStudent');
    const editStudentModal = document.getElementById('editStudentModal');
    const editStudentForm = document.getElementById('editStudentForm');
    const cancelEdit = document.getElementById('cancelEdit');
    const closeModal = document.querySelector('.close-modal');

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

    // البحث عن زائر
    searchStudent.addEventListener('input', function() {
        loadStudentsData(this.value.trim());
    });

    // إغلاق نافذة التعديل
    closeModal.addEventListener('click', function() {
        editStudentModal.classList.add('hidden');
    });

    cancelEdit.addEventListener('click', function() {
        editStudentModal.classList.add('hidden');
    });

    // إغلاق النافذة عند النقر خارجها
    editStudentModal.addEventListener('click', function(e) {
        if (e.target === editStudentModal) {
            editStudentModal.classList.add('hidden');
        }
    });

    // حفظ تعديلات الزائر
    editStudentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const originalId = document.getElementById('editStudentOriginalId').value;
        const name = document.getElementById('editStudentName').value.trim();
        const id = document.getElementById('editStudentId').value.trim();
        const phone = document.getElementById('editStudentPhone').value.trim();
        
        if (!name || !id || !phone) {
            alert('يرجى ملء جميع الحقول');
            return;
        }
        
        if (!isValidId(id)) {
            alert('يرجى إدخال رقم هوية صحيح (10 أرقام)');
            return;
        }
        
        if (!isValidPhone(phone)) {
            alert('يرجى إدخال رقم جوال صحيح');
            return;
        }
        
        updateStudentData(originalId, { name, id, phone });
        editStudentModal.classList.add('hidden');
        loadStudentsData();
        alert('تم تحديث بيانات الزائر بنجاح!');
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
        loadStudentsData();
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
            studentsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد بيانات</td></tr>';
            return;
        }
        
        studentsLog.sort((a, b) => b.timestamp - a.timestamp);
        
        studentsLog.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.studentName}</td>
                <td>${log.studentId}</td>
                <td>${log.studentPhone}</td>
                <td>${log.contentTitle}</td>
                <td>${log.date}</td>
                <td>${log.time}</td>
            `;
            studentsTableBody.appendChild(row);
        });
    }

    function loadStudentsData(searchTerm = '') {
        const studentsData = getStudentsData();
        studentsDataTableBody.innerHTML = '';
        
        let filteredStudents = studentsData;
        if (searchTerm) {
            filteredStudents = studentsData.filter(student => 
                student.name.includes(searchTerm) || 
                student.id.includes(searchTerm) ||
                student.phone.includes(searchTerm)
            );
        }
        
        if (filteredStudents.length === 0) {
            studentsDataTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد بيانات</td></tr>';
            return;
        }
        
        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.id}</td>
                <td>${student.phone}</td>
                <td>${student.firstLogin}</td>
                <td>
                    <button class="btn edit-btn" onclick="openEditStudentModal('${student.id}')">تعديل</button>
                    <button class="btn delete-btn" onclick="deleteStudent('${student.id}')">حذف</button>
                </td>
            `;
            studentsDataTableBody.appendChild(row);
        });
    }

    function openEditStudentModal(studentId) {
        const studentsData = getStudentsData();
        const student = studentsData.find(s => s.id === studentId);
        
        if (student) {
            document.getElementById('editStudentOriginalId').value = student.id;
            document.getElementById('editStudentName').value = student.name;
            document.getElementById('editStudentId').value = student.id;
            document.getElementById('editStudentPhone').value = student.phone;
            editStudentModal.classList.remove('hidden');
        }
    }

    function updateStudentData(originalId, newData) {
        const studentsData = getStudentsData();
        const studentIndex = studentsData.findIndex(s => s.id === originalId);
        
        if (studentIndex !== -1) {
            // تحديث بيانات الزائر
            studentsData[studentIndex] = {
                ...studentsData[studentIndex],
                ...newData
            };
            
            // تحديث سجل المطلعين إذا تغير رقم الهوية
            if (originalId !== newData.id) {
                updateStudentsLog(originalId, newData.id, newData.name, newData.phone);
            }
            
            localStorage.setItem('studentsData', JSON.stringify(studentsData));
        }
    }

    function updateStudentsLog(oldId, newId, newName, newPhone) {
        const studentsLog = JSON.parse(localStorage.getItem('studentsLog')) || [];
        const updatedLog = studentsLog.map(log => {
            if (log.studentId === oldId) {
                return {
                    ...log,
                    studentId: newId,
                    studentName: newName,
                    studentPhone: newPhone
                };
            }
            return log;
        });
        localStorage.setItem('studentsLog', JSON.stringify(updatedLog));
        loadStudentsList();
    }

    function deleteStudent(studentId) {
        if (confirm('هل أنت متأكد من حذف هذا الزائر؟ سيتم حذف جميع سجلات الاطلاع الخاصة به.')) {
            const studentsData = getStudentsData();
            const filteredStudents = studentsData.filter(student => student.id !== studentId);
            localStorage.setItem('studentsData', JSON.stringify(filteredStudents));
            
            // حذف سجلات الاطلاع الخاصة بالزائر
            const studentsLog = JSON.parse(localStorage.getItem('studentsLog')) || [];
            const filteredLog = studentsLog.filter(log => log.studentId !== studentId);
            localStorage.setItem('studentsLog', JSON.stringify(filteredLog));
            
            loadStudentsData();
            loadStudentsList();
            alert('تم حذف الزائر بنجاح!');
        }
    }

    function getStudentsData() {
        return JSON.parse(localStorage.getItem('studentsData')) || [];
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function isValidId(id) {
        return /^\d{10}$/.test(id);
    }

    function isValidPhone(phone) {
        return /^05\d{8}$/.test(phone);
    }

    // جعل الدوال متاحة globally
    window.adminDeleteContent = adminDeleteContent;
    window.openEditStudentModal = openEditStudentModal;
    window.deleteStudent = deleteStudent;
    
    // تحديث القوائم كل 5 ثواني
    setInterval(() => {
        loadStudentsList();
        loadStudentsData();
    }, 5000);
});
