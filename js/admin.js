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
    const visitorsTableBody = document.getElementById('visitorsTableBody');
    const visitorsDataTableBody = document.getElementById('visitorsDataTableBody');
    const printBtn = document.getElementById('printBtn');
    const searchVisitor = document.getElementById('searchVisitor');
    const editVisitorModal = document.getElementById('editVisitorModal');
    const editVisitorForm = document.getElementById('editVisitorForm');
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
    searchVisitor.addEventListener('input', function() {
        loadVisitorsData(this.value.trim());
    });

    // إغلاق نافذة التعديل
    closeModal.addEventListener('click', function() {
        editVisitorModal.classList.add('hidden');
    });

    cancelEdit.addEventListener('click', function() {
        editVisitorModal.classList.add('hidden');
    });

    // إغلاق النافذة عند النقر خارجها
    editVisitorModal.addEventListener('click', function(e) {
        if (e.target === editVisitorModal) {
            editVisitorModal.classList.add('hidden');
        }
    });

    // حفظ تعديلات الزائر
    editVisitorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const originalId = document.getElementById('editVisitorOriginalId').value;
        const name = document.getElementById('editVisitorName').value.trim();
        const id = document.getElementById('editVisitorId').value.trim();
        const phone = document.getElementById('editVisitorPhone').value.trim();
        
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
        
        updateVisitorData(originalId, { name, id, phone });
        editVisitorModal.classList.add('hidden');
        loadVisitorsData();
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
        loadVisitorsList();
        loadVisitorsData();
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

    function loadVisitorsList() {
        const visitorsLog = JSON.parse(localStorage.getItem('visitorsLog')) || [];
        visitorsTableBody.innerHTML = '';
        
        if (visitorsLog.length === 0) {
            visitorsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد بيانات</td></tr>';
            return;
        }
        
        visitorsLog.sort((a, b) => b.timestamp - a.timestamp);
        
        visitorsLog.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.visitorName}</td>
                <td>${log.visitorId}</td>
                <td>${log.visitorPhone}</td>
                <td>${log.contentTitle}</td>
                <td>${log.date}</td>
                <td>${log.time}</td>
            `;
            visitorsTableBody.appendChild(row);
        });
    }

    function loadVisitorsData(searchTerm = '') {
        const visitorsData = getVisitorsData();
        visitorsDataTableBody.innerHTML = '';
        
        let filteredVisitors = visitorsData;
        if (searchTerm) {
            filteredVisitors = visitorsData.filter(visitor => 
                visitor.name.includes(searchTerm) || 
                visitor.id.includes(searchTerm) ||
                visitor.phone.includes(searchTerm)
            );
        }
        
        if (filteredVisitors.length === 0) {
            visitorsDataTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد بيانات</td></tr>';
            return;
        }
        
        filteredVisitors.forEach(visitor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${visitor.name}</td>
                <td>${visitor.id}</td>
                <td>${visitor.phone}</td>
                <td>${visitor.firstLogin}</td>
                <td>
                    <button class="btn edit-btn" onclick="openEditVisitorModal('${visitor.id}')">تعديل</button>
                    <button class="btn delete-btn" onclick="deleteVisitor('${visitor.id}')">حذف</button>
                </td>
            `;
            visitorsDataTableBody.appendChild(row);
        });
    }

    function openEditVisitorModal(visitorId) {
        const visitorsData = getVisitorsData();
        const visitor = visitorsData.find(v => v.id === visitorId);
        
        if (visitor) {
            document.getElementById('editVisitorOriginalId').value = visitor.id;
            document.getElementById('editVisitorName').value = visitor.name;
            document.getElementById('editVisitorId').value = visitor.id;
            document.getElementById('editVisitorPhone').value = visitor.phone;
            editVisitorModal.classList.remove('hidden');
        }
    }

    function updateVisitorData(originalId, newData) {
        const visitorsData = getVisitorsData();
        const visitorIndex = visitorsData.findIndex(v => v.id === originalId);
        
        if (visitorIndex !== -1) {
            // تحديث بيانات الزائر
            visitorsData[visitorIndex] = {
                ...visitorsData[visitorIndex],
                ...newData
            };
            
            // تحديث سجل المطلعين إذا تغير رقم الهوية
            if (originalId !== newData.id) {
                updateVisitorsLog(originalId, newData.id, newData.name, newData.phone);
            }
            
            localStorage.setItem('visitorsData', JSON.stringify(visitorsData));
        }
    }

    function updateVisitorsLog(oldId, newId, newName, newPhone) {
        const visitorsLog = JSON.parse(localStorage.getItem('visitorsLog')) || [];
        const updatedLog = visitorsLog.map(log => {
            if (log.visitorId === oldId) {
                return {
                    ...log,
                    visitorId: newId,
                    visitorName: newName,
                    visitorPhone: newPhone
                };
            }
            return log;
        });
        localStorage.setItem('visitorsLog', JSON.stringify(updatedLog));
        loadVisitorsList();
    }

    function deleteVisitor(visitorId) {
        if (confirm('هل أنت متأكد من حذف هذا الزائر؟ سيتم حذف جميع سجلات الاطلاع الخاصة به.')) {
            const visitorsData = getVisitorsData();
            const filteredVisitors = visitorsData.filter(visitor => visitor.id !== visitorId);
            localStorage.setItem('visitorsData', JSON.stringify(filteredVisitors));
            
            // حذف سجلات الاطلاع الخاصة بالزائر
            const visitorsLog = JSON.parse(localStorage.getItem('visitorsLog')) || [];
            const filteredLog = visitorsLog.filter(log => log.visitorId !== visitorId);
            localStorage.setItem('visitorsLog', JSON.stringify(filteredLog));
            
            loadVisitorsData();
            loadVisitorsList();
            alert('تم حذف الزائر بنجاح!');
        }
    }

    function getVisitorsData() {
        return JSON.parse(localStorage.getItem('visitorsData')) || [];
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
    window.openEditVisitorModal = openEditVisitorModal;
    window.deleteVisitor = deleteVisitor;
    
    // تحديث القوائم كل 5 ثواني
    setInterval(() => {
        loadVisitorsList();
        loadVisitorsData();
    }, 5000);
});
