import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const IMGBB_API_KEY = "9db4c152a217facd1c03ef9c605af364";

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

    if (!helpBtn || !helpPopup) return;

    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpPopup.classList.toggle('active');
    });

    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', () => {
            helpPopup.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (helpPopup.classList.contains('active') && !helpPopup.contains(e.target) && e.target !== helpBtn) {
            helpPopup.classList.remove('active');
        }
    });

    if (fileUpload && filePreviewContainer && fileNameDisplay) {
        fileUpload.addEventListener('change', () => {
            if (fileUpload.files.length > 0) {
                const file = fileUpload.files[0];
                fileNameDisplay.textContent = `📎 ${file.name}`;
                filePreviewContainer.style.display = 'flex';
            }
        });
    }

    if (removeFileBtn && fileUpload && filePreviewContainer && fileNameDisplay) {
        removeFileBtn.addEventListener('click', () => {
            fileUpload.value = '';
            filePreviewContainer.style.display = 'none';
            fileNameDisplay.textContent = '';
        });
    }

    async function uploadHelpImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        }
        return null;
    }

    if (helpForm && helpQuestion) {
        helpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = helpQuestion.value.trim();
            const hasFile = fileUpload && fileUpload.files.length > 0;

            if (!message) return;

            const submitBtn = helpForm.querySelector('button[type="submit"]');
            let originalText = "გაგზავნა";
            
            if (submitBtn) {
                originalText = submitBtn.innerText;
                submitBtn.innerText = "იგზავნება ⏳...";
                submitBtn.disabled = true;
            }

            try {
                let fileUrl = "";
                
                if (hasFile) {
                    const file = fileUpload.files[0];
                    if (file.type.startsWith('image/')) {
                        fileUrl = await uploadHelpImage(file);
                    }
                }

                const userProfile = JSON.parse(localStorage.getItem('staygeo_user_profile')) || {};
                const userEmail = userProfile.email || 'სტუმარი (ავტორიზაციის გარეშე)';

                await addDoc(collection(db, "support_requests"), {
                    email: userEmail,
                    message: message,
                    attachmentUrl: fileUrl,
                    status: "new",
                    createdAt: new Date().toISOString()
                });

                alert("✅ თქვენი შეტყობინება წარმატებით გაიგზავნა! ოპერატორი მალე დაგიკავშირდებათ.");
                
                helpQuestion.value = '';
                if (fileUpload) fileUpload.value = '';
                if (filePreviewContainer) filePreviewContainer.style.display = 'none';
                if (fileNameDisplay) fileNameDisplay.textContent = '';
                helpPopup.classList.remove('active');

            } catch (error) {
                console.error(error);
                alert("შეცდომა შეტყობინების გაგზავნისას. სცადეთ მოგვიანებით.");
            } finally {
                if (submitBtn) {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});