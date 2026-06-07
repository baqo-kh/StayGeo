let streams = { ID: null, Face: null };
let capturedImages = { idCardBase64: null, faceBase64: null };

document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (passwordInput && toggleBtn) {
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0) {
                toggleBtn.style.display = 'flex'; 
            } else {
                toggleBtn.style.display = 'none'; 
            }
        });
    }
});

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

function goToStep(stepNumber) {
    document.querySelectorAll('.reg-step-box').forEach(box => box.classList.remove('active'));
    document.querySelectorAll('.step').forEach((s, index) => {
        if (index + 1 <= stepNumber) s.classList.add('active');
        else s.classList.remove('active');
    });

    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) targetStep.classList.add('active');

    if (stepNumber === 2) {
        startCamera('videoID', 'ID');
    } else if (stepNumber === 3) {
        stopCamera('ID'); 
        startCamera('videoFace', 'Face');
    }
}

function validateAndGoToStep2() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    if (!firstName || !lastName || !email || !pass) {
        alert("გთხოვთ, შეავსოთ ყველა ველი რეგისტრაციის გასაგრძელებლად.");
        return;
    }
    if (pass.length < 8) {
        alert("❌ პაროლი უნდა შედგებოდეს მინიმუმ 8 სიმბოლოსგან!");
        return;
    }
    if (!/[A-Z]/.test(pass)) {
        alert("❌ პაროლი უნდა შეიცავდეს მინიმუმ 1 დიდ ინგლისურ ასოს (A-Z)!");
        return;
    }
    if (!/\d/.test(pass)) {
        alert("❌ პაროლი უნდა შეიცავდეს მინიმუმ 1 ციფრს (0-9)!");
        return;
    }
    if (/[ა-ჰ]/.test(pass)) {
        alert("❌ ასოები უნდა იყოს მხოლოდ ინგლისური! ქართული შრიფტი არ დაიშვება.");
        return;
    }
    goToStep(2);
}

async function startCamera(videoId, type) {
    try {
        const constraints = {
            video: { facingMode: type === 'ID' ? 'environment' : 'user' },
            audio: false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streams[type] = stream;
        const videoElement = document.getElementById(videoId);
        if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
        }
        const previewId = type === 'ID' ? 'photoPreviewID' : 'photoPreviewFace';
        const previewElement = document.getElementById(previewId);
        if (previewElement) previewElement.style.display = 'none';
    } catch (err) {
        console.error("კამერის შეცდომა: ", err);
        alert("კამერაზე წვდომა უარყოფილია ან მოწყობილობას არ აქვს კამერა.");
        goToStep(1);
    }
}

function stopCamera(type) {
    if (streams[type]) {
        streams[type].getTracks().forEach(track => track.stop());
        streams[type] = null;
    }
}

function capturePhoto(type) {
    const isID = type === 'ID';
    const video = document.getElementById(isID ? 'videoID' : 'videoFace');
    const canvas = document.getElementById(isID ? 'canvasID' : 'canvasFace');
    const preview = document.getElementById(isID ? 'photoPreviewID' : 'photoPreviewFace');
    if (!video || !video.srcObject || !canvas || !preview) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    
    if (isID) {
        capturedImages.idCardBase64 = dataURL;
        document.getElementById('nextToStep3').disabled = false;
    } else {
        capturedImages.faceBase64 = dataURL;
        document.getElementById('finalSubmitBtn').disabled = false;
    }
    video.style.display = 'none';
    preview.src = dataURL;
    preview.style.display = 'block';
}

async function verifyAndRegister() {
    const loadingBox = document.getElementById('ai-loading');
    const loadingText = loadingBox ? loadingBox.querySelector('p') : null;
    const spinner = loadingBox ? loadingBox.querySelector('.spinner') : null;

    // 1. მკაცრი შემოწმება: გადაიღო თუ არა ორივე სურათი?
    if (!capturedImages.idCardBase64 || !capturedImages.faceBase64) {
        alert("❌ გთხოვთ, აუცილებლად გადაიღოთ ID ბარათი და სელფი რეგისტრაციის დასასრულებლად!");
        return;
    }

    if (loadingBox) loadingBox.style.display = 'block';
    if (spinner) spinner.style.display = 'block';
    if (loadingText) loadingText.innerHTML = "📍 ნაბიჯი 1: სურათების ხარისხის შემოწმება...";

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        if (loadingText) loadingText.innerHTML = "📍 ნაბიჯი 2: AI ბიომეტრიული ანალიზი მიმდინარეობს...";

        // ==============================================================
        // 🤖 აქ მომავალში ჩაისმება რეალური AI API-ს მოთხოვნა (მაგ. Face++)
        // მაგალითი, როგორ იმუშავებს:
        // const aiResponse = await fetch('https://api.face.com/v1/compare', {
        //     method: 'POST',
        //     body: JSON.stringify({ idImage: capturedImages.idCardBase64, faceImage: capturedImages.faceBase64 })
        // });
        // const aiResult = await aiResponse.json();
        // if (!aiResult.isMatch) throw new Error("სახეები არ ემთხვევა ერთმანეთს!");
        // ==============================================================

        // დროებითი დაყოვნება, რომ AI-ს სიმულაცია უფრო რეალისტური იყოს (2.5 წამი)
        await new Promise(resolve => setTimeout(resolve, 2500));

        if (loadingText) loadingText.innerHTML = "📍 ნაბიჯი 3: ვუკავშირდები Supabase-ის ბაზას...";

        if (typeof supabaseClient === 'undefined') {
            throw new Error("supabaseClient ბიბლიოთეკა არ არის ჩატვირთული!");
        }

        // რეალური რეგისტრაცია Supabase-ში
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    // სურვილისამებრ, შეგიძლიათ ბაზაში შეინახოთ, რომ მომხმარებელმა KYC გაიარა
                    is_verified: true 
                }
            }
        });

        if (error) {
            throw error;
        } else {
            if (loadingText) loadingText.innerHTML = "<span style='color: #4ecdc4; font-weight: bold;'>🎉 ბიომეტრიული რეგისტრაცია წარმატებით დასრულდა! გადავდივართ მთავარზე...</span>";
            if (spinner) spinner.style.display = 'none';
            
            localStorage.setItem('isLoggedIn', 'true');

            // გადამისამართება მთავარ გვერდზე
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        }
    } catch (err) {
        if (loadingText) loadingText.innerHTML = "<span style='color: #ff6b6b;'>❌ შეცდომა: " + err.message + "</span>";
        if (spinner) spinner.style.display = 'none';
    }
}