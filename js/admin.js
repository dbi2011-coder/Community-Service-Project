// إعداد Supabase
const SUPABASE_URL = 'https://ejbxhymjsjwndnntgrco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYnhoeW1qc2p3bmRubnRncmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDAxNDEsImV4cCI6MjA3NjQxNjE0MX0.EIFm5epEpg8BxJig5HYt-OZpVBtaNFpyNqq9WbbExS4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// تنظيف كامل عند التحميل
localStorage.setItem('adminLoggedIn', 'false');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 بدء تحميل لوحة مشرف البرنامج');
    
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const contentType = document.getElementById('contentType');
    const linkInput = document.getElementById('linkInput');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const fileWithTextInput = document.getElementById('fileWithTextInput');
    const uploadForm = document.getElementById('uploadForm');
    const filesList = document.getElementById('filesList');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const printBtn = document.getElementById('printBtn');

    // تأكد من إظهار نموذج الدخول دائماً
    if (adminLoginSection) {
        adminLoginSection.classList.remove('hidden');
        adminLoginSection.style.display = 'block';
    }
    if (adminPanel) {
        adminPanel.classList.add('hidden');
        adminPanel.style.display = 'none';
    }

    // بيانات الدخول
    const ADMIN_CREDENTIALS = {
        username: "عمرو بن العاص",
        password: "10243"
    };

    // التعامل مع تسجيل الدخول
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🎯 تم النقر على زر الدخول');
        
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        console.log('بيانات الدخول:', { username, password });
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            console.log('✅ دخول ناجح');
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            console.log('❌ دخول فاشل');
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    });

    // التعامل مع تغيير نوع المحتوى
    contentType.addEventListener('change', function() {
        linkInput.classList.add('hidden');
        fileInput.classList.add('hidden');
        textInput.classList.add('hidden');
        fileWithTextInput.classList.add('hidden');
        
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
            case 'file_with_text':
                fileWithTextInput.classList.remove('hidden');
                break;
        }
    });

    // التعامل مع رفع المحتوى
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📤 بدء عملية رفع المحتوى');
        
        const type = contentType.value;
        const title = document.getElementById('contentTitle').value.trim();
        
        if (!title) {
            alert('يرجى إدخال عنوان المحتوى');
            return;
        }
        
        // إظهار تحميل
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'جاري الرفع...';
        submitBtn.disabled = true;
        
        try {
            let contentValue = '';
            let additionalData = {};
            
            if (type === 'file') {
                const fileInput = document.getElementById('contentFile');
                const file = fileInput.files[0];
                
                if (!file) {
                    alert('يرجى اختيار ملف');
                    return;
                }
                
                // التحقق من حجم الملف (5 MB كحد أقصى)
                if (file.size > 5 * 1024 * 1024) {
                    alert('حجم الملف كبير جداً. الحد الأقصى 5 MB');
                    return;
                }
                
                // اسم فريد للملف
                const fileExt = file.name.split('.').pop();
                const fileName = `file_${Date.now()}.${fileExt}`;
                
                console.log('بدء رفع الملف:', fileName);
                
                // رفع الملف إلى Storage
                const { data: uploadData, error: uploadError } = await supabaseClient
                    .storage
                    .from('course-files')
                    .upload(fileName, file);
                
                if (uploadError) {
                    console.error('خطأ في رفع الملف:', uploadError);
                    throw new Error(`فشل رفع الملف: ${uploadError.message}`);
                }
                
                // الحصول على الرابط العام
                const { data: urlData } = supabaseClient
                    .storage
                    .from('course-files')
                    .getPublicUrl(fileName);
                
                contentValue = urlData.publicUrl;
                console.log('تم الرفع بنجاح:', contentValue);
                
            } else if (type === 'link') {
                contentValue = document.getElementById('contentLink').value.trim();
                if (!contentValue) {
                    alert('يرجى إدخال الرابط');
                    return;
                }
            } else if (type === 'text') {
                contentValue = document.getElementById('contentText').value.trim();
                if (!contentValue) {
                    alert('يرجى إدخال النص');
                    return;
                }
            } else if (type === 'file_with_text') {
                const fileInput = document.getElementById('contentFileWithText');
                const file = fileInput.files[0];
                const textContent = document.getElementById('contentTextWithFile').value.trim();
                
                if (!file && !textContent) {
                    alert('يرجى إدخال ملف أو نص على الأقل');
                    return;
                }
                
                if (file) {
                    // التحقق من حجم الملف (5 MB كحد أقصى)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('حجم الملف كبير جداً. الحد الأقصى 5 MB');
                        return;
                    }
                    
                    // اسم فريد للملف
                    const fileExt = file.name.split('.').pop();
                    const fileName = `file_${Date.now()}.${fileExt}`;
                    
                    console.log('بدء رفع الملف:', fileName);
                    
                    // رفع الملف إلى Storage
                    const { data: uploadData, error: uploadError } = await supabaseClient
                        .storage
                        .from('course-files')
                        .upload(fileName, file);
                    
                    if (uploadError) {
                        console.error('خطأ في رفع الملف:', uploadError);
                        throw new Error(`فشل رفع الملف: ${uploadError.message}`);
                    }
                    
                    // الحصول على الرابط العام
                    const { data: urlData } = supabaseClient
                        .storage
                        .from('course-files')
                        .getPublicUrl(fileName);
                    
                    contentValue = urlData.publicUrl;
                }
                
                additionalData = {
                    text_content: textContent,
                    has_file: !!file,
                    has_text: !!textContent
                };
            }
            
            // إضافة المحتوى إلى قاعدة البيانات
            console.log('إضافة إلى قاعدة البيانات...');
            const contentData = {
                type: type,
                title: title,
                content: contentValue,
                ...additionalData
            };

            const { data, error } = await supabaseClient
                .from('contents')
                .insert([contentData])
                .select();
            
            if (error) {
                console.error('خطأ في قاعدة البيانات:', error);
                throw new Error(`فشل حفظ البيانات: ${error.message}`);
            }
            
            // إعادة تعيين النموذج
            uploadForm.reset();
            loadFilesList(); // تحديث القائمة
            
            alert('تم إضافة المحتوى بنجاح! ✅');
            
        } catch (error) {
            console.error('خطأ كامل:', error);
            alert('❌ حدث خطأ: ' + error.message);
        } finally {
            // إعادة زر الإرسال
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // زر الطباعة
    printBtn.addEventListener('click', function() {
        window.print();
    });

    function showAdminPanel() {
        if (adminLoginSection) {
            adminLoginSection.classList.add('hidden');
            adminLoginSection.style.display = 'none';
        }
        if (adminPanel) {
            adminPanel.classList.remove('hidden');
            adminPanel.style.display = 'block';
        }
        loadFilesList();
        loadStudentsList();
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
        try {
            const contents = await getContents();
            filesList.innerHTML = '';
            
            if (contents.length === 0) {
                filesList.innerHTML = '<p class="no-files">لا توجد محتويات مضافة</p>';
                return;
            }
            
            contents.forEach(content => {
                const fileElement = document.createElement('div');
                fileElement.className = 'file-item';
                
                let additionalInfo = '';
                if (content.type === 'file_with_text') {
                    additionalInfo = `
                        <p><strong>نوع:</strong> ملف مع نص</p>
                        ${content.has_file ? '<p>✓ يحتوي على ملف</p>' : ''}
                        ${content.has_text ? '<p>✓ يحتوي على نص</p>' : ''}
                    `;
                }
                
                fileElement.innerHTML = `
                    <div class="file-info">
                        <h4>${content.title}</h4>
                        <p>نوع: ${getContentTypeText(content.type)}</p>
                        <p>تاريخ الإضافة: ${new Date(content.created_at).toLocaleString('ar-SA')}</p>
                        ${additionalInfo}
                    </div>
                    <button class="btn delete-btn" onclick="deleteContent(${content.id})">حذف</button>
                `;
                filesList.appendChild(fileElement);
            });
        } catch (error) {
            console.error('Error loading files list:', error);
        }
    }

    async function deleteContent(contentId) {
        if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
            try {
                // أولاً: جلب معلومات المحتوى لمعرفة إذا كان ملفاً
                const { data: contentData, error: fetchError } = await supabaseClient
                    .from('contents')
                    .select('*')
                    .eq('id', contentId)
                    .single();
                
                if (fetchError) throw fetchError;
                
                // إذا كان ملفاً، حذفه من الـ Storage أيضاً
                if (contentData.type === 'file' || (contentData.type === 'file_with_text' && contentData.has_file)) {
                    const fileUrl = contentData.content;
                    const fileName = fileUrl.split('/').pop();
                    
                    const { error: storageError } = await supabaseClient
                        .storage
                        .from('course-files')
                        .remove([fileName]);
                    
                    if (storageError) {
                        console.error('Error deleting file from storage:', storageError);
                    }
                }
                
                // حذف المحتوى من قاعدة البيانات
                const { error } = await supabaseClient
                    .from('contents')
                    .delete()
                    .eq('id', contentId);
                
                if (error) throw error;
                
                loadFilesList();
                alert('تم حذف المحتوى بنجاح!');
                
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
                studentsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">لا توجد بيانات</td></tr>';
                return;
            }
            
            studentsLog.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${log.student_name}</td>
                    <td>${log.student_id || ''}</td>
                    <td>${log.student_phone || ''}</td>
                    <td>${log.content_title}</td>
                    <td>${getRatingStars(log.rating)}</td>
                    <td>${log.view_date}</td>
                    <td>${log.view_time}</td>
                `;
                studentsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading students list:', error);
        }
    }

    function getRatingStars(rating) {
        if (!rating) return 'لم يتم التقييم';
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        return stars;
    }

    function getContentTypeText(type) {
        const types = {
            'link': 'رابط',
            'file': 'ملف',
            'text': 'نص',
            'file_with_text': 'ملف مع نص'
        };
        return types[type] || type;
    }

    window.deleteContent = deleteContent;
    setInterval(loadStudentsList, 10000);
    
    console.log('✅ تم تحميل لوحة مشرف البرنامج بنجاح');
});
