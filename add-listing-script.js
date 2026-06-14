document.addEventListener("DOMContentLoaded", () => {
    // უსაფრთხოება
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html'; return;
    }

    // ----------------------------------------------------
    // 🏨 ქონების ტიპის ლოგიკა
    // ----------------------------------------------------
    const propertyTypeSelect = document.getElementById('propertyTypeSelect');
    const standardPriceBlock = document.getElementById('standardPriceBlock');
    const listPrice = document.getElementById('listPrice');
    const hotelRoomsBlock = document.getElementById('hotelRoomsBlock');
    const roomsContainer = document.getElementById('roomsContainer');
    const blockRoomContainer = document.getElementById('blockRoomContainer');
    const blockRoomSelect = document.getElementById('blockRoomSelect');

    function togglePropertyFields() {
        if (propertyTypeSelect.value === 'hotel') {
            standardPriceBlock.style.display = 'none';
            hotelRoomsBlock.style.display = 'block';
            blockRoomContainer.style.display = 'block';
        } else {
            standardPriceBlock.style.display = 'block';
            hotelRoomsBlock.style.display = 'none';
            blockRoomContainer.style.display = 'none';
        }
        updateBlockRoomSelect();
    }

    function createRoomRow() {
        const row = document.createElement('div');
        row.className = 'room-row';
        row.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
        
        // ⚡ აქედან ამოღებულია required, რომ დამატების ღილაკი არ გაჭედოს!
        row.innerHTML = `
            <input type="text" class="room-name" placeholder="მაგ: 2 პერსონაზე" style="flex: 2; padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: #0b3127; color: white;">
            <input type="number" class="room-price" placeholder="ფასი (₾)" style="flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: #0b3127; color: white;">
            <button type="button" class="remove-room-btn" style="background: #ff4d4d; color: white; border: none; border-radius: 6px; padding: 0 15px; cursor: pointer; font-weight: bold;">X</button>
        `;
        row.querySelector('.remove-room-btn').onclick = () => { row.remove(); updateBlockRoomSelect(); };
        row.querySelector('.room-name').oninput = updateBlockRoomSelect;
        roomsContainer.appendChild(row);
    }

    document.getElementById('addRoomBtn').onclick = () => { createRoomRow(); updateBlockRoomSelect(); };
    propertyTypeSelect.onchange = togglePropertyFields;
    createRoomRow(); // საწყისად 1 ცარიელი ოთახი
    togglePropertyFields();

    // ----------------------------------------------------
    // 📅 კალენდრის მართვა (ჩაკეტილი დღეები)
    // ----------------------------------------------------
    let blockedDates = [];

    function updateBlockRoomSelect() {
        blockRoomSelect.innerHTML = '<option value="all">მთლიანი ობიექტი</option>';
        if (propertyTypeSelect.value === 'hotel') {
            document.querySelectorAll('.room-name').forEach((input, index) => {
                const val = input.value.trim();
                const displayName = val === '' ? `ოთახი ${index + 1}` : val;
                blockRoomSelect.innerHTML += `<option value="${displayName}">მხოლოდ: ${displayName}</option>`;
            });
        }
    }

    function renderBlockedDates() {
        const list = document.getElementById('blockedDatesList');
        list.innerHTML = '';
        blockedDates.forEach((block, idx) => {
            const tag = document.createElement('div');
            tag.style.cssText = 'background: #ffebee; border: 1px solid #ffcdd2; color: #b71c1c; padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 13px;';
            const roomText = block.room === 'all' ? 'მთლიანი ობიექტი' : `ოთახი: ${block.room}`;
            tag.innerHTML = `<span><strong>${roomText}</strong> | ${block.start} ➔ ${block.end}</span>
                             <button type="button" style="background: none; border: none; color: red; font-weight: bold; cursor:pointer;">X</button>`;
            tag.querySelector('button').onclick = () => { blockedDates.splice(idx, 1); renderBlockedDates(); };
            list.appendChild(tag);
        });
    }

    document.getElementById('addBlockBtn').onclick = () => {
        const start = document.getElementById('blockStartDate').value;
        const end = document.getElementById('blockEndDate').value;
        const room = propertyTypeSelect.value === 'hotel' ? blockRoomSelect.value : 'all';

        if (!start || !end || new Date(start) >= new Date(end)) {
            alert("გთხოვთ შეიყვანოთ სწორი თარიღები!"); return;
        }
        blockedDates.push({ room, start, end });
        renderBlockedDates();
        document.getElementById('blockStartDate').value = '';
        document.getElementById('blockEndDate').value = '';
    };

    // ----------------------------------------------------
    // 🍽️ კვების ოპციები
    // ----------------------------------------------------
    ['Breakfast', 'HalfBoard', 'FullBoard'].forEach(meal => {
        const cb = document.getElementById(`has${meal}`);
        const input = document.getElementById(`price${meal}`);
        cb.onchange = () => { 
            input.disabled = !cb.checked; 
            if(!cb.checked) input.value = ''; 
            else input.focus();
        };
    });

    // ----------------------------------------------------
    // 🖼️ გალერეა 
    // ----------------------------------------------------
    let images = [];
    let mainPhotoIndex = 0; 
    const gallery = document.getElementById('imageGallery');
    
    function renderGallery() {
        gallery.innerHTML = '';
        if (mainPhotoIndex >= images.length) mainPhotoIndex = 0;

        images.forEach((src, i) => {
            const isMain = i === mainPhotoIndex;
            const div = document.createElement('div');
            div.className = `img-thumb-box ${isMain ? 'main-photo' : ''}`;
            
            div.innerHTML = `
                <img src="${src}">
                <button type="button" class="remove-btn" data-index="${i}">X</button>
                ${isMain ? 
                    '<div class="main-badge">★ მთავარი</div>' : 
                    `<button type="button" class="set-main-btn" data-index="${i}">მთავარზე</button>`
                }
            `;
            gallery.appendChild(div);
        });
    }

    gallery.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const idx = parseInt(e.target.getAttribute('data-index'));
            images.splice(idx, 1);
            if (idx === mainPhotoIndex) mainPhotoIndex = 0;
            else if (idx < mainPhotoIndex) mainPhotoIndex--;
            renderGallery();
        }
        if (e.target.classList.contains('set-main-btn')) {
            mainPhotoIndex = parseInt(e.target.getAttribute('data-index'));
            renderGallery();
        }
    });

    document.getElementById('listImages').onchange = (e) => {
        Array.from(e.target.files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (ev) => { images.push(ev.target.result); renderGallery(); };
            reader.readAsDataURL(file);
        });
        e.target.value = ''; 
    };

    // ----------------------------------------------------
    // 💾 ბაზაში შენახვა (Submit)
    // ----------------------------------------------------
    document.getElementById('addListingForm').onsubmit = (e) => {
        e.preventDefault();
        
        // JS აკონტროლებს რომ სურათები ნამდვილად იყოს ატვირთული
        if (images.length === 0) { alert("გთხოვთ, ატვირთოთ მინიმუმ 1 ფოტო!"); return; }

        let finalImagesArray = [...images];
        if (mainPhotoIndex !== 0 && images.length > 1) {
            const mainImg = finalImagesArray.splice(mainPhotoIndex, 1)[0];
            finalImagesArray.unshift(mainImg);
        }

        const amenities = Array.from(document.querySelectorAll('input[name="amenity"]:checked')).map(cb => cb.value);
        
        const type = propertyTypeSelect.value;
        let finalPrice = 0;
        let hotelRoomsData = [];

        // ოთახების და ფასის ვალიდაცია JS-ში
        if (type === 'hotel') {
            document.querySelectorAll('.room-row').forEach(row => {
                const name = row.querySelector('.room-name').value.trim();
                const price = parseInt(row.querySelector('.room-price').value) || 0;
                if (name && price > 0) hotelRoomsData.push({ type: name, price });
            });
            if (hotelRoomsData.length === 0) { alert("გთხოვთ, დაამატოთ მინიმუმ 1 სასტუმროს ოთახი და მიუთითოთ ფასი!"); return; }
            finalPrice = hotelRoomsData[0].price; 
        } else {
            finalPrice = parseInt(listPrice.value) || 0;
            if (finalPrice <= 0) { alert("გთხოვთ, მიუთითოთ ობიექტის ფასი 1 ღამეში!"); return; }
        }

        const newListing = {
            id: Date.now(),
            title: document.getElementById('listTitle').value,
            location: document.getElementById('listLocation').value,
            rooms: parseInt(document.getElementById('listRooms').value),
            area: parseInt(document.getElementById('listArea').value),
            description: document.getElementById('listDesc').value,
            propertyType: type,
            price: finalPrice,
            hotelRooms: hotelRoomsData,
            blockedDates: blockedDates, 
            amenities: amenities,
            images: finalImagesArray,
            meals: {
                breakfast: document.getElementById('hasBreakfast').checked ? parseInt(document.getElementById('priceBreakfast').value) || 0 : 0,
                halfBoard: document.getElementById('hasHalfBoard').checked ? parseInt(document.getElementById('priceHalfBoard').value) || 0 : 0,
                fullBoard: document.getElementById('hasFullBoard').checked ? parseInt(document.getElementById('priceFullBoard').value) || 0 : 0
            }
        };

        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        listings.push(newListing);
        localStorage.setItem('staygeo_listings', JSON.stringify(listings));

        alert("✅ განცხადება წარმატებით დაემატა!");
        window.location.href = 'my-listings.html';
    };
});