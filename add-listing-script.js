document.addEventListener("DOMContentLoaded", () => {
    // 1. ავტორიზაციის შემოწმება
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const imageInput = document.getElementById('listImages');
    const imageGallery = document.getElementById('imageGallery');
    
    let uploadedImagesBase64 = []; 
    let mainPhotoIndex = 0; // ნაგულისხმევად პირველი ფოტოა მთავარი

    // 🏆 EVENT DELEGATION: კლიკების მართვა მთლიან გალერეაზე
    imageGallery.addEventListener('click', (e) => {
        // 1. თუ დააკლიკა "მთავარზე დაყენებას"
        if (e.target.classList.contains('set-main-btn')) {
            mainPhotoIndex = parseInt(e.target.getAttribute('data-index'));
            renderGallery();
        }
        
        // 2. თუ დააკლიკა "წაშლას"
        if (e.target.classList.contains('remove-btn')) {
            const idx = parseInt(e.target.getAttribute('data-index'));
            uploadedImagesBase64.splice(idx, 1);
            
            // ვასწორებთ მთავარი ფოტოს ინდექსს წაშლის შემდეგ
            if (idx === mainPhotoIndex) {
                mainPhotoIndex = 0;
            } else if (idx < mainPhotoIndex) {
                mainPhotoIndex--; 
            }
            renderGallery();
        }
    });

    // 2. სურათის ატვირთვა და კომპრესია (ჭკვიანი კომპრესორი)
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const MAX_WIDTH = 800; // ვამცირებთ ზომას ბაზისთვის
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    
                    uploadedImagesBase64.push(compressedBase64);
                    renderGallery();
                }
            };
            reader.readAsDataURL(file);
        });
        
        imageInput.value = ''; // ვასუფთავებთ ინპუტს
    });

    // 3. გალერეის დახატვა
    function renderGallery() {
        imageGallery.innerHTML = '';
        
        // უსაფრთხოების შემოწმება, ID არ გავიდეს მასივიდან
        if (mainPhotoIndex >= uploadedImagesBase64.length) {
            mainPhotoIndex = 0;
        }

        uploadedImagesBase64.forEach((base64, index) => {
            const isMain = index === mainPhotoIndex;
            const thumbBox = document.createElement('div');
            // 'main-photo' კლასი უმატებს ყვითელ ჩარჩოს და ჩრდილს
            thumbBox.className = `img-thumb-box ${isMain ? 'main-photo' : ''}`;
            
            thumbBox.innerHTML = `
                <img src="${base64}" alt="Upload preview">
                <button type="button" class="remove-btn" data-index="${index}" title="ფოტოს წაშლა">&times;</button>
                ${isMain ? 
                    '<div class="main-badge">★ მთავარი</div>' : 
                    `<button type="button" class="set-main-btn" data-index="${index}">მთავარზე დაყენება</button>`
                }
            `;
            imageGallery.appendChild(thumbBox);
        });
    }

    // 4. ფორმის გაგზავნა (Submitting the form)
    document.getElementById('addListingForm').addEventListener('submit', (e) => {
        e.preventDefault();

        if (uploadedImagesBase64.length === 0) {
            alert("გთხოვთ, ატვირთოთ მინიმუმ 1 სურათი.");
            return;
        }

        // ჩექბოქსების შეგროვება
        const selectedAmenities = [];
        document.querySelectorAll('input[name="amenity"]:checked').forEach(checkbox => {
            selectedAmenities.push(checkbox.value);
        });

        // 🔄 სურათების გადალაგება: მთავარი ფოტო ყოველთვის პირველ ადგილზე
        let finalImagesArray = [...uploadedImagesBase64];
        if (mainPhotoIndex !== 0 && uploadedImagesBase64.length > 1) {
            // ვიღებთ მთავარ ფოტოს
            const mainImg = finalImagesArray.splice(mainPhotoIndex, 1)[0];
            // ჩავსვამთ მასივის დასაწყისში
            finalImagesArray.unshift(mainImg); 
        }

        // ობიექტის შექმნა
        const newListing = {
            id: Date.now(),
            title: document.getElementById('listTitle').value.trim(),
            location: document.getElementById('listLocation').value,
            rooms: parseInt(document.getElementById('listRooms').value) || 0,
            area: parseInt(document.getElementById('listArea').value) || 0,
            price: parseInt(document.getElementById('listPrice').value) || 0,
            description: document.getElementById('listDesc').value.trim(),
            amenities: selectedAmenities,
            
            // 🍽️ ახალი კვების ობიექტი
            meals: {
                breakfast: document.getElementById('hasBreakfast')?.checked ? (parseInt(document.getElementById('priceBreakfast').value) || 0) : 0,
                halfBoard: document.getElementById('hasHalfBoard')?.checked ? (parseInt(document.getElementById('priceHalfBoard').value) || 0) : 0,
                fullBoard: document.getElementById('hasFullBoard')?.checked ? (parseInt(document.getElementById('priceFullBoard').value) || 0) : 0
            },
            
            images: finalImagesArray, 
            dateAdded: new Date().toISOString()
        };

        // ბაზაში შენახვა
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        listings.push(newListing);
        
        try {
            localStorage.setItem('staygeo_listings', JSON.stringify(listings));
            alert("🎉 განცხადება წარმატებით დაემატა!");
            window.location.href = 'index.html'; // გადამისამართება მთავარზე
        } catch (err) {
            alert("❌ შეცდომა შენახვისას! ბრაუზერის მეხსიერება გადაივსო.");
            console.error(err);
        }
    });
});