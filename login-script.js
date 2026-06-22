import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (passwordInput && toggleBtn) {
        passwordInput.addEventListener('input', () => {
            toggleBtn.style.display = passwordInput.value.length > 0 ? 'flex' : 'none';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const email = document.getElementById('email')?.value.trim();
            const password = passwordInput?.value;

            if (!email || !password) {
                alert("გთხოვთ შეავსოთ ორივე ველი.");
                return;
            }

            const originalBtnText = submitBtn ? submitBtn.innerText : "შესვლა";
            const resetButton = () => {
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                }
            };

            if (submitBtn) {
                submitBtn.innerText = "ვამოწმებ...";
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.7";
            }

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                let userData = {};
                if (userDocSnap.exists()) {
                    userData = userDocSnap.data();
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user_id', user.uid);
                
                localStorage.setItem('staygeo_user_profile', JSON.stringify({
                    uid: user.uid,
                    name: user.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                    email: user.email,
                    phone: userData.phone || '',
                    avatar: userData.avatar || ''
                }));

                alert("✅ ავტორიზაცია წარმატებულია! კეთილი იყოს თქვენი მობრძანება.");
                window.location.href = "index.html"; 

            } catch (error) {
                console.error(error);
                
                let errorMessage = "დაფიქსირდა სისტემური შეცდომა.";
                
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = "ელ-ფოსტა ან პაროლი არასწორია.";
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = "ზედმეტად ბევრი მცდელობა. უსაფრთხოების მიზნით, სცადეთ მოგვიანებით.";
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = "ინტერნეტთან კავშირი გაწყვეტილია.";
                }
                
                alert(`❌ ${errorMessage}`);
                resetButton();
            }
        });
    }
});

window.togglePasswordVisibility = function() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    if (!passwordInput || !eyeIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M5 11a7 7 0 0 1 14 0" />
            <circle cx="12" cy="13" r="3" />
            <line x1="3" y1="3" x2="21" y2="21" stroke="#ff6b6b" stroke-width="2"/>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M5 11a7 7 0 0 1 14 0" />
            <circle cx="12" cy="13" r="3" />
        `;
    }
};