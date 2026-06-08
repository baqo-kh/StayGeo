document.addEventListener("DOMContentLoaded", () => {
    // 1. ვამოწმებთ URL-ს და ვიღებთ ID-ს
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    
    // 2. მოგვაქვს ბაზა და ვპოულობთ ჩვენს განცხადებას
    let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
    const listingIndex = listings.findIndex(item => item.id === id);
    const listing = listings[listingIndex];

    if (!listing) {
        alert("განცხადება ვერ მოიძებნა!");
        window.location.href = 'my-listings.html';
        return;
    }

    // 3. გლობალური მასივი სურათებისთვის (თავიდან ვტვირთავთ ძველ სურათებს)
    let uploadedImagesBase64 = listing.images ? [...listing.images] : [];
    const imageGallery = document.getElementById('imageGallery');
    const imageInput = document.getElementById('listImages');

    // 4. ვავსებთ ველებს ძველი მონაცემებით
    document.getElementById('listTitle').value = listing.title || "";
    document.getElementById('listLocation').value = listing.location || "თბილისი";
    document.getElementById('listRooms').value = listing.rooms || "";
    document.getElementById('listArea').value = listing.area || "";
    document.getElementById('listPrice').value = listing.price || "";
    document.getElementById('listDesc').value = listing.description || "";

    // 5. ვავსებთ კეთილმოწყობის ჩექბოქსებს (განახლებული, ჭკვიანი ძებნა)
    if (listing.amenities) {
        // ვამოწმებთ მასივია თუ არა (რომ შეცდომა არ ამოაგდოს)
        let savedAmenities = Array.isArray(listing.amenities) ? listing.amenities : [listing.amenities];
        
        savedAmenities.forEach(savedItem => {
            // ვეძებთ ჩექბოქსს ზუსტად მისი value-თ (name-ს უკვე აღარ აქვს მნიშვნელობა)
            let checkbox = document.querySelector(`input[type="checkbox"][value="${savedItem}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    // 6. სურათების გალერეის დახატვის ფუნქცია
    function renderGallery() {
        imageGallery.innerHTML = ''; // ვასუფთავებთ
        
        uploadedImagesBase64.forEach((base64Str, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            item.innerHTML = `
                <img src="${base64Str}" alt="photo-${index}">
                <button type="button" class="delete-img-btn" data-index="${index}">✖</button>
            `;
            imageGallery.appendChild(item);
        });

        // წაშლის ღილაკებზე ივენთების მიბმა
        document.querySelectorAll('.delete-img-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                uploadedImagesBase64.splice(idx, 1); // ვაგდებთ მასივიდან
                renderGallery(); // თავიდან ვხატავთ
            });
        });
    }

    // 7. ახალი სურათების არჩევის ლოგიკა
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImagesBase64.push(event.target.result);
                renderGallery();
            };
            reader.readAsDataURL(file);
        });
        
        // ველს ვასუფთავებთ, რომ იგივე სურათი კიდევ აიტვირთოს საჭიროებისას
        imageInput.value = ''; 
    });

    // საწყისი გალერეის დახატვა
    renderGallery();

    // 8. ფორმის გაგზავნა (შენახვა)
    document.getElementById('editListingForm').addEventListener('submit', (e) => {
        e.preventDefault();

        // ვაგროვებთ კეთილმოწყობას
        const newAmenities = [];
        document.querySelectorAll('input[name="amenity"]:checked').forEach(cb => {
            newAmenities.push(cb.value);
        });

        // ვამოწმებთ, რომ 1 სურათი მაინც იყოს ატვირთული
        if (uploadedImagesBase64.length === 0) {
            alert("გთხოვთ დატოვოთ ან ატვირთოთ მინიმუმ 1 ფოტო!");
            return;
        }

        // ვაახლებთ ობიექტს
        listings[listingIndex] = {
            ...listing, // ვტოვებთ ძველ id-ს და ა.შ.
            title: document.getElementById('listTitle').value.trim(),
            location: document.getElementById('listLocation').value,
            rooms: parseInt(document.getElementById('listRooms').value),
            area: parseInt(document.getElementById('listArea').value),
            price: parseInt(document.getElementById('listPrice').value),
            description: document.getElementById('listDesc').value.trim(),
            amenities: newAmenities,
            images: uploadedImagesBase64 // ვინახავთ განახლებულ სურათებს
        };

        // ვინახავთ ლოკალ სტორაჯში
        localStorage.setItem('staygeo_listings', JSON.stringify(listings));
        
        alert("✅ განცხადება წარმატებით განახლდა!");
        window.location.href = 'my-listings.html';
    });
});