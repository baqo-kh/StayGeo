document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    // თვალის ღილაკის გამოჩენა/მალვა წერისას
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length > 0) {
            toggleBtn.style.display = 'flex'; 
        } else {
            toggleBtn.style.display = 'none'; 
        }
    });

    // ფორმის გაგზავნის მართვა
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("გთხოვთ შეავსოთ ორივე ველი.");
            return;
        }

        console.log("ავტორიზაციის მონაცემები:", { email, password });

        // ვინახავთ სტატუსს, რომ მთავარმა გვერდმა პროფილის ლოგო გამოაჩინოს
        localStorage.setItem('isLoggedIn', 'true');

        alert("✅ ავტორიზაცია წარმატებულია! კეთილი იყოს თქვენი მობრძანება.");
        
        // გასწორდა index.html-ზე
        window.location.href = "index.html"; 
    });
});

// პაროლის ჩვენება / დამალვა
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
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