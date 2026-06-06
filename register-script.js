// გლობალური ცვლადები კამერისა და ფოტოებისთვის
let streams = { ID: null, Face: null };
let capturedImages = { idCardBase64: null, faceBase64: null };

// პაროლის გამოჩენა/დამალვის ღილაკის ლოგიკა ჩატვირთვისას
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

// თვალის აიკონზე დაჭერისას პაროლის გამოჩენა
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

// ეტაპებს შორის გადასვლა
function goToStep(stepNumber) {
    document.querySelectorAll('.reg-step-box').forEach(box => box.classList.remove('active'));
    
    document.querySelectorAll('.step').forEach((s, index) => {
        if (index + 1 <= stepNumber) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });

    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }

    // კამერების მართვა ეტაპების მიხედვით
    if (stepNumber === 2) {
        startCamera('videoID', 'ID');
    } else if (stepNumber === 3) {
        stopCamera('ID'); 
        startCamera('videoFace', 'Face');
    }
}

// პირველი ეტაპის ვალიდაცია
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
        alert("❌ პაროლის შეცდომა: პაროლი უნდა შედგებოდეს მინიმუმ 8 სიმბოლოსგან!");
        return;
    }

    if (!/[A-Z]/.test(pass)) {
        alert("❌ პაროლის შეცდომა: პაროლი უნდა შეიცავდეს მინიმუმ 1 დიდ ინგლისურ ასოს (A-Z)!");
        return;
    }

    if (!/\d/.test(pass)) {
        alert("❌ პაროლის შეცდომა: პაროლი უნდა შეიცავდეს მინიმუმ 1 ციფრს (0-9)!");
        return;
    }

    if (/[ა-ჰ]/.test(pass)) {
        alert("❌ პაროლის შეცდომა: ასოები უნდა იყოს მხოლოდ ინგლისური! ქართული შრიფტი არ დაიშვება.");
        return;
    }

    goToStep(2);
}

// კამერის ჩართვა
async function startCamera(videoId, type) {
    try {
        const constraints = {
            video: {
                facingMode: type === 'ID' ? 'environment' : 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
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
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            alert(
                "🔒 კამერაზე წვდომა უარყოფილია!\n\n" +
                "ვერიფიკაციის გასაგრძელებლად საჭიროა კამერის ჩართვა. გთხოვთ:\n" +
                "1. ბრაუზერის ზედა ზოლში დააწკაპუნეთ ბოქლომის ხატულას.\n" +
                "2. გასწვრივ ჩაურთეთ კამერის (Camera) უფლება.\n" +
                "3. განაახლეთ გვერდი და სცადეთ ხელახლა."
            );
        } else {
            alert("კამერის ინიციალიზაცია ვერ მოხერხდა.");
        }
        goToStep(1);
    }
}

// კამერის გათიშვა
function stopCamera(type) {
    if (streams[type]) {
        streams[type].getTracks().forEach(track => track.stop());
        streams[type] = null;
    }
}

// ფოტოს გადაღება (Canvas-ზე დახატვა)
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
        const nextBtn = document.getElementById('nextToStep3');
        if (nextBtn) nextBtn.disabled = false;
    } else {
        capturedImages.faceBase64 = dataURL;
        const submitBtn = document.getElementById('finalSubmitBtn');
        if (submitBtn) submitBtn.disabled = false;
    }
    
    video.style.display = 'none';
    preview.src = dataURL;
    preview.style.display = 'block';
}

// საბოლოო ვერიფიკაცია და რეგისტრაცია SUPABASE-ში
async function verifyAndRegister() {
    // დიაგნოსტიკა 1
    alert("📍 ნაბიჯი 1: რეგისტრაციის ღილაკს დაეჭირა!"); 

    const loadingBox = document.getElementById('ai-loading');
    if (loadingBox) loadingBox.style.display = 'block';

    // წამოვიღოთ მონაცემები ეკრანიდან
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // დიაგნოსტიკა 2
    alert("📍 ნაბიჯი 2: მონაცემები წავიკითხე: " + email); 

    try {
        // დიაგნოსტიკა 3
        alert("📍 ნაბიჯი 3: ვუერთდები Supabase-ს..."); 

        if (typeof supabase === 'undefined') {
            alert("❌ კრიტიკული შეცდომა: Supabase ბიბლიოთეკა საერთოდ არ არის ჩატვირთული საიტზე!");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });

        // დიაგნოსტიკა 4
        alert("📍 ნაბიჯი 4: პასუხი სერვერიდან მიღებულია!"); 

        if (error) {
            alert("❌ Supabase-ის შეცდომა: " + error.message);
        } else {
            alert("🎉 ბიომეტრიული რეგისტრაცია წარმატებით დასრულდა! მომხმარებელი შეიქმნა.");
            console.log("ახალი ID:", data.user?.id);
            
            // გადამისამართება (თუ register.html-ს index.html დაარქვი, ეს უბრალოდ გვერდს დაარეფრეშებს)
            window.location.href = "index.html"; 
        }
    } catch (err) {
        alert("❌ სისტემური Catch შეცდომა: " + err.message);
        console.error(err);
    } finally {
        if (loadingBox) loadingBox.style.display = 'none';
    }
}