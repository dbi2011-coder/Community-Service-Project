// إعداد Supabase
const SUPABASE_URL = 'https://ejbxhymjsjwndnntgrco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYnhoeW1qc2p3bmRubnRncmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDAxNDEsImV4cCI6MjA3NjQxNjE0MX0.EIFm5epEpg8BxJig5HYt-OZpVBtaNFpyNqq9WbbExS4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('studentLoginForm');
    const contentSection = document.getElementById('contentSection');
    const filesContainer = document.getElementById('filesContainer');
    
    let currentStudent = '';
    
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
    
    async function loadStudentContents() {
        const contents = await getContents();
        const studentLogs = await getStudentLogs();
        
        filesContainer.innerHTML = '';
        
        if (contents.length === 0) {
            filesContainer.innerHTML = '<p>لا توجد محتويات متاحة حالياً.</p>';
            return;
        }
        
        contents.forEach(content => {
            const hasViewed = studentLogs.some(log => 
                log.student_name === currentStudent && log.content_id === content.id
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
                        <button class="btn view-btn" onclick="viewContent(${content.id}, '${content.title.replace(/'/g, "\\'")}')" disabled>
                            تأكيد الاطلاع
                        </button>
                    ` : `
                        <p class="viewed-message">تم تأكيد الاطلاع في: ${getViewDate(studentLogs, content.id)}</p>
                    `}
                </div>
            `;
            filesContainer.appendChild(contentElement);
            
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
                            اضغط هنا لفتح الرابط
                        </a>
                    </div>`;
            case 'file':
                return `
                    <div class="content-preview">
                        <p>ملف مرفوع:</p>
                        <a href="${content.content}" target="_blank" class="file-link" onclick="event.stopPropagation()">
                            اضغط هنا لتحميل الملف
                        </a>
                        <p style="margin-top: 10px; font-size: 14px; color: #666;">
                            <strong>ملاحظة:</strong> سيتم فتح نافذة جديدة لتحميل الملف
                        </p>
                    </div>`;
            case 'text':
                return `
                    <div class="content-preview">
                        <p>${content.content}</p>
                    </div>`;
            default:
                return '<p>نوع المحتوى غير معروف</p>';
        }
    }
    
    async function getContents() {
        try {
            const { data, error } = await supabaseClient
                .from('contents')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching contents:', error);
            return [];
        }
    }
    
    async function getStudentLogs() {
        try {
            const { data, error } = await supabaseClient
                .from('student_logs')
                .select('*');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching student logs:', error);
            return [];
        }
    }
    
    function getViewDate(logs, contentId) {
        const log = logs.find(log => 
            log.student_name === currentStudent && log.content_id === contentId
        );
        return log ? `${log.view_date} ${log.view_time}` : '';
    }
    
    window.viewContent = async function(contentId, contentTitle) {
        try {
            const now = new Date();
            const { error } = await supabaseClient
                .from('student_logs')
                .insert([
                    {
                        student_name: currentStudent,
                        content_id: contentId,
                        content_title: contentTitle,
                        view_date: now.toLocaleDateString('ar-SA'),
                        view_time: now.toLocaleTimeString('ar-SA'),
                        timestamp: now.getTime()
                    }
                ]);
            
            if (error) throw error;
            
            loadStudentContents();
            alert('تم تسجيل الاطلاع بنجاح!');
        } catch (error) {
            console.error('Error logging view:', error);
            alert('حدث خطأ في تسجيل الاطلاع');
        }
    };
});
