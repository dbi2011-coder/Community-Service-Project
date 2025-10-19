// إعداد Supabase
const SUPABASE_URL = 'https://ejbxhymjsjwndnntgrco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYnhoeW1qc2p3bmRubnRncmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDAxNDEsImV4cCI6MjA3NjQxNjE0MX0.EIFm5epEpg8BxJig5HYt-OZpVBtaNFpyNqq9WbbExS4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123"
};

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const contentType = document.getElementById('contentType');
    const linkInput = document.getElementById('linkInput');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const uploadForm = document.getElementById('uploadForm');
    const filesList = document.getElementById('filesList');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const printBtn = document.getElementById('printBtn');

    checkAdminLogin();

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

    contentType.addEventListener('change', function() {
        linkInput.classList.add('hidden');
        fileInput.classList.add('hidden');
        textInput.classList.add('hidden');
        
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
        }
    });

    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const type = contentType.value;
        const title = document.getElementById('contentTitle').value.trim();
        let contentValue = '';
        
        switch(type) {
            case 'link':
                contentValue = document.getElementById('contentLink').value.trim();
                break;
            case 'file':
                const file = document.getElementById('contentFile').files[0];
                if (file) {
                    contentValue = URL.createObjectURL(file);
                }
                break;
            case 'text':
                contentValue = document.getElementById('contentText').value.trim();
                break;
        }
        
        if (title && contentValue) {
            await addNewContent(type, title, contentValue);
            uploadForm.reset();
        } else {
            alert('يرجى ملء جميع الحقول المطلوبة');
        }
    });

    printBtn.addEventListener('click', function() {
        window.print();
    });

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

    async function addNewContent(type, title, content) {
        try {
            const { data, error } = await supabaseClient
                .from('contents')
                .insert([
                    {
                        type: type,
                        title: title,
                        content: content
                    }
                ])
                .select();
            
            if (error) throw error;
            
            loadFilesList();
            alert('تم إضافة المحتوى بنجاح!');
        } catch (error) {
            console.error('Error adding content:', error);
            alert('حدث خطأ في إضافة المحتوى');
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

    async function loadFilesList() {
        const contents = await getContents();
        filesList.innerHTML = '';
        
        if (contents.length === 0) {
            filesList.innerHTML = '<p class="no-files">لا توجد محتويات مضافة</p>';
            return;
        }
        
        contents.forEach(content => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.innerHTML = `
                <div class="file-info">
                    <h4>${content.title}</h4>
                    <p>نوع: ${getContentTypeText(content.type)}</p>
                    <p>تاريخ الإضافة: ${new Date(content.created_at).toLocaleString('ar-SA')}</p>
                </div>
                <button class="btn delete-btn" onclick="deleteContent(${content.id})">حذف</button>
            `;
            filesList.appendChild(fileElement);
        });
    }

    async function deleteContent(contentId) {
        if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
            try {
                const { error } = await supabaseClient
                    .from('contents')
                    .delete()
                    .eq('id', contentId);
                
                if (error) throw error;
                loadFilesList();
            } catch (error) {
                console.error('Error deleting content:', error);
                alert('حدث خطأ في حذف المحتوى');
            }
        }
    }

    async function loadStudentsList() {
        try {
            const { data, error } = await supabaseClient
                .from('student_logs')
                .select('*')
                .order('timestamp', { ascending: false });
            
            if (error) throw error;
            
            const studentsLog = data || [];
            studentsTableBody.innerHTML = '';
            
            if (studentsLog.length === 0) {
                studentsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد بيانات</td></tr>';
                return;
            }
            
            studentsLog.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${log.student_name}</td>
                    <td>${log.content_title}</td>
                    <td>${log.view_date}</td>
                    <td>${log.view_time}</td>
                `;
                studentsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading students list:', error);
        }
    }

    function getContentTypeText(type) {
        const types = {
            'link': 'رابط',
            'file': 'ملف',
            'text': 'نص'
        };
        return types[type] || type;
    }

    window.deleteContent = deleteContent;
    setInterval(loadStudentsList, 10000);
});
