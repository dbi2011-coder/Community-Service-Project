// دالة للتحقق من صحة رقم الهوية
function isValidId(id) {
    return /^\d{10}$/.test(id);
}

// دالة للتحقق من صحة رقم الجوال
function isValidPhone(phone) {
    return /^05\d{8}$/.test(phone);
}

// دالة للحصول على المحتويات
function getContents() {
    return JSON.parse(localStorage.getItem('adminContents')) || [];
}

// دالة للحصول على سجلات الزوار
function getVisitorLogs() {
    return JSON.parse(localStorage.getItem('visitorsLog')) || [];
}

// دالة للحصول على بيانات الزوار
function getVisitorsData() {
    return JSON.parse(localStorage.getItem('visitorsData')) || [];
}

// دالة للبحث عن زائر برقم الهوية
function getVisitorById(visitorId) {
    const visitorsData = getVisitorsData();
    return visitorsData.find(v => v.id === visitorId);
}

// دالة لحفظ بيانات الزائر
function saveVisitorData(visitor) {
    const visitorsData = getVisitorsData();
    const existingVisitor = visitorsData.find(v => v.id === visitor.id);
    
    if (!existingVisitor) {
        visitorsData.push({
            name: visitor.name,
            id: visitor.id,
            phone: visitor.phone,
            firstLogin: new Date().toLocaleString('ar-SA'),
            lastLogin: new Date().toLocaleString('ar-SA')
        });
        localStorage.setItem('visitorsData', JSON.stringify(visitorsData));
        return 'new';
    } else {
        // تحديث وقت آخر دخول
        existingVisitor.lastLogin = new Date().toLocaleString('ar-SA');
        localStorage.setItem('visitorsData', JSON.stringify(visitorsData));
        return 'existing';
    }
}

// دالة لتسجيل الاطلاع على المحتوى
function visitorViewContent(contentId, contentTitle) {
    if (!window.currentVisitor || !window.currentVisitor.id) {
        alert('يرجى تسجيل الدخول أولاً');
        return;
    }
    
    const visitorsLog = getVisitorLogs();
    const now = new Date();
    
    // التحقق إذا كان قد سجل الاطلاع مسبقاً
    const alreadyViewed = visitorsLog.some(log => 
        log.visitorId === window.currentVisitor.id && log.contentId === contentId
    );
    
    if (alreadyViewed) {
        alert('لقد سجلت الاطلاع على هذا المحتوى مسبقاً');
        return;
    }
    
    visitorsLog.push({
        visitorName: window.currentVisitor.name,
        visitorId: window.currentVisitor.id,
        visitorPhone: window.currentVisitor.phone,
        contentId: contentId,
        contentTitle: contentTitle,
        date: now.toLocaleDateString('ar-SA'),
        time: now.toLocaleTimeString('ar-SA'),
        timestamp: now.getTime()
    });
    
    localStorage.setItem('visitorsLog', JSON.stringify(visitorsLog));
    
    // إعادة تحميل المحتويات لتحديث الواجهة
    if (window.loadVisitorContents) {
        window.loadVisitorContents();
    }
    
    alert('تم تسجيل الاطلاع بنجاح!');
}

// دالة لعرض تاريخ الاطلاع
function getViewDate(logs, contentId) {
    if (!window.currentVisitor || !window.currentVisitor.id) return '';
    
    const log = logs.find(log => 
        log.visitorId === window.currentVisitor.id && log.contentId === contentId
    );
    return log ? `${log.date} ${log.time}` : '';
}

// دالة لعرض المحتوى
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

// دالة لإضافة نظام التقييم
function addRatingSystem(contentElement, contentId, hasViewed) {
    if (!hasViewed) return;
    
    const ratingSection = document.createElement('div');
    ratingSection.className = 'rating-section';
    ratingSection.innerHTML = `
        <div class="rating-title">
            <h4>تقييم المحتوى:</h4>
        </div>
        <div class="stars-rating">
            <div class="stars-container">
                <span class="star" data-rating="5">★</span>
                <span class="star" data-rating="4">★</span>
                <span class="star" data-rating="3">★</span>
                <span class="star" data-rating="2">★</span>
                <span class="star" data-rating="1">★</span>
            </div>
            <div class="rating-labels">
                <span class="rating-label" data-rating="5">ممتاز</span>
                <span class="rating-label" data-rating="4">جيد جداً</span>
                <span class="rating-label" data-rating="3">جيد</span>
                <span class="rating-label" data-rating="2">مقبول</span>
                <span class="rating-label" data-rating="1">ضعيف</span>
            </div>
        </div>
        <div class="rating-feedback hidden">
            <div class="form-group">
                <label for="ratingNote-${contentId}">ملاحظاتك (اختياري):</label>
                <textarea id="ratingNote-${contentId}" rows="3" placeholder="اكتب ملاحظاتك حول المحتوى..."></textarea>
            </div>
            <button class="btn submit-rating" data-content-id="${contentId}">تسجيل التقييم</button>
        </div>
        <div class="current-rating hidden">
            <p class="rating-result">تقييمك: <span class="rating-stars"></span> <span class="rating-text"></span></p>
            <p class="rating-note"></p>
        </div>
    `;
    
    contentElement.querySelector('.file-actions').appendChild(ratingSection);
    
    // التحقق إذا كان قد تم التقييم مسبقاً
    const existingRating = getContentRating(contentId);
    if (existingRating) {
        showCurrentRating(ratingSection, existingRating);
        return;
    }
    
    // إضافة event listeners بشكل صحيح
    initializeRatingEvents(ratingSection, contentId);
}

// دالة جديدة لتهيئة أحداث التقييم
function initializeRatingEvents(ratingSection, contentId) {
    const stars = ratingSection.querySelectorAll('.star');
    const ratingLabels = ratingSection.querySelectorAll('.rating-label');
    const ratingFeedback = ratingSection.querySelector('.rating-feedback');
    
    let currentRating = 0;
    
    // إضافة event listeners للنجوم
    stars.forEach(star => {
        star.addEventListener('click', function(e) {
            e.stopPropagation();
            currentRating = parseInt(this.getAttribute('data-rating'));
            setRating(stars, ratingLabels, currentRating);
            ratingFeedback.classList.remove('hidden');
        });
        
        star.addEventListener('mouseover', function(e) {
            e.stopPropagation();
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(stars, ratingLabels, rating);
        });
    });
    
    // إعادة التعيين عند مغادرة منطقة النجوم
    ratingSection.addEventListener('mouseleave', function(e) {
        if (currentRating > 0) {
            highlightStars(stars, ratingLabels, currentRating);
        } else {
            resetStars(stars, ratingLabels);
        }
    });
    
    // زر تسجيل التقييم
    const submitBtn = ratingSection.querySelector('.submit-rating');
    submitBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (currentRating === 0) {
            alert('يرجى اختيار تقييم أولاً');
            return;
        }
        
        const note = document.getElementById(`ratingNote-${contentId}`).value.trim();
        saveContentRating(contentId, currentRating, note);
        showCurrentRating(ratingSection, { rating: currentRating, note });
        
        alert('شكراً لك! تم تسجيل تقييمك بنجاح 🌟');
    });
}

// دالة جديدة لإعادة تعيين النجوم
function resetStars(stars, labels) {
    stars.forEach(star => {
        star.classList.remove('hover');
    });
    
    labels.forEach(label => {
        label.classList.remove('hover');
    });
}

// دالة لتحديد التقييم
function setRating(stars, labels, rating) {
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.add('active');
            star.classList.remove('hover');
        } else {
            star.classList.remove('active');
            star.classList.remove('hover');
        }
    });
    
    labels.forEach(label => {
        const labelRating = parseInt(label.getAttribute('data-rating'));
        if (labelRating === rating) {
            label.classList.add('active');
            label.classList.remove('hover');
        } else {
            label.classList.remove('active');
            label.classList.remove('hover');
        }
    });
}

// دالة لتظليل النجوم
function highlightStars(stars, labels, rating) {
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.add('hover');
        } else {
            star.classList.remove('hover');
        }
    });
    
    labels.forEach(label => {
        const labelRating = parseInt(label.getAttribute('data-rating'));
        if (labelRating === rating) {
            label.classList.add('hover');
        } else {
            label.classList.remove('hover');
        }
    });
}

// دالة لعرض التقييم الحالي
function showCurrentRating(ratingSection, ratingData) {
    const stars = ratingSection.querySelectorAll('.star');
    const labels = ratingSection.querySelectorAll('.rating-label');
    const ratingFeedback = ratingSection.querySelector('.rating-feedback');
    const currentRating = ratingSection.querySelector('.current-rating');
    const ratingStars = currentRating.querySelector('.rating-stars');
    const ratingText = currentRating.querySelector('.rating-text');
    const ratingNote = currentRating.querySelector('.rating-note');
    
    // تعيين النجوم
    setRating(stars, labels, ratingData.rating);
    
    // تعيين النص حسب التقييم
    const ratingTexts = {
        1: 'ضعيف',
        2: 'مقبول', 
        3: 'جيد',
        4: 'جيد جداً',
        5: 'ممتاز'
    };
    
    ratingStars.innerHTML = '★'.repeat(ratingData.rating) + '☆'.repeat(5 - ratingData.rating);
    ratingText.textContent = ratingTexts[ratingData.rating];
    
    // عرض الملاحظة إذا وجدت
    if (ratingData.note) {
        ratingNote.innerHTML = `<strong>ملاحظاتك:</strong> ${ratingData.note}`;
    } else {
        ratingNote.innerHTML = '';
    }
    
    ratingFeedback.classList.add('hidden');
    currentRating.classList.remove('hidden');
}

// دالة للحصول على تقييم المحتوى
function getContentRating(contentId) {
    const ratings = JSON.parse(localStorage.getItem('contentRatings')) || [];
    const visitorRating = ratings.find(r => 
        r.contentId === contentId && r.visitorId === window.currentVisitor.id
    );
    return visitorRating;
}

// دالة لحفظ تقييم المحتوى
function saveContentRating(contentId, rating, note) {
    const ratings = JSON.parse(localStorage.getItem('contentRatings')) || [];
    
    // إزالة أي تقييم سابق لنفس المحتوى والزائر
    const filteredRatings = ratings.filter(r => 
        !(r.contentId === contentId && r.visitorId === window.currentVisitor.id)
    );
    
    // إضافة التقييم الجديد
    filteredRatings.push({
        contentId: contentId,
        visitorId: window.currentVisitor.id,
        visitorName: window.currentVisitor.name,
        rating: rating,
        note: note,
        date: new Date().toLocaleString('ar-SA'),
        timestamp: new Date().getTime()
    });
    
    localStorage.setItem('contentRatings', JSON.stringify(filteredRatings));
}

// الكود الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('visitorLoginForm');
    const contentSection = document.getElementById('contentSection');
    const filesContainer = document.getElementById('filesContainer');
    const displayVisitorName = document.getElementById('displayVisitorName');
    const displayVisitorId = document.getElementById('displayVisitorId');
    const displayVisitorPhone = document.getElementById('displayVisitorPhone');
    const loginTime = document.getElementById('loginTime');
    
    // تعريف الدالة globally
    window.loadVisitorContents = function() {
        const contents = getContents();
        const visitorLogs = getVisitorLogs();
        
        filesContainer.innerHTML = '';
        
        if (contents.length === 0) {
            filesContainer.innerHTML = '<p>لا توجد محتويات متاحة حالياً.</p>';
            return;
        }
        
        contents.forEach(content => {
            const hasViewed = visitorLogs.some(log => 
                log.visitorId === window.currentVisitor.id && log.contentId === content.id
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
                        <button class="btn view-btn" data-content-id="${content.id}" data-content-title="${content.title}" disabled>
                            تأكيد الاطلاع
                        </button>
                    ` : `
                        <p class="viewed-message">تم تأكيد الاطلاع في: ${getViewDate(visitorLogs, content.id)}</p>
                    `}
                </div>
            `;
            filesContainer.appendChild(contentElement);
            
            // إضافة event listener للزر مباشرة بدلاً من استخدام onclick
            if (!hasViewed) {
                const checkbox = document.getElementById(`agreement-${content.id}`);
                const viewBtn = contentElement.querySelector('.view-btn');
                
                checkbox.addEventListener('change', function() {
                    viewBtn.disabled = !this.checked;
                });
                
                // إضافة event listener للزر
                viewBtn.addEventListener('click', function() {
                    const contentId = this.getAttribute('data-content-id');
                    const contentTitle = this.getAttribute('data-content-title');
                    visitorViewContent(contentId, contentTitle);
                });
            }
            
            // إضافة نظام التقييم للمحتوى
            addRatingSystem(contentElement, content.id, hasViewed);
        });
    };
    
    // التعامل مع تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const visitorName = document.getElementById('visitorName').value.trim();
        const visitorId = document.getElementById('visitorId').value.trim();
        const visitorPhone = document.getElementById('visitorPhone').value.trim();
        
        if (visitorName && visitorId && visitorPhone) {
            // التحقق من صحة رقم الهوية
            if (!isValidId(visitorId)) {
                alert('يرجى إدخال رقم هوية صحيح (10 أرقام بالضبط)');
                return;
            }
            
            // التحقق من صحة رقم الجوال
            if (!isValidPhone(visitorPhone)) {
                alert('يرجى إدخال رقم جوال صحيح (يبدأ بـ 05 ويتبعه 8 أرقام)');
                return;
            }
            
            // التحقق إذا كان رقم الهوية مسجل مسبقاً
            const existingVisitor = getVisitorById(visitorId);
            if (existingVisitor) {
                // التحقق إذا كانت البيانات مطابقة للبيانات المسجلة
                if (existingVisitor.name !== visitorName || existingVisitor.phone !== visitorPhone) {
                    const alertMessage = `⚠️ تنبيه: رقم الهوية مسجل مسبقًا\n\n❗ يرجى التأكد من صحة الاسم ورقم الجوال\n🔐 في حال النسيان، الرجاء التواصل مع مشرف البرنامج`;
                    alert(alertMessage);
                    return;
                }
            }
            
            window.currentVisitor = {
                name: visitorName,
                id: visitorId,
                phone: visitorPhone
            };
            
            // حفظ بيانات الزائر
            const saveResult = saveVisitorData(window.currentVisitor);
            if (saveResult === 'new') {
                alert('تم تسجيل دخولك بنجاح! 🎉');
            } else {
                alert('تم الدخول بنجاح! ✅');
            }
            
            // عرض بيانات الزائر
            displayVisitorName.textContent = window.currentVisitor.name;
            displayVisitorId.textContent = window.currentVisitor.id;
            displayVisitorPhone.textContent = window.currentVisitor.phone;
            loginTime.textContent = new Date().toLocaleString('ar-SA');
            
            loginForm.classList.add('hidden');
            contentSection.classList.remove('hidden');
            window.loadVisitorContents();
        } else {
            alert('يرجى ملء جميع الحقول المطلوبة');
        }
    });
});
