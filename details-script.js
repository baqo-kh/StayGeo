document.addEventListener("DOMContentLoaded", () => {
    // 1. მონაცემების მიღება
    const params = new URLSearchParams(window.location.search);
    const listingId = parseInt(params.get('id'));

    if (!listingId) {
        alert("განცხადება ვერ მოიძებნა!");
        window.location.href = 'index.html';
        return;
    }

    const listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
    const listing = listings.find(item => item.id === listingId);

    if (!listing) {
        alert("განცხადება წაშლილია ან აღარ არსებობს.");
        window.location.href = 'index.html';
        return;
    }

    // 2. HTML ველების შევსება
    document.title = `StayGeo.ge - ${listing.title}`;
    document.getElementById('detailTitle').innerText = listing.title;
    document.getElementById('detailLocation').innerText = listing.location;
    document.getElementById('detailDesc').innerText = listing.description;
    document.getElementById('detailArea').innerText = `📏 ${listing.area} მ²`;
    document.getElementById('detailRooms').innerText = `🛏️ ${listing.rooms} ოთახი`;

    // -----------------------------------------------------------
    // 🏨 3. ქონების ტიპი, ოთახები და ფასები
    // -----------------------------------------------------------
    let currentBasePrice = listing.price || 0; 
    const roomTypeGroup = document.getElementById('roomTypeGroup');
    const bookingRoomSelect = document.getElementById('bookingRoomSelect');
    const detailPriceDisplay = document.getElementById('detailPrice');

    if (listing.propertyType === 'hotel' && listing.hotelRooms && listing.hotelRooms.length > 0) {
        roomTypeGroup.style.display = 'block';
        bookingRoomSelect.innerHTML = ''; 
        
        listing.hotelRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.type; // სახელი ჭირდება კალენდარს
            option.dataset.price = room.price; // ფასი ჭირდება კალკულატორს
            option.innerText = `${room.type} - ${room.price}₾`;
            bookingRoomSelect.appendChild(option);
        });

        currentBasePrice = parseInt(listing.hotelRooms[0].price);

        bookingRoomSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            currentBasePrice = parseInt(selectedOption.dataset.price) || 0;
            detailPriceDisplay.innerText = `${currentBasePrice}₾`;
            initCalendars(); // ⚡ ოთახის შეცვლისას კალენდარი ახლდება
            calculateTotal(); 
        });
    } else {
        roomTypeGroup.style.display = 'none';
        currentBasePrice = listing.price || 0;
    }

    detailPriceDisplay.innerText = `${currentBasePrice}₾`;

    // -----------------------------------------------------------
    // 📅 4. Flatpickr კალენდრის ლოგიკა (დღეების გაწითლება)
    // -----------------------------------------------------------
    let ciPicker, coPicker;

    function getDisabledDates() {
        const selectedRoom = (listing.propertyType === 'hotel') ? bookingRoomSelect.value : 'all';
        const disabled = [];
        
        if (listing.blockedDates) {
            listing.blockedDates.forEach(block => {
                // ვთიშავთ თუ მთლიანი ობიექტია ჩაკეტილი, ან ზუსტად ეს არჩეული ოთახი
                if (block.room === 'all' || block.room === selectedRoom) {
                    disabled.push({
                        from: block.start,
                        to: block.end
                    });
                }
            });
        }
        return disabled;
    }

    function initCalendars() {
        const disabledDatesList = getDisabledDates();
        
        if (ciPicker) ciPicker.destroy();
        if (coPicker) coPicker.destroy();

        ciPicker = flatpickr("#checkIn", {
            locale: "ka",
            minDate: "today",
            disable: disabledDatesList,
            onChange: function(selectedDates, dateStr) {
                if (coPicker) {
                    coPicker.set('minDate', dateStr);
                    // თუ გასვლის თარიღი შემოსვლაზე ადრეა დარჩენილი, ავტომატურად ვწევთ 1 დღით წინ
                    if (!coPicker.selectedDates[0] || coPicker.selectedDates[0] <= selectedDates[0]) {
                        const nextDay = new Date(selectedDates[0]);
                        nextDay.setDate(nextDay.getDate() + 1);
                        coPicker.setDate(nextDay);
                    }
                }
                calculateTotal();
            }
        });

        coPicker = flatpickr("#checkOut", {
            locale: "ka",
            minDate: document.getElementById('checkIn').value || new Date().fp_incr(1),
            disable: disabledDatesList,
            onChange: calculateTotal
        });
    }

    initCalendars(); // საწყისი გაშვება

    // -----------------------------------------------------------
    // 5. გალერეა, კეთილმოწყობა და კვება
    // -----------------------------------------------------------
    const mainImg = document.getElementById('detailMainImg');
    const thumbnailsContainer = document.getElementById('detailThumbnails');
    if (listing.images && listing.images.length > 0) {
        mainImg.src = listing.images[0];
        listing.images.forEach((src, idx) => {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.onclick = () => { mainImg.src = src; };
            thumbnailsContainer.appendChild(thumb);
        });
    }

    const amenitiesContainer = document.getElementById('detailAmenities');
    if (listing.amenities && listing.amenities.length > 0) {
        listing.amenities.forEach(am => {
            const div = document.createElement('div');
            div.className = 'am-item';
            div.innerHTML = `✅ ${am}`;
            amenitiesContainer.appendChild(div);
        });
    }

    const mealSelect = document.getElementById('mealSelect');
    if (listing.meals) {
        if (listing.meals.breakfast > 0) mealSelect.innerHTML += `<option value="${listing.meals.breakfast}">საუზმე - ${listing.meals.breakfast}₾</option>`;
        if (listing.meals.halfBoard > 0) mealSelect.innerHTML += `<option value="${listing.meals.halfBoard}">2-ჯერადი კვება - ${listing.meals.halfBoard}₾</option>`;
        if (listing.meals.fullBoard > 0) mealSelect.innerHTML += `<option value="${listing.meals.fullBoard}">3-ჯერადი კვება - ${listing.meals.fullBoard}₾</option>`;
    }

    // -----------------------------------------------------------
    // 🧮 6. ფასის კალკულატორი
    // -----------------------------------------------------------
    function calculateTotal() {
        const ciVal = document.getElementById('checkIn').value;
        const coVal = document.getElementById('checkOut').value;
        
        let nights = 1;
        if (ciVal && coVal) {
            nights = Math.ceil((new Date(coVal) - new Date(ciVal)) / (1000 * 60 * 60 * 24));
            if (nights <= 0 || isNaN(nights)) nights = 1; 
        }

        const guests = parseInt(document.getElementById('guestCount').value) || 1;
        const mealPrice = parseInt(mealSelect.value) || 0;
        
        const basePriceTotal = currentBasePrice * nights;
        const mealTotal = mealPrice * guests * nights;
        const grandTotal = basePriceTotal + mealTotal;

        document.getElementById('calcRoom').innerText = `${currentBasePrice} ₾ x ${nights} ღამე = ${basePriceTotal} ₾`;
        document.getElementById('calcMeal').innerText = `კვება: ${mealPrice} ₾ x ${guests} სტუმარი x ${nights} ღამე = ${mealTotal} ₾`;
        document.getElementById('totalPriceDisplay').innerText = `სულ გადასახდელი: ${grandTotal} ₾`;
    }

    document.getElementById('guestCount').addEventListener('input', calculateTotal);
    mealSelect.addEventListener('change', calculateTotal);

    // -----------------------------------------------------------
    // 💳 7. გადახდის მოდალი (10% დეპოზიტი)
    // -----------------------------------------------------------
    const successModal = document.getElementById('successModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModalBtn');

    function showBookingModal() {
        const checkIn = document.getElementById('checkIn').value;
        const checkOut = document.getElementById('checkOut').value;
        
        if (!checkIn || !checkOut) {
            alert("გთხოვთ აირჩიოთ თარიღები კალენდარში.");
            return;
        }

        const grandTotalStr = document.getElementById('totalPriceDisplay').innerText;
        const grandTotal = parseInt(grandTotalStr.replace(/\D/g, '')) || 0; 
        
        const advancePayment = Math.round(grandTotal * 0.10); 
        const payToHost = grandTotal - advancePayment; 
        const bookingID = "SG-" + Math.floor(1000 + Math.random() * 9000);

        modalContent.innerHTML = `
            <div style="text-align: left;">
                <p style="margin-bottom: 8px;"><strong>ჯავშნის N:</strong> <span style="color: #0b3127; font-weight: bold;">${bookingID}</span></p>
                <p style="margin-bottom: 8px;"><strong>თარიღი:</strong> ${checkIn} / ${checkOut}</p>
                <p style="margin-bottom: 8px;"><strong>ჯამური ღირებულება:</strong> ${grandTotal} ₾</p>
                
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ddd;">
                
                <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #c8e6c9;">
                    <p style="color: #0b3127; font-weight: bold; font-size: 16px; margin-bottom: 5px;">💳 წინასწარი გადახდა (10%): ${advancePayment} ₾</p>
                    <p style="color: #2e7d32; font-size: 13px; line-height: 1.4;">
                        ჯავშნის გარანტირებისთვის, გთხოვთ გადმორიცხოთ აღნიშნული დეპოზიტი StayGeo-ს ანგარიშზე:<br>
                        <strong style="font-size: 14px; display:inline-block; margin-top:5px; background:#fff; padding:3px 6px; border-radius:4px; border:1px solid #a5d6a7;">GE12BG0000000000000000 (BOG)</strong>
                    </p>
                </div>
                
                <p style="font-size: 13px; color: #d32f2f; margin-bottom: 15px; font-weight: bold;">
                    დანიშნულებაში აუცილებლად მიუთითეთ ჯავშნის ნომერი: ${bookingID}
                </p>
                
                <div style="background: #f1f3f4; padding: 12px; border-radius: 8px; border: 1px solid #ddd;">
                    <p style="font-size: 14px; font-weight: bold; color: #4a4a4a; margin: 0;">
                        💵 დარჩენილ ${payToHost} ₾-ს გადაიხდით პირდაპირ მასპინძელთან.
                    </p>
                </div>
            </div>
        `;

        successModal.style.display = 'flex';
    }

    document.getElementById('bookBtn').addEventListener('click', (e) => { e.preventDefault(); showBookingModal(); });
    closeModalBtn.addEventListener('click', () => { successModal.style.display = 'none'; });
});