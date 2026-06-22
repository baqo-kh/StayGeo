import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const IMGBB_API_KEY = "9db4c152a217facd1c03ef9c605af364";

document.addEventListener("DOMContentLoaded", async () => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html'; 
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const listingId = params.get('id');

    if (!listingId) {
        alert("რედაქტირების ID ვერ მოიძებნა!");
        window.location.href = 'my-listings.html'; 
        return;
    }

    const propertyTypeSelect = document.getElementById('propertyTypeSelect');
    const standardPriceBlock = document.getElementById('standardPriceBlock');
    const capacityBlock = document.getElementById('capacityBlock');
    const listPrice = document.getElementById('listPrice');
    const listCapacity = document.getElementById('listCapacity'); 
    
    const hotelRoomsBlock = document.getElementById('hotelRoomsBlock');
    const roomsContainer = document.getElementById('roomsContainer');
    const blockRoomContainer = document.getElementById('blockRoomContainer');
    const blockRoomSelect = document.getElementById('blockRoomSelect');

    let listingData = null;
    let blockedDates = [];
    let images = [];
    let mainPhotoIndex = 0; 
    const gallery = document.getElementById('imageGallery');

    try {
        const docRef = doc(db, "listings", listingId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert("განცხადება ბაზაში აღარ არსებობს.");
            window.location.href = 'my-listings.html'; 
            return;
        }

        listingData = docSnap.data();
        
        document.getElementById('listTitle').value = listingData.title || '';
        document.getElementById('listLocation').value = listingData.location || '';
        document.getElementById('listRooms').value = listingData.rooms || '';
        document.getElementById('listArea').value = listingData.area || '';
        document.getElementById('listDesc').value = listingData.description || '';
        propertyTypeSelect.value = listingData.propertyType || 'apartment';

        if (listingData.capacity) listCapacity.value = listingData.capacity;

        if (listingData.propertyType === 'hotel') {
            standardPriceBlock.style.display = 'none';
            capacityBlock.style.display = 'none';
            hotelRoomsBlock.style.display = 'block';
            blockRoomContainer.style.display = 'block';
            
            if (listingData.hotelRooms) {
                listingData.hotelRooms.forEach(room => {
                    createRoomRow(room.type, room.price);
                });
            }
        } else {
            standardPriceBlock.style.display = 'block';
            capacityBlock.style.display = 'block';
            listPrice.value = listingData.price || '';
            hotelRoomsBlock.style.display = 'none';
            blockRoomContainer.style.display = 'none';
        }

        document.querySelectorAll('input[name="amenity"]').forEach(cb => {
            if (listingData.amenities && listingData.amenities.includes(cb.value)) {
                cb.checked = true;
            }
        });

        if (listingData.meals) {
            if (listingData.meals.breakfast > 0) { document.getElementById('hasBreakfast').checked = true; document.getElementById('priceBreakfast').value = listingData.meals.breakfast; document.getElementById('priceBreakfast').disabled = false; }
            if (listingData.meals.halfBoard > 0) { document.getElementById('hasHalfBoard').checked = true; document.getElementById('priceHalfBoard').value = listingData.meals.halfBoard; document.getElementById('priceHalfBoard').disabled = false; }
            if (listingData.meals.fullBoard > 0) { document.getElementById('hasFullBoard').checked = true; document.getElementById('priceFullBoard').value = listingData.meals.fullBoard; document.getElementById('priceFullBoard').disabled = false; }
        }

        blockedDates = listingData.blockedDates || [];
        updateBlockRoomSelect();
        renderBlockedDates();

        images = listingData.images ? [...listingData.images] : [];
        renderGallery();

    } catch (error) {
        console.error(error);
        alert("მონაცემების ჩატვირთვა ვერ მოხერხდა.");
        return;
    }

    ['Breakfast', 'HalfBoard', 'FullBoard'].forEach(meal => {
        const cb = document.getElementById(`has${meal}`);
        const input = document.getElementById(`price${meal}`);
        cb.onchange = () => { 
            input.disabled = !cb.checked; 
            if(!cb.checked) input.value = ''; 
            else input.focus();
        };
    });

    function togglePropertyFields() {
        if (propertyTypeSelect.value === 'hotel') {
            standardPriceBlock.style.display = 'none';
            capacityBlock.style.display = 'none';
            hotelRoomsBlock.style.display = 'block';
            blockRoomContainer.style.display = 'block';
            if (roomsContainer.children.length === 0) createRoomRow('', '');
        } else {
            standardPriceBlock.style.display = 'block';
            capacityBlock.style.display = 'block';
            hotelRoomsBlock.style.display = 'none';
            blockRoomContainer.style.display = 'none';
        }
        updateBlockRoomSelect();
    }

    function createRoomRow(nameVal = '', priceVal = '') {
        const row = document.createElement('div');
        row.className = 'room-row';
        row.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
        
        row.innerHTML = `
            <input type="text" class="room-name" value="${nameVal}" placeholder="მაგ: 2 პერსონაზე" style="flex: 2; padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: #0b3127; color: white;">
            <input type="number" class="room-price" value="${priceVal}" placeholder="ფასი (₾)" style="flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: #0b3127; color: white;">
            <button type="button" class="remove-room-btn" style="background: #ff4d4d; color: white; border: none; border-radius: 6px; padding: 0 15px; cursor: pointer; font-weight: bold;">X</button>
        `;
        row.querySelector('.remove-room-btn').onclick = () => { row.remove(); updateBlockRoomSelect(); };
        row.querySelector('.room-name').oninput = updateBlockRoomSelect;
        roomsContainer.appendChild(row);
    }

    document.getElementById('addRoomBtn').onclick = () => { createRoomRow(); updateBlockRoomSelect(); };
    propertyTypeSelect.onchange = togglePropertyFields;

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

    async function uploadToImgBB(base64String) {
        if (base64String.startsWith('http')) return base64String; 
        
        const base64Data = base64String.split(',')[1]; 
        const formData = new FormData();
        formData.append('image', base64Data);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) return data.data.url;
        throw new Error("ფოტოს ატვირთვა ვერ მოხერხდა");
    }

    document.getElementById('editListingForm').onsubmit = async (e) => {
        e.preventDefault();
        
        const submitBtn = document.querySelector('.submit-btn') || document.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;

        if (images.length === 0) { 
            alert("გთხოვთ, ატვირთოთ მინიმუმ 1 ფოტო!"); 
            submitBtn.disabled = false;
            return; 
        }

        let finalImagesArray = [...images];
        if (mainPhotoIndex !== 0 && images.length > 1) {
            const mainImg = finalImagesArray.splice(mainPhotoIndex, 1)[0];
            finalImagesArray.unshift(mainImg);
        }

        const amenities = Array.from(document.querySelectorAll('input[name="amenity"]:checked')).map(cb => cb.value);
        const type = propertyTypeSelect.value;
        let finalPrice = 0;
        let finalCapacity = 0;
        let hotelRoomsData = [];

        if (type === 'hotel') {
            document.querySelectorAll('.room-row').forEach(row => {
                const name = row.querySelector('.room-name').value.trim();
                const price = parseInt(row.querySelector('.room-price').value) || 0;
                if (name && price > 0) hotelRoomsData.push({ type: name, price });
            });
            if (hotelRoomsData.length === 0) { 
                alert("გთხოვთ, დაამატოთ მინიმუმ 1 ოთახი და მიუთითოთ ფასი!"); 
                submitBtn.disabled = false;
                return; 
            }
            finalPrice = hotelRoomsData[0].price; 
        } else {
            finalPrice = parseInt(listPrice.value) || 0;
            finalCapacity = parseInt(listCapacity.value) || 0;
            
            if (finalCapacity <= 0) { alert("გთხოვთ, მიუთითოთ სტუმრების რაოდენობა!"); submitBtn.disabled = false; return; }
            if (finalPrice <= 0) { alert("გთხოვთ, მიუთითოთ ობიექტის ფასი!"); submitBtn.disabled = false; return; }
        }

        try {
            submitBtn.innerText = "ფოტოები მოწმდება ⏳...";
            let uploadedImageUrls = [];
            
            for (let i = 0; i < finalImagesArray.length; i++) {
                const imgUrl = await uploadToImgBB(finalImagesArray[i]);
                uploadedImageUrls.push(imgUrl);
            }

            submitBtn.innerText = "ინახება ბაზაში ⏳...";

            const listingRef = doc(db, "listings", listingId);
            await updateDoc(listingRef, {
                title: document.getElementById('listTitle').value,
                location: document.getElementById('listLocation').value,
                rooms: parseInt(document.getElementById('listRooms').value),
                area: parseInt(document.getElementById('listArea').value),
                description: document.getElementById('listDesc').value,
                propertyType: type,
                price: finalPrice,
                capacity: finalCapacity,
                hotelRooms: hotelRoomsData,
                blockedDates: blockedDates, 
                amenities: amenities,
                images: uploadedImageUrls,
                meals: {
                    breakfast: document.getElementById('hasBreakfast').checked ? parseInt(document.getElementById('priceBreakfast').value) || 0 : 0,
                    halfBoard: document.getElementById('hasHalfBoard').checked ? parseInt(document.getElementById('priceHalfBoard').value) || 0 : 0,
                    fullBoard: document.getElementById('hasFullBoard').checked ? parseInt(document.getElementById('priceFullBoard').value) || 0 : 0
                }
            });

            alert("✅ განცხადება წარმატებით განახლდა!");
            window.location.href = 'my-listings.html';

        } catch (error) {
            console.error(error);
            alert("შეცდომა განცხადების შენახვისას.");
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    };
});