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

    // 1. ფანჯრის გახსნა / ჩაკეტვა ლურჯ ღილაკზე დაჭერით
    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpPopup.classList.toggle('active');
    });

    // 2. ჩაკეტვა X ღილაკით
    closeHelpBtn.addEventListener('click', () => {
        helpPopup.classList.remove('active');
    });

    // 3. ჩაკეტვა ეკრანზე სხვაგან დაჭერისას
    document.addEventListener('click', (e) => {
        if (!helpPopup.contains(e.target) && e.target !== helpBtn) {
            helpPopup.classList.remove('active');
        }
    });

    // 4. ფაილის მიბმის და მისი სახელის გამოჩენის ლოგიკა
    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length > 0) {
            const file = fileUpload.files[0];
            fileNameDisplay.textContent = `📎 ${file.name}`;
            filePreviewContainer.style.display = 'flex';
        }
    });

    // 5. ფაილის წაშლა გაგზავნამდე
    removeFileBtn.addEventListener('click', () => {
        fileUpload.value = '';
        filePreviewContainer.style.display = 'none';
        fileNameDisplay.textContent = '';
    });

    // 6. ფორმის გაგზავნა
    helpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = helpQuestion.value.trim();
        const hasFile = fileUpload.files.length > 0;

        if (message) {
            if (hasFile) {
                alert(`✅ თქვენი შეტყობინება და ფაილი (${fileUpload.files[0].name}) წარმატებით გაიგზავნა! ოპერატორი მალე დაგიკავშირდებათ.`);
            } else {
                alert("✅ თქვენი შეტყობინება წარმატებით გაიგზავნა! ოპერატორი მალე დაგიკავშირდებათ.");
            }
            
            // ველების გასუფთავება
            helpQuestion.value = '';
            fileUpload.value = '';
            filePreviewContainer.style.display = 'none';
            fileNameDisplay.textContent = '';
            helpPopup.classList.remove('active');
        }
    });
});