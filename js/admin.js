uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
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
            
            console.log('بدء رفع الملف:', fileName, 'الحجم:', file.size);
            
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
        }
        
        // إضافة المحتوى إلى قاعدة البيانات
        console.log('إضافة إلى قاعدة البيانات...');
        const { data, error } = await supabaseClient
            .from('contents')
            .insert([
                {
                    type: type,
                    title: title,
                    content: contentValue
                }
            ])
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
