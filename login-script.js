document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    const submitBtn = document.querySelector('.submit-btn');
    
    // თვალის ღილაკის გამოჩენა/მალვა წერისას
    if (passwordInput && toggleBtn) {
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0) {
                toggleBtn.style.display = 'flex'; 
            } else {
                toggleBtn.style.display = 'none'; 
            }
        });
    }

    // ფორმის გაგზავნის მართვა - ახლა უკვე ASYNC (ბაზას ელოდება)
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                alert("გთხოვთ შეავსოთ ორივე ველი.");
                return;
            }

            // ვიზუალური ეფექტი: ღილაკს ვაწერთ "ვამოწმებ..." და ვბლოკავთ
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "ვამოწმებ...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";

            try {
                if (typeof supabaseClient === 'undefined') {
                    alert("❌ ბაზასთან კავშირი ვერ მოხერხდა! შეამოწმეთ ინტერნეტი.");
                    resetButton();
                    return;
                }

                // ⚡ რეალური მოთხოვნა Supabase ბაზაში
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    // თუ პაროლი ან მეილი არასწორია (ან არ არსებობს)
                    alert("❌ შეცდომა: ელ-ფოსტის მისამართი ან პაროლი არასწორია!");
                    resetButton();
                } else {
                    // თუ ყველაფერი დაემთხვა და ბაზამ შემოუშვა
                    localStorage.setItem('isLoggedIn', 'true');
                    alert("✅ ავტორიზაცია წარმატებულია! კეთილი იყოს თქვენი მობრძანება.");
                    window.location.href = "index.html"; 
                }
            } catch (err) {
                alert("❌ სისტემური შეცდომა: " + err.message);
                resetButton();
            }

            // ღილაკის საწყის მდგომარეობაში დაბრუნების ფუნქცია
            function resetButton() {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        });
    }
});

// პაროლის ჩვენება / დამალვა
function togglePasswordVisibility() {
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
}