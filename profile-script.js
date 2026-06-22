import { db, auth } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const IMGBB_API_KEY = "9db4c152a217facd1c03ef9c605af364";

document.addEventListener("DOMContentLoaded", async () => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const defaultProfileBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmZmZmY7IGRpc3BsYXk6IGJsb2NrOyI+PHBhdGggZmlsbD0iIzgwODA4MCIgZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

    const userId = localStorage.getItem('user_id');
    let userProfile = JSON.parse(localStorage.getItem('staygeo_user_profile')) || {};

    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('emailAddress');
    const phoneInput = document.getElementById('phoneNumber');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInput = document.getElementById('avatarInput');
    const profileForm = document.getElementById('profileForm');

    try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();

            let fName = data.firstName || '';
            let lName = data.lastName || '';

            if (!fName && !lName && data.name) {
                const nameParts = data.name.split(' ');
                fName = nameParts[0] || '';
                lName = nameParts.slice(1).join(' ') || '';
            }

            if (firstNameInput) firstNameInput.value = fName;
            if (lastNameInput) lastNameInput.value = lName;
            
            if (emailInput) {
                emailInput.value = data.email || userProfile.email || '';
                emailInput.disabled = true;
            }
            
            if (phoneInput) phoneInput.value = data.phone || '';
            
            if (avatarPreview) {
                avatarPreview.alt = "";
                avatarPreview.src = data.avatar || userProfile.avatar || defaultProfileBase64;
            }
        }
    } catch (error) {
        console.error(error);
    }

    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                avatarPreview.style.opacity = "0.5";
                const reader = new FileReader();
                
                reader.onload = async (ev) => {
                    const base64Data = ev.target.result.split(',')[1];
                    const formData = new FormData();
                    formData.append('image', base64Data);

                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();

                    if (result.success) {
                        const newAvatarUrl = result.data.url;
                        
                        await updateDoc(doc(db, "users", userId), { avatar: newAvatarUrl });
                        
                        avatarPreview.src = newAvatarUrl;
                        userProfile.avatar = newAvatarUrl;
                        localStorage.setItem('staygeo_user_profile', JSON.stringify(userProfile));
                        
                        alert("✅ პროფილის სურათი განახლდა!");
                    }
                    avatarPreview.style.opacity = "1";
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error(error);
                avatarPreview.style.opacity = "1";
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            let origText = "შენახვა";
            
            if (submitBtn) {
                origText = submitBtn.innerText;
                submitBtn.innerText = "⏳...";
                submitBtn.disabled = true;
            }

            try {
                const fName = firstNameInput.value.trim();
                const lName = lastNameInput.value.trim();
                const phone = phoneInput.value.trim();

                await updateDoc(doc(db, "users", userId), {
                    firstName: fName,
                    lastName: lName,
                    phone: phone,
                    name: `${fName} ${lName}`
                });

                userProfile.firstName = fName;
                userProfile.lastName = lName;
                userProfile.name = `${fName} ${lName}`;
                userProfile.phone = phone;
                localStorage.setItem('staygeo_user_profile', JSON.stringify(userProfile));

                alert("✅ პროფილის მონაცემები წარმატებით განახლდა!");
            } catch (error) {
                console.error(error);
                alert("❌ შეცდომა მონაცემების შენახვისას.");
            } finally {
                if (submitBtn) {
                    submitBtn.innerText = origText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});

window.logoutUser = async function() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user_id');
    localStorage.removeItem('staygeo_user_profile');
    window.location.href = 'index.html';
};