document.addEventListener("DOMContentLoaded", () => {
    // 1. ვიღებთ განცხადების ID-ს URL-დან (მაგ: details.html?id=171800000)
    const params = new URLSearchParams(window.location.search);
    const listingId = parseInt(params.get('id'));

    if (!listingId) {
        alert("განცხადება ვერ მოიძებნა!");
        window.location.href = 'index.html';
        return;
    }

    // 2. მოგვაქვს მონაცემთა ბაზა LocalStorage-დან
    const listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
    const listing = listings.find(item => item.id === listingId);

    if (!listing) {
        alert("განცხადება წაშლილია ან აღარ არსებობს.");
        window.location.href = 'index.html';
        return;
    }

    // 3. ავსებთ HTML ელემენტებს განცხადების მონაცემებით
    document.title = `StayGeo.ge - ${listing.title}`;
    document.getElementById('detailTitle').innerText = listing.title;
    document.getElementById('detailLocation').innerText = listing.location;
    document.getElementById('detailDesc').innerText = listing.description;
    document.getElementById('detailArea').innerText = `📏 ${listing.area} მ²`;
    document.getElementById('detailRooms').innerText = `🛏️ ${listing.rooms} ოთახი`;
    document.getElementById('detailPrice').innerText = `${listing.price}₾`;

    // 4. გალერეის დახატვა
    const mainImg = document.getElementById('detailMainImg');
    const thumbnailsContainer = document.getElementById('detailThumbnails');
    
    if (listing.images && listing.images.length > 0) {
        // პირველი ფოტო არის მთავარი
        mainImg.src = listing.images[0];

        // ვხატავთ პატარა ფოტოებს
        listing.images.forEach((imgBase64, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgBase64;
            thumb.alt = `ფოტო ${index + 1}`;
            
            // დაკლიკებისას მთავარი ფოტო იცვლება
            thumb.onclick = () => { mainImg.src = imgBase64; };
            
            thumbnailsContainer.appendChild(thumb);
        });
    }

    // 5. კეთილმოწყობის (Amenities) დახატვა
    const amenitiesContainer = document.getElementById('detailAmenities');
    if (listing.amenities && listing.amenities.length > 0) {
        listing.amenities.forEach(amenity => {
            const item = document.createElement('div');
            item.className = 'am-item';
            item.innerHTML = `✅ ${amenity}`;
            amenitiesContainer.appendChild(item);
        });
    } else {
        amenitiesContainer.innerHTML = '<span style="color:#666;">ინფორმაცია არ არის მითითებული</span>';
    }

    // 6. კვების ოპციების დამატება Select-ში
    const mealSelect = document.getElementById('mealSelect');
    if (listing.meals) {
        if (listing.meals.breakfast > 0) mealSelect.innerHTML += `<option value="${listing.meals.breakfast}">საუზმე - ${listing.meals.breakfast}₾</option>`;
        if (listing.meals.halfBoard > 0) mealSelect.innerHTML += `<option value="${listing.meals.halfBoard}">2-ჯერადი კვება - ${listing.meals.halfBoard}₾</option>`;
        if (listing.meals.fullBoard > 0) mealSelect.innerHTML += `<option value="${listing.meals.fullBoard}">3-ჯერადი კვება - ${listing.meals.fullBoard}₾</option>`;
    }

    // 7. 🧮 ფასის კალკულატორი
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const guestInput = document.getElementById('guestCount');

    // ვადგენთ დღევანდელ და ხვალინდელ თარიღებს დეფოლტად
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    checkInInput.value = today.toISOString().split('T')[0];
    checkOutInput.value = tomorrow.toISOString().split('T')[0];
    checkInInput.min = today.toISOString().split('T')[0];

    // კალკულაციის ფუნქცია
    function calculateTotal() {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        const guests = parseInt(guestInput.value) || 1;
        const mealPrice = parseInt(mealSelect.value) || 0;
        
        // ვიგებთ ღამეების რაოდენობას
        let nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (nights <= 0 || isNaN(nights)) nights = 1; // მინიმუმ 1 ღამე

        const basePriceTotal = listing.price * nights;
        const mealTotal = mealPrice * guests * nights;
        const grandTotal = basePriceTotal + mealTotal;

        // ვაახლებთ ტექსტებს ეკრანზე
        document.getElementById('calcRoom').innerText = `${listing.price} ₾ x ${nights} ღამე = ${basePriceTotal} ₾`;
        document.getElementById('calcMeal').innerText = `კვება: ${mealPrice} ₾ x ${guests} სტუმარი x ${nights} ღამე = ${mealTotal} ₾`;
        document.getElementById('totalPriceDisplay').innerText = `სულ გადასახდელი: ${grandTotal} ₾`;
    }

    // თუ თარიღი, სტუმარი ან კვება შეიცვლება, თავიდან დაითვალოს
    checkInInput.addEventListener('change', () => {
        // არ მივცეთ უფლება გასვლის თარიღი შესვლისაზე ადრე იყოს
        checkOutInput.min = checkInInput.value;
        if (checkOutInput.value <= checkInInput.value) {
            let nextDay = new Date(checkInInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.value = nextDay.toISOString().split('T')[0];
        }
        calculateTotal();
    });
    
    checkOutInput.addEventListener('change', calculateTotal);
    guestInput.addEventListener('input', calculateTotal);
    mealSelect.addEventListener('change', calculateTotal);

    // პირველადი დათვლა
    calculateTotal();
});