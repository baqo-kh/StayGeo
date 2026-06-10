document.addEventListener("DOMContentLoaded", () => {
    // 🔒 1. უსაფრთხოება: ავტორიზაციის შემოწმება (მხოლოდ შესულმა იუზერმა უნდა შეძლოს რედაქტირება)
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // 2. ვამოწმებთ URL-ს და ID-ს
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (!id) {
        window.location.href = 'my-listings.html';
        return;
    }

    // 3. მოგვაქვს ბაზა და განცხადება
    let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
    const listingIndex = listings.findIndex(item => item.id === id);
    
    // თუ ID არასწორია ან განცხადება წაშლილია
    if (listingIndex === -1) {
        alert("განცხადება ვერ მოიძებნა!");
        window.location.href = 'my-listings.html';
        return;
    }

    const listing = listings[listingIndex];

    // 4. 🖼️ გალერეის ცვლადები
    const imageGallery = document.getElementById('imageGallery');
    const imageInput = document.getElementById('listImages');
    let uploadedImagesBase64 = listing.images ? [...listing.images] : [];
    let mainPhotoIndex = 0;

    // 5. ვავსებთ ველებს ძველი მონაცემებით
    const safeSetVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    safeSetVal('listTitle', listing.title || "");
    safeSetVal('listLocation', listing.location || "თბილისი");
    safeSetVal('listRooms', listing.rooms || "");
    safeSetVal('listArea', listing.area || "");
    safeSetVal('listPrice', listing.price || "");
    safeSetVal('listDesc', listing.description || "");

    // კეთილმოწყობის ჩექბოქსები
    if (listing.amenities && Array.isArray(listing.amenities)) {
        listing.amenities.forEach(savedItem => {
            let checkbox = document.querySelector(`input[type="checkbox"][name="amenity"][value="${savedItem}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // კვების ოპციები
    if (listing.meals) {
        const mealMap = [
            { checkId: 'hasBreakfast', inputId: 'priceBreakfast', value: listing.meals.breakfast },
            { checkId: 'hasHalfBoard', inputId: 'priceHalfBoard', value: listing.meals.halfBoard },
            { checkId: 'hasFullBoard', inputId: 'priceFullBoard', value: listing.meals.fullBoard }
        ];

        mealMap.forEach(meal => {
            const checkBox = document.getElementById(meal.checkId);
            const priceInput = document.getElementById(meal.inputId);

            if (checkBox && priceInput && meal.value > 0) {
                checkBox.checked = true;
                priceInput.disabled = false;
                priceInput.value = meal.value;
            }
        });
    }

    // 🏆 EVENT DELEGATION: გალერეის უსაფრთხო დაკლიკება
    if (imageGallery) {
        imageGallery.addEventListener('click', (e) => {
            // მთავარზე დაყენება
            if (e.target.classList.contains('set-main-btn')) {
                mainPhotoIndex = parseInt(e.target.getAttribute('data-index'));
                renderGallery();
            }

            // წაშლა
            if (e.target.classList.contains('remove-btn')) {
                const idx = parseInt(e.target.getAttribute('data-index'));
                uploadedImagesBase64.splice(idx, 1);

                if (idx === mainPhotoIndex) {
                    mainPhotoIndex = 0;
                } else if (idx < mainPhotoIndex) {
                    mainPhotoIndex--;
                }
                renderGallery();
            }
        });
    }

    // 6. 🖼️ გალერეის დახატვის ფუნქცია
    function renderGallery() {
        if (!imageGallery) return;
        imageGallery.innerHTML = '';

        if (mainPhotoIndex >= uploadedImagesBase64.length) {
            mainPhotoIndex = 0;
        }

        uploadedImagesBase64.forEach((base64Str, index) => {
            const isMain = index === mainPhotoIndex;
            const item = document.createElement('div');
            item.className = `img-thumb-box ${isMain ? 'main-photo' : ''}`;

            item.innerHTML = `
                <img src="${base64Str}" alt="photo-${index}">
                <button type="button" class="remove-btn" data-index="${index}" title="ფოტოს წაშლა">&times;</button>
                ${isMain ?
                    '<div class="main-badge">★ მთავარი</div>' :
                    `<button type="button" class="set-main-btn" data-index="${index}">მთავარზე დაყენება</button>`
                }
            `;
            imageGallery.appendChild(item);
        });
    }

    // 7. ახალი სურათების ატვირთვა და კომპრესია
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const MAX_WIDTH = 800;
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
            imageInput.value = '';
        });
    }

    renderGallery();

    // 8. ფორმის გაგზავნა (ცვლილებების შენახვა)
    const editForm = document.getElementById('editListingForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newAmenities = [];
            document.querySelectorAll('input[name="amenity"]:checked').forEach(cb => {
                newAmenities.push(cb.value);
            });

            if (uploadedImagesBase64.length === 0) {
                alert("გთხოვთ დატოვოთ ან ატვირთოთ მინიმუმ 1 ფოტო!");
                return;
            }

            // სურათების გადალაგება
            let finalImagesArray = [...uploadedImagesBase64];
            if (mainPhotoIndex !== 0 && uploadedImagesBase64.length > 1) {
                const mainImg = finalImagesArray.splice(mainPhotoIndex, 1)[0];
                finalImagesArray.unshift(mainImg);
            }

            // ვინახავთ ძველ ინფორმაციას (...listing) და ვაახლებთ მხოლოდ შეცვლილ ველებს
            listings[listingIndex] = {
                ...listing,
                title: document.getElementById('listTitle')?.value.trim() || listing.title,
                location: document.getElementById('listLocation')?.value || listing.location,
                rooms: parseInt(document.getElementById('listRooms')?.value) || listing.rooms,
                area: parseInt(document.getElementById('listArea')?.value) || listing.area,
                price: parseInt(document.getElementById('listPrice')?.value) || listing.price,
                description: document.getElementById('listDesc')?.value.trim() || listing.description,
                amenities: newAmenities,
                images: finalImagesArray,

                meals: {
                    breakfast: document.getElementById('hasBreakfast')?.checked ? parseInt(document.getElementById('priceBreakfast').value) || 0 : 0,
                    halfBoard: document.getElementById('hasHalfBoard')?.checked ? parseInt(document.getElementById('priceHalfBoard').value) || 0 : 0,
                    fullBoard: document.getElementById('hasFullBoard')?.checked ? parseInt(document.getElementById('priceFullBoard').value) || 0 : 0
                }
            };

            try {
                localStorage.setItem('staygeo_listings', JSON.stringify(listings));
                alert("✅ ცვლილებები წარმატებით შენახვა!");
                window.location.href = 'my-listings.html';
            } catch (err) {
                alert("❌ შეცდომა შენახვისას! მეხსიერება გადაივსო.");
                console.error(err);
            }
        });
    }
});