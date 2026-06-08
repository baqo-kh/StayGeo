document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. ლოკაციების ბაზა და ძებნა
    // ==========================================
    const geoLocations = [
        { city: "თბილისი", region: "თბილისი, საქართველო" },
        { city: "ბათუმი", region: "აჭარა, საქართველო" },
        { city: "ქუთაისი", region: "იმერეთი, საქართველო" },
        { city: "ბაკურიანი", region: "სამცხე-ჯავახეთი, საქართველო" },
        { city: "გუდაური", region: "მცხეთა-მთიანეთი, საქართველო" },
        { city: "მესტია", region: "სამეგრელო-ზემო სვანეთი, საქართველო" },
        { city: "ბორჯომი", region: "სამცხე-ჯავახეთი, საქართველო" },
        { city: "თელავი", region: "კახეთი, საქართველო" },
        { city: "სიღნაღი", region: "კახეთი, საქართველო" },
        { city: "მცხეთა", region: "მცხეთა-მთიანეთი, საქართველო" }
    ];

    const destInput = document.getElementById('sgDestInput');
    const locDropdown = document.getElementById('sgLocDropdown');
    const destBlock = document.getElementById('sgDestBlock');

    if (destInput && locDropdown && destBlock) {
        function renderLocations(list) {
            locDropdown.innerHTML = ''; 
            if (list.length === 0) {
                locDropdown.innerHTML = `<div class="sg-no-results">შედეგი ვერ მოიძებნა</div>`;
                return;
            }
            list.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'sg-location-item';
                itemRow.innerHTML = `
                    <div class="sg-loc-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div class="sg-loc-info">
                        <span class="sg-loc-name">${item.city}</span>
                        <span class="sg-loc-region">${item.region}</span>
                    </div>`;
                itemRow.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    destInput.value = item.city;
                    closeAllDropdowns();
                });
                locDropdown.appendChild(itemRow);
            });
        }

        destBlock.addEventListener('click', (e) => e.stopPropagation());

        destInput.addEventListener('focus', () => {
            const isOpen = locDropdown.classList.contains('open');
            closeAllDropdowns();
            if (!isOpen) {
                if (destInput.value.trim() === '') renderLocations(geoLocations.slice(0, 6));
                locDropdown.classList.add('open');
            }
        });

        destInput.addEventListener('input', (e) => {
            const word = e.target.value.toLowerCase().trim();
            if (word === '') { renderLocations(geoLocations.slice(0, 6)); return; }
            const filtered = geoLocations.filter(item => item.city.toLowerCase().includes(word));
            renderLocations(filtered);
        });
    }

    // ==========================================
    // 2. სტუმრების და ოთახების მართვა
    // ==========================================
    const guestsBlock = document.getElementById('sgGuestsBlock');
    const guestsDropdown = document.getElementById('sgGuestsDropdown');
    const guestsDisplay = document.getElementById('sgGuestsDisplay');

    let counts = { adults: 2, children: 0, rooms: 1 };

    function updateGuestsUI() {
        if(!guestsDisplay) return;
        document.getElementById('valAdults').innerText = counts.adults;
        document.getElementById('valChildren').innerText = counts.children;
        document.getElementById('valRooms').innerText = counts.rooms;

        document.getElementById('btnAdultMinus').disabled = counts.adults <= 1;
        document.getElementById('btnChildMinus').disabled = counts.children <= 0;
        document.getElementById('btnRoomMinus').disabled = counts.rooms <= 1;

        guestsDisplay.innerText = `${counts.adults} ზრდასრული · ${counts.children} ბავშვი · ${counts.rooms} ოთახი`;
    }

    function setupCounter(idName, key, min) {
        const plusBtn = document.getElementById(`btn${idName}Plus`);
        const minusBtn = document.getElementById(`btn${idName}Minus`);
        if(!plusBtn || !minusBtn) return;

        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            counts[key]++;
            updateGuestsUI();
        });
        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (counts[key] > min) {
                counts[key]--;
                updateGuestsUI();
            }
        });
    }

    setupCounter('Adult', 'adults', 1); 
    setupCounter('Child', 'children', 0); 
    setupCounter('Room', 'rooms', 1);

    if (guestsBlock && guestsDropdown) {
        guestsBlock.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.closest('.sg-guests-dropdown')) return;
            
            const isOpen = guestsDropdown.classList.contains('open');
            closeAllDropdowns();
            if (!isOpen) guestsDropdown.classList.add('open');
        });
    }

    // ==========================================
    // 3. კალენდრის ორთვიანი მართვა
    // ==========================================
    const dateBlock = document.getElementById('sgDateBlock');
    const calPop = document.getElementById('sgCalPop');
    const checkInLabel = document.getElementById('sgCheckInLabel');
    const checkOutLabel = document.getElementById('sgCheckOutLabel');

    let startDate = null;
    let endDate = null;

    const monthNamesGeo = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
    const dayNamesGeo = ["ორ", "სმ", "ოთ", "ხთ", "პრ", "შბ", "კვ"];

    function renderCalendar() {
        const container = document.getElementById('sgCalMonthsContainer');
        if(!container) return;
        container.innerHTML = '';
        
        let date = new Date(); 
        
        for (let m = 0; m < 2; m++) {
            let y = date.getFullYear();
            let monthIdx = date.getMonth();
            
            const monthSection = document.createElement('div');
            monthSection.className = 'sg-pop-month-section';
            
            monthSection.innerHTML = `
                <div class="sg-month-name">${monthNamesGeo[monthIdx]} ${y}</div>
                <div class="sg-day-names-row">${dayNamesGeo.map(d => `<div>${d}</div>`).join('')}</div>
            `;
            
            const grid = document.createElement('div');
            grid.className = 'sg-days-grid-wrapper';
            
            let firstDay = new Date(y, monthIdx, 1).getDay();
            let adjFirstDay = firstDay === 0 ? 6 : firstDay - 1; 
            let daysInMonth = new Date(y, monthIdx + 1, 0).getDate();
            
            for (let i = 0; i < adjFirstDay; i++) {
                grid.innerHTML += `<div class="sg-cal-day-cell blank"></div>`;
            }
            
            for (let d = 1; d <= daysInMonth; d++) {
                let currentCellDate = new Date(y, monthIdx, d);
                let cellClass = "sg-cal-day-cell";
                
                if (startDate && currentCellDate.getTime() === startDate.getTime()) cellClass += " range-start";
                if (endDate && currentCellDate.getTime() === endDate.getTime()) cellClass += " range-end";
                if (startDate && endDate && currentCellDate > startDate && currentCellDate < endDate) cellClass += " range-between";
                
                const dayCell = document.createElement('div');
                dayCell.className = cellClass;
                dayCell.innerText = d;
                
                dayCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!startDate || (startDate && endDate)) {
                        startDate = currentCellDate;
                        endDate = null;
                    } else if (startDate && !endDate) {
                        if (currentCellDate < startDate) {
                            startDate = currentCellDate;
                        } else {
                            endDate = currentCellDate;
                            calPop.classList.remove('open');
                        }
                    }
                    updateDatesUI();
                    renderCalendar();
                });
                
                grid.appendChild(dayCell);
            }
            
            monthSection.appendChild(grid);
            container.appendChild(monthSection);
            date.setMonth(date.getMonth() + 1); 
        }
    }

    function updateDatesUI() {
        if(!checkInLabel || !checkOutLabel) return;
        if (startDate) {
            checkInLabel.innerText = `${startDate.getDate()} ${monthNamesGeo[startDate.getMonth()].slice(0,3)}.`;
            checkInLabel.style.fontWeight = "bold";
        } else {
            checkInLabel.innerText = "შესვლის თარიღი";
        }
        
        if (endDate) {
            checkOutLabel.innerText = `${endDate.getDate()} ${monthNamesGeo[endDate.getMonth()].slice(0,3)}.`;
            checkOutLabel.style.fontWeight = "bold";
        } else {
            checkOutLabel.innerText = "გასვლის თარიღი";
        }
    }

    if (dateBlock && calPop) {
        dateBlock.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.closest('.sg-exact-calendar-pop')) return;
            
            const isOpen = calPop.classList.contains('open');
            closeAllDropdowns();
            if (!isOpen) { calPop.classList.add('open'); renderCalendar(); }
        });
    }

    // ==========================================
    // 4. გლობალური ივენთი დახურვისთვის
    // ==========================================
    function closeAllDropdowns() {
        if(locDropdown) locDropdown.classList.remove('open');
        if(guestsDropdown) guestsDropdown.classList.remove('open');
        if(calPop) calPop.classList.remove('open');
    }

    document.addEventListener('click', () => { closeAllDropdowns(); });
    updateGuestsUI();

    // ==========================================
    // 5. განცხადებების გამოტანა და ფილტრაცია
    // ==========================================
    const listingsGrid = document.getElementById('listingsGrid');
    const searchForm = document.querySelector('.sg-search-inner-form');

    function loadListings(filterLocation = "", filterRooms = 0) {
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        
        if (filterLocation !== "") {
            listings = listings.filter(item => 
                item.location && item.location.toLowerCase().includes(filterLocation.toLowerCase())
            );
        }
        if (filterRooms > 0) {
            listings = listings.filter(item => item.rooms >= filterRooms);
        }

        renderListings(listings);
    }

    function renderListings(listings) {
        if (!listingsGrid) return; 
        listingsGrid.innerHTML = ''; 

        // 🛡️ თუ ეკრანზე არაფერი იძებნება
        if (listings.length === 0) {
            listingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px dashed #ccc;">
                    <h3 style="color: #0b3127; font-size: 22px; margin-bottom: 10px;">ვერაფერი ვიპოვეთ 🤷‍♂️</h3>
                    <p style="color: #666; font-size: 15px;">ამ კრიტერიუმებით განცხადება არ იძებნება. სცადეთ სხვა ლოკაცია.</p>
                </div>`;
            return;
        }

        // ვხატავთ თითოეულ ბარათს
        listings.forEach(listing => {
            const mainImage = listing.images && listing.images.length > 0 ? listing.images[0] : '';
            
            let amenitiesHTML = '';
            if (listing.amenities && listing.amenities.length > 0) {
                const topAmenities = listing.amenities.slice(0, 2).join(', ');
                let extraCount = '';
                
                if (listing.amenities.length > 2) {
                    extraCount = `<span class="extra-amenities">+${listing.amenities.length - 2} მეტი</span>`;
                }
                amenitiesHTML = `<div class="card-amenities">${topAmenities}${extraCount}</div>`;
            }

            const card = document.createElement('div');
            card.className = 'listing-card';
            
            card.onclick = () => {
                window.location.href = `details.html?id=${listing.id}`;
            };
            
            card.innerHTML = `
                <img src="${mainImage}" alt="${listing.title}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${listing.title}</h3>
                    <div class="card-location">📍 ${listing.location}</div>
                    
                    <div class="card-details">
                        <span>📏 ${listing.area} მ²</span>
                        <span>🛏️ ${listing.rooms} ოთახი</span>
                    </div>
                    
                    ${amenitiesHTML}
                    
                    <div class="card-price">
                        ${listing.price}₾ <span>/ ღამე</span>
                    </div>
                </div>
            `;
            listingsGrid.appendChild(card);
        });
    }

    // საწყისი ჩატვირთვა
    if(listingsGrid) {
        loadListings();
    }

    // ძებნის ღილაკზე დაჭერის ივენთი
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const locationInput = destInput ? destInput.value.trim() : '';
            const roomsValue = counts.rooms || 0;

            loadListings(locationInput, roomsValue);
            
            const section = document.querySelector('.sg-listings-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        });
    }
});