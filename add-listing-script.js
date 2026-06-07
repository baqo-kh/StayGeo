document.addEventListener("DOMContentLoaded", () => {
    // თუ შესული არ არის, მთავარზე ვაგდებთ
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const imageInput = document.getElementById('listImages');
    const imageGallery = document.getElementById('imageGallery');
    const hasMealsCheckbox = document.getElementById('hasMeals');
    const mealOptionsDiv = document.getElementById('mealOptions');
    
    let uploadedImagesBase64 = []; 
    let mainPhotoIndex = 0; // ნაგულისხმევად პირველი ატვირთული ფოტოა მთავარი

    // კვების გამოჩენა/დამალვა
    hasMealsCheckbox.addEventListener('change', (e) => {
        mealOptionsDiv.style.display = e.target.checked ? 'block' : 'none';
    });

    // სურათის ატვირთვა და კომპრესია
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
                    
                    const MAX_WIDTH = 800; // ვამცირებთ სიგანეს ბაზისთვის
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

    // გალერეის დახატვა
    function renderGallery() {
        imageGallery.innerHTML = '';
        
        if (mainPhotoIndex >= uploadedImagesBase64.length) {
            mainPhotoIndex = 0;
        }

        uploadedImagesBase64.forEach((base64, index) => {
            const isMain = index === mainPhotoIndex;
            const thumbBox = document.createElement('div');
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

        // წაშლის ლოგიკა
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indexToRemove = parseInt(e.target.getAttribute('data-index'));
                uploadedImagesBase64.splice(indexToRemove, 1);
                
                if (indexToRemove === mainPhotoIndex) {
                    mainPhotoIndex = 0;
                } else if (indexToRemove < mainPhotoIndex) {
                    mainPhotoIndex--; 
                }
                
                renderGallery(); 
            });
        });

        // "მთავარზე დაყენება"
        document.querySelectorAll('.set-main-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                mainPhotoIndex = parseInt(e.target.getAttribute('data-index'));
                renderGallery(); 
            });
        });
    }

    // ფორმის გაგზავნა
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

        // კვების მონაცემები
        let mealData = null;
        if (hasMealsCheckbox.checked) {
            const mPrice = document.getElementById('mealPrice').value;
            mealData = {
                type: document.getElementById('mealType').value,
                price: mPrice === "" || mPrice == 0 ? "შედის ფასში" : `${mPrice} ₾`
            };
        }

        // სურათების გადალაგება - მთავარი ფოტო პირველ ადგილას
        let finalImagesArray = [...uploadedImagesBase64];
        if (mainPhotoIndex !== 0 && uploadedImagesBase64.length > 1) {
            const mainImg = finalImagesArray.splice(mainPhotoIndex, 1)[0];
            finalImagesArray.unshift(mainImg); 
        }

        const newListing = {
            id: Date.now(),
            title: document.getElementById('listTitle').value,
            location: document.getElementById('listLocation').value,
            rooms: parseInt(document.getElementById('listRooms').value),
            area: parseInt(document.getElementById('listArea').value),
            price: parseInt(document.getElementById('listPrice').value),
            description: document.getElementById('listDesc').value,
            amenities: selectedAmenities,
            meals: mealData,
            images: finalImagesArray, 
            dateAdded: new Date().toISOString()
        };

        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        listings.push(newListing);
        
        try {
            localStorage.setItem('staygeo_listings', JSON.stringify(listings));
            alert("🎉 განცხადება წარმატებით დაემატა!");
            window.location.href = 'index.html';
        } catch (err) {
            alert("❌ შეცდომა შენახვისას! ბრაუზერის მეხსიერება გადაივსო.");
            console.error(err);
        }
    });
});