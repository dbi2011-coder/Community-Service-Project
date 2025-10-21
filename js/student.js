// دالة لإضافة نظام التقييم - الإصدار المصحح
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
    
    // إضافة event listeners بشكل صحيح - الإصلاح هنا
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
    const studentRating = ratings.find(r => 
        r.contentId === contentId && r.studentId === window.currentStudent.id
    );
    return studentRating;
}

// دالة لحفظ تقييم المحتوى
function saveContentRating(contentId, rating, note) {
    const ratings = JSON.parse(localStorage.getItem('contentRatings')) || [];
    
    // إزالة أي تقييم سابق لنفس المحتوى والطالب
    const filteredRatings = ratings.filter(r => 
        !(r.contentId === contentId && r.studentId === window.currentStudent.id)
    );
    
    // إضافة التقييم الجديد
    filteredRatings.push({
        contentId: contentId,
        studentId: window.currentStudent.id,
        studentName: window.currentStudent.name,
        rating: rating,
        note: note,
        date: new Date().toLocaleString('ar-SA'),
        timestamp: new Date().getTime()
    });
    
    localStorage.setItem('contentRatings', JSON.stringify(filteredRatings));
}
