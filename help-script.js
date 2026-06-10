document.addEventListener("DOMContentLoaded", () => {
    const helpBtn = document.getElementById('helpBtn');
    const helpPopup = document.getElementById('helpPopup');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const helpForm = document.getElementById('helpForm');
    const helpQuestion = document.getElementById('helpQuestion');
    
    const fileUpload = document.getElementById('fileUpload');
    const filePreviewContainer = document.getElementById('filePreviewContainer');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const removeFileBtn = document.getElementById('removeFileBtn');

    // 🛡️ უსაფრთხოების შემოწმება: თუ ეს ღილაკი გვერდზე არ არსებობს, კოდი ჩერდება და არ დაერორდება
    if (!helpBtn || !helpPopup) return;

    // 1. ფანჯრის გახსნა / ჩაკეტვა ლურჯ ღილაკზე დაჭერით
    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpPopup.classList.toggle('active');
    });

    // 2. ჩაკეტვა X ღილაკით
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', () => {
            helpPopup.classList.remove('active');
        });
    }

    // 3. ჩაკეტვა ეკრანზე სხვაგან დაჭერისას
    document.addEventListener('click', (e) => {
        if (helpPopup.classList.contains('active') && !helpPopup.contains(e.target) && e.target !== helpBtn) {
            helpPopup.classList.remove('active');
        }
    });

    // 4. ფაილის მიბმის და მისი სახელის გამოჩენის ლოგიკა
    if (fileUpload && filePreviewContainer && fileNameDisplay) {
        fileUpload.addEventListener('change', () => {
            if (fileUpload.files.length > 0) {
                const file = fileUpload.files[0];
                fileNameDisplay.textContent = `📎 ${file.name}`;
                filePreviewContainer.style.display = 'flex';
            }
        });
    }

    // 5. ფაილის წაშლა გაგზავნამდე
    if (removeFileBtn && fileUpload && filePreviewContainer && fileNameDisplay) {
        removeFileBtn.addEventListener('click', () => {
            fileUpload.value = '';
            filePreviewContainer.style.display = 'none';
            fileNameDisplay.textContent = '';
        });
    }

    // 6. ფორმის გაგზავნა
    if (helpForm && helpQuestion) {
        helpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = helpQuestion.value.trim();
            const hasFile = fileUpload && fileUpload.files.length > 0;

            if (message) {
                if (hasFile) {
                    alert(`✅ თქვენი შეტყობინება და ფაილი (${fileUpload.files[0].name}) წარმატებით გაიგზავნა! ოპერატორი მალე დაგიკავშირდებათ.`);
                } else {
                    alert("✅ თქვენი შეტყობინება წარმატებით გაიგზავნა! ოპერატორი მალე დაგიკავშირდებათ.");
                }
                
                // ველების გასუფთავება
                helpQuestion.value = '';
                if (fileUpload) fileUpload.value = '';
                if (filePreviewContainer) filePreviewContainer.style.display = 'none';
                if (fileNameDisplay) fileNameDisplay.textContent = '';
                helpPopup.classList.remove('active');
            }
        });
    }
});