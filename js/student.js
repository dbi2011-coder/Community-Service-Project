document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('studentLoginForm');
    const contentSection = document.getElementById('contentSection');
    const filesContainer = document.getElementById('filesContainer');
    
    let currentStudent = '';
    
    // التعامل مع تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const studentName = document.getElementById('studentName').value.trim();
        
        if (studentName) {
            currentStudent = studentName;
            loginForm.classList.add('hidden');
            contentSection.classList.remove('hidden');
            loadStudentContents();
        }
    });
    
    // تحميل محتويات الزائر
    function loadStudentContents() {
        const contents = getContents();
        const studentLogs = getStudentLogs();
        
        filesContainer.innerHTML = '';
        
        if (contents.length === 0) {
            filesContainer.innerHTML = '<p>لا توجد محتويات متاحة حالياً.</p>';
            return;
        }
        
        contents.forEach(content => {
            const hasViewed = studentLogs.some(log => 
                log.studentName === currentStudent && log.contentId === content.id
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
                        <button class="btn view-btn" onclick="viewContent('${content.id}', '${content.title}')" disabled>
                            تأكيد الاطلاع
                        </button>
                    ` : `
                        <p class="viewed-message">تم تأكيد الاطلاع في: ${getViewDate(studentLogs, content.id)}</p>
                    `}
                </div>
            `;
            filesContainer.appendChild(contentElement);
            
            // إضافة event listener للcheckbox
            if (!hasViewed) {
                const checkbox = document.getElementById(`agreement-${content.id}`);
                const viewBtn = contentElement.querySelector('.view-btn');
                
                checkbox.addEventListener('change', function() {
                    viewBtn.disabled = !this.checked;
                });
            }
        });
    }
    
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
    
    function getContents() {
        return JSON.parse(localStorage.getItem('adminContents')) || [];
    }
    
    function getStudentLogs() {
        return JSON.parse(localStorage.getItem('studentsLog')) || [];
    }
    
    function getViewDate(logs, contentId) {
        const log = logs.find(log => 
            log.studentName === currentStudent && log.contentId === contentId
        );
        return log ? `${log.date} ${log.time}` : '';
    }
    
    // جعل الدوال متاحة globally
    window.viewContent = function(contentId, contentTitle) {
        const studentsLog = getStudentLogs();
        const now = new Date();
        
        studentsLog.push({
            studentName: currentStudent,
            contentId: contentId,
            contentTitle: contentTitle,
            date: now.toLocaleDateString('ar-SA'),
            time: now.toLocaleTimeString('ar-SA'),
            timestamp: now.getTime()
        });
        
        localStorage.setItem('studentsLog', JSON.stringify(studentsLog));
        loadStudentContents();
        alert('تم تسجيل الاطلاع بنجاح!');
    };
});
