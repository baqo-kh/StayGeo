document.addEventListener("DOMContentLoaded", () => {
    // 1. უსაფრთხოება: თუ შესული არ არის, მთავარზე ვაგდებთ
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const imageInput = document.getElementById('listImages');
    const imageGallery = document.getElementById('imageGallery');
    const hasMealsCheckbox = document.getElementById('hasMeals');
    const mealOptionsDiv = document.getElementById('mealOptions');
    
    let uploadedImagesBase64 = []; // აქ შევინახავთ მრავალ სურათს

    // 2. კვების სექციის გამოჩენა / დამალვა ლოგიკა
    hasMealsCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            mealOptionsDiv.style.display = 'block';
        } else {
            mealOptionsDiv.style.display = 'none';
        }
    });

    // 3. მრავალი სურათის ატვირთვა და ავტომატური კომპრესია
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                // ვქმნით იმიჯს, რომ შევამციროთ მისი ზომა (კომპრესია localStorage-სთვის)
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // მაქსიმალური სიგანე 800px-მდე ვამცირებთ
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // ვაქცევთ JPEG-ად 70% ხარისხით
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    
                    // ვამატებთ მასივში
                    uploadedImagesBase64.push(compressedBase64);
                    renderGallery();
                }
            };
            reader.readAsDataURL(file);
        });
        
        // ვასუფთავებთ ინპუტს, რომ იგივე სურათი კიდევ შეიძლებოდეს აიტვირთოს
        imageInput.value = ''; 
    });

    // გალერეის დახატვა და წაშლის ლოგიკა
    function renderGallery() {
        imageGallery.innerHTML = '';
        uploadedImagesBase64.forEach((base64, index) => {
            const thumbBox = document.createElement('div');
            thumbBox.className = 'img-thumb-box';
            
            thumbBox.innerHTML = `
                <img src="${base64}" alt="Upload preview">
                <button type="button" class="remove-btn" data-index="${index}">&times;</button>
            `;
            imageGallery.appendChild(thumbBox);
        });

        // წაშლის ღილაკებზე ივენთის მიბმა
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indexToRemove = e.target.getAttribute('data-index');
                uploadedImagesBase64.splice(indexToRemove, 1); // შლის მასივიდან
                renderGallery(); // თავიდან ხატავს
            });
        });
    }

    // 4. ფორმის გაგზავნა და ყველა მონაცემის შენახვა
    document.getElementById('addListingForm').addEventListener('submit', (e) => {
        e.preventDefault();

        if (uploadedImagesBase64.length === 0) {
            alert("გთხოვთ, ატვირთოთ მინიმუმ 1 სურათი.");
            return;
        }

        // ვაგროვებთ ყველა მონიშნულ ჩექბოქსს კეთილმოწყობიდან
        const selectedAmenities = [];
        document.querySelectorAll('input[name="amenity"]:checked').forEach(checkbox => {
            selectedAmenities.push(checkbox.value);
        });

        // კვების მონაცემების აღება
        let mealData = null;
        if (hasMealsCheckbox.checked) {
            const mPrice = document.getElementById('mealPrice').value;
            mealData = {
                type: document.getElementById('mealType').value,
                price: mPrice === "" || mPrice == 0 ? "შედის ფასში" : `${mPrice} ₾`
            };
        }

        // ვქმნით მთავარ ობიექტს
        const newListing = {
            id: Date.now(), // უნიკალური ID
            title: document.getElementById('listTitle').value,
            location: document.getElementById('listLocation').value,
            rooms: parseInt(document.getElementById('listRooms').value),
            area: parseInt(document.getElementById('listArea').value),
            price: parseInt(document.getElementById('listPrice').value),
            description: document.getElementById('listDesc').value,
            amenities: selectedAmenities, // მასივი
            meals: mealData, // ობიექტი ან null
            images: uploadedImagesBase64, // მრავალი სურათის მასივი
            dateAdded: new Date().toISOString()
        };

        // ვიღებთ ძველ განცხადებებს ან ვქმნით ცარიელ სიას
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        
        // ვამატებთ ახალს სიაში
        listings.push(newListing);
        
        // ვაბრუნებთ შენახულ სიას ბრაუზერის მეხსიერებაში
        try {
            localStorage.setItem('staygeo_listings', JSON.stringify(listings));
            alert("🎉 განცხადება წარმატებით დაემატა!");
            window.location.href = 'index.html';
        } catch (err) {
            alert("❌ შეცდომა შენახვისას! ბრაუზერის მეხსიერება გადაივსო. სცადეთ ნაკლები სურათის ატვირთვა.");
            console.error(err);
        }
    });
});