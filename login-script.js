document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    const submitBtn = document.querySelector('.submit-btn');
    
    // 1. თვალის ღილაკის გამოჩენა/მალვა წერისას (უფრო მოკლე ჩანაწერი)
    if (passwordInput && toggleBtn) {
        passwordInput.addEventListener('input', () => {
            toggleBtn.style.display = passwordInput.value.length > 0 ? 'flex' : 'none';
        });
    }

    // 2. ფორმის გაგზავნის მართვა
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            // ვიყენებთ Optional Chaining-ს უსაფრთხოებისთვის
            const email = document.getElementById('email')?.value.trim();
            const password = passwordInput?.value;

            if (!email || !password) {
                alert("გთხოვთ შეავსოთ ორივე ველი.");
                return;
            }

            // ღილაკის საწყის მდგომარეობაში დაბრუნების ფუნქცია
            const originalBtnText = submitBtn ? submitBtn.innerText : "შესვლა";
            const resetButton = () => {
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                }
            };

            // ვიზუალური ეფექტი: ღილაკს ვაწერთ "ვამოწმებ..." და ვბლოკავთ
            if (submitBtn) {
                submitBtn.innerText = "ვამოწმებ...";
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.7";
            }

            try {
                if (typeof supabaseClient === 'undefined') {
                    alert("❌ ბაზასთან კავშირი ვერ მოხერხდა! (Supabase არ არის ჩატვირთული)");
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
                    // ავტორიზაცია წარმატებულია
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // 🆕 ვინახავთ მომხმარებლის ID-ს (დაგჭირდება Supabase-ში განცხადების დასამატებლად)
                    if (data.user) {
                        localStorage.setItem('user_id', data.user.id);
                    }

                    alert("✅ ავტორიზაცია წარმატებულია! კეთილი იყოს თქვენი მობრძანება.");
                    window.location.href = "index.html"; 
                }
            } catch (err) {
                alert("❌ სისტემური შეცდომა: " + err.message);
                resetButton();
            }
        });
    }
});

// 3. პაროლის ჩვენება / დამალვა 
// (მიბმულია window-ზე, რომ HTML-ის onclick-მა გარანტირებულად იპოვოს)
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