document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('visitorLoginForm');
    const contentSection = document.getElementById('contentSection');
    const filesContainer = document.getElementById('filesContainer');
    const displayVisitorName = document.getElementById('displayVisitorName');
    const displayVisitorId = document.getElementById('displayVisitorId');
    const displayVisitorPhone = document.getElementById('displayVisitorPhone');
    const loginTime = document.getElementById('loginTime');
    
    let currentVisitor = {
        name: '',
        id: '',
        phone: ''
    };
    
    // التعامل مع تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const visitorName = document.getElementById('visitorName').value.trim();
        const visitorId = document.getElementById('visitorId').value.trim();
        const visitorPhone = document.getElementById('visitorPhone').value.trim();
        
        if (visitorName && visitorId && visitorPhone) {
            // التحقق من صحة رقم الهوية (10 أرقام)
            if (!isValidId(visitorId)) {
                alert('يرجى إدخال رقم هوية صحيح (10 أرقام)');
                return;
            }
            
            // التحقق من صحة رقم الجوال
            if (!isValidPhone(visitorPhone)) {
                alert('يرجى إدخال رقم جوال صحيح');
                return;
            }
            
            currentVisitor = {
                name: visitorName,
                id: visitorId,
                phone: visitorPhone
            };
            
            // حفظ بيانات الزائر
            saveVisitorData(currentVisitor);
            
            // عرض بيانات الزائر
            displayVisitorName.textContent = currentVisitor.name;
            displayVisitorId.textContent = currentVisitor.id;
            displayVisitorPhone.textContent = currentVisitor.phone;
            loginTime.textContent = new Date().toLocaleString('ar-SA');
            
            loginForm.classList.add('hidden');
            contentSection.classList.remove('hidden');
            loadVisitorContents();
        } else {
            alert('يرجى ملء جميع الحقول المطلوبة');
        }
    });
    
    // تحميل محتويات الزائر
    function loadVisitorContents() {
        const contents = getContents();
        const visitorLogs = getVisitorLogs();
        
        filesContainer.innerHTML = '';
        
        if (contents.length === 0) {
            filesContainer.innerHTML = '<p>لا توجد محتويات متاحة حالياً.</p>';
            return;
        }
        
        contents.forEach(content => {
            const hasViewed = visitorLogs.some(log => 
                log.visitorId === currentVisitor.id && log.contentId === content.id
            );
            
            const contentElement = document.createElement('div');
            contentElement.className = `visitor-file-item ${hasViewed ? 'viewed' : ''}`;
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
                        <p class="viewed-message">تم تأكيد الاطلاع في: ${getViewDate(visitorLogs, content.id)}</p>
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
    
    function getVisitorLogs() {
        return JSON.parse(localStorage.getItem('visitorsLog')) || [];
    }
    
    function getViewDate(logs, contentId) {
        const log = logs.find(log => 
            log.visitorId === currentVisitor.id && log.contentId === contentId
        );
        return log ? `${log.date} ${log.time}` : '';
    }
    
    function saveVisitorData(visitor) {
        const visitorsData = getVisitorsData();
        // التحقق إذا كان الزائر مسجل مسبقاً
        const existingVisitor = visitorsData.find(v => v.id === visitor.id);
        
        if (!existingVisitor) {
            visitorsData.push({
                name: visitor.name,
                id: visitor.id,
                phone: visitor.phone,
                firstLogin: new Date().toLocaleString('ar-SA')
            });
            localStorage.setItem('visitorsData', JSON.stringify(visitorsData));
        }
    }
    
    function getVisitorsData() {
        return JSON.parse(localStorage.getItem('visitorsData')) || [];
    }
    
    function isValidId(id) {
        // رقم الهوية يجب أن يكون 10 أرقام
        return /^\d{10}$/.test(id);
    }
    
    function isValidPhone(phone) {
        // رقم الجوال يجب أن يبدأ بـ 05 ويتبعه 8 أرقام
        return /^05\d{8}$/.test(phone);
    }
    
    // جعل الدوال متاحة globally
    window.viewContent = function(contentId, contentTitle) {
        const visitorsLog = getVisitorLogs();
        const now = new Date();
        
        visitorsLog.push({
            visitorName: currentVisitor.name,
            visitorId: currentVisitor.id,
            visitorPhone: currentVisitor.phone,
            contentId: contentId,
            contentTitle: contentTitle,
            date: now.toLocaleDateString('ar-SA'),
            time: now.toLocaleTimeString('ar-SA'),
            timestamp: now.getTime()
        });
        
        localStorage.setItem('visitorsLog', JSON.stringify(visitorsLog));
        loadVisitorContents();
        alert('تم تسجيل الاطلاع بنجاح!');
    };
});
