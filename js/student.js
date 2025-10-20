// إعداد Supabase
const SUPABASE_URL = 'https://ejbxhymjsjwndnntgrco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYnhoeW1qc2p3bmRubnRncmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDAxNDEsImV4cCI6MjA3NjQxNjE0MX0.EIFm5epEpg8BxJig5HYt-OZpVBtaNFpyNqq9WbbExS4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('studentLoginForm');
    const contentSection = document.getElementById('contentSection');
    const filesContainer = document.getElementById('filesContainer');
    
    let currentStudent = '';
    let currentStudentId = '';
    let currentStudentPhone = '';
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const studentName = document.getElementById('studentName').value.trim();
        const studentId = document.getElementById('studentId').value.trim();
        const studentPhone = document.getElementById('studentPhone').value.trim();
        
        if (studentName && studentId && studentPhone) {
            currentStudent = studentName;
            currentStudentId = studentId;
            currentStudentPhone = studentPhone;
            loginForm.classList.add('hidden');
            contentSection.classList.remove('hidden');
            loadStudentContents();
        } else {
            alert('يرجى ملء جميع الحقول');
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
                log.student_name === currentStudent && 
                log.student_id === currentStudentId && 
                log.content_id === content.id
            );
            
            const studentLog = studentLogs.find(log => 
                log.student_name === currentStudent && 
                log.student_id === currentStudentId && 
                log.content_id === content.id
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
                        <div class="rating-section">
                            <p class="viewed-message">تم تأكيد الاطلاع في: ${getViewDate(studentLogs, content.id)}</p>
                            ${studentLog && studentLog.rating ? `
                                <p class="rating-display">تقييمك: ${getRatingStars(studentLog.rating)}</p>
                                ${studentLog.feedback ? `<p class="feedback-display">ملاحظاتك: ${studentLog.feedback}</p>` : ''}
                            ` : `
                                <div class="rating-input">
                                    <label>تقييم المحتوى:</label>
                                    <div class="stars" id="stars-${content.id}">
                                        <span class="star" data-rating="1">☆</span>
                                        <span class="star" data-rating="2">☆</span>
                                        <span class="star" data-rating="3">☆</span>
                                        <span class="star" data-rating="4">☆</span>
                                        <span class="star" data-rating="5">☆</span>
                                    </div>
                                    <div class="rating-labels">
                                        <small>1: ضعيف</small>
                                        <small>2: مقبول</small>
                                        <small>3: جيد</small>
                                        <small>4: جيد جدًا</small>
                                        <small>5: ممتاز</small>
                                    </div>
                                    <textarea id="feedback-${content.id}" placeholder="اكتب ملاحظاتك هنا (اختياري)" rows="2"></textarea>
                                    <button class="btn secondary" onclick="submitRating(${content.id}, '${content.title.replace(/'/g, "\\'")}')">حفظ التقييم</button>
                                </div>
                            `}
                        </div>
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
            } else if (!studentLog.rating) {
                // إعداد نظام النجوم للتقييم
                setupStarRating(content.id);
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
            case 'file_with_text':
                let fileSection = '';
                let textSection = '';
                
                if (content.has_file) {
                    fileSection = `
                        <p>ملف مرفوع:</p>
                        <a href="${content.content}" target="_blank" class="file-link" onclick="event.stopPropagation()">
                            اضغط هنا لتحميل الملف
                        </a>
                    `;
                }
                
                if (content.text_content) {
                    textSection = `
                        <p style="margin-top: 15px;">النص المرفق:</p>
                        <div class="text-content">${content.text_content}</div>
                    `;
                }
                
                return `
                    <div class="content-preview">
                        ${fileSection}
                        ${textSection}
                    </div>`;
            default:
                return '<p>نوع المحتوى غير معروف</p>';
        }
    }
    
    function setupStarRating(contentId) {
        const starsContainer = document.getElementById(`stars-${contentId}`);
        if (!starsContainer) return;
        
        const stars = starsContainer.querySelectorAll('.star');
        let currentRating = 0;
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                currentRating = parseInt(this.getAttribute('data-rating'));
                updateStars(stars, currentRating);
            });
            
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                updateStars(stars, rating, true);
            });
        });
        
        starsContainer.addEventListener('mouseleave', function() {
            updateStars(stars, currentRating);
        });
        
        // حفظ التقييم الحالي في العنصر
        starsContainer.setAttribute('data-current-rating', '0');
        
        function updateStars(stars, rating, isHover = false) {
            stars.forEach(star => {
                const starRating = parseInt(star.getAttribute('data-rating'));
                if (starRating <= rating) {
                    star.textContent = '★';
                    star.style.color = '#ffc107';
                } else {
                    star.textContent = '☆';
                    star.style.color = '#ccc';
                }
            });
            
            if (!isHover) {
                starsContainer.setAttribute('data-current-rating', rating.toString());
            }
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
            log.student_name === currentStudent && 
            log.student_id === currentStudentId && 
            log.content_id === contentId
        );
        return log ? `${log.view_date} ${log.view_time}` : '';
    }
    
    function getRatingStars(rating) {
        if (!rating) return '';
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        return stars;
    }
    
    window.viewContent = async function(contentId, contentTitle) {
        try {
            const now = new Date();
            const { error } = await supabaseClient
                .from('student_logs')
                .insert([
                    {
                        student_name: currentStudent,
                        student_id: currentStudentId,
                        student_phone: currentStudentPhone,
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
    
    window.submitRating = async function(contentId, contentTitle) {
        try {
            const starsContainer = document.getElementById(`stars-${contentId}`);
            const rating = parseInt(starsContainer.getAttribute('data-current-rating'));
            const feedback = document.getElementById(`feedback-${contentId}`).value.trim();
            
            if (rating === 0) {
                alert('يرجى اختيار تقييم');
                return;
            }
            
            // تحديث السجل الحالي بإضافة التقييم
            const { error } = await supabaseClient
                .from('student_logs')
                .update({
                    rating: rating,
                    feedback: feedback
                })
                .eq('student_name', currentStudent)
                .eq('student_id', currentStudentId)
                .eq('content_id', contentId);
            
            if (error) throw error;
            
            loadStudentContents();
            alert('تم حفظ التقييم بنجاح!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('حدث خطأ في حفظ التقييم');
        }
    };
});
