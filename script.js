document.addEventListener("DOMContentLoaded", () => {
    // 0. ავტორიზაციის UI მართვა
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const guestLinks = document.getElementById('guestLinks');
    const userProfile = document.getElementById('userProfile');
    const addListingBtn = document.getElementById('addListingBtn');

    if (isLoggedIn) {
        if (guestLinks) guestLinks.style.display = 'none';
        if (userProfile) userProfile.style.display = 'inline-block';
    } else {
        if (guestLinks) guestLinks.style.display = 'contents';
        if (userProfile) userProfile.style.display = 'none';
    }

    if (addListingBtn) {
        addListingBtn.addEventListener('click', () => {
            if (isLoggedIn) {
                window.location.href = 'add-listing.html';
            } else {
                alert('გთხოვთ გაიაროთ რეგისტრაცია განცხადების დასამატებლად.');
                window.location.href = 'register.html';
            }
        });
    }

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
                    <div class="sg-loc-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
                    <div class="sg-loc-info"><span class="sg-loc-name">${item.city}</span><span class="sg-loc-region">${item.region}</span></div>`;
                itemRow.onclick = (e) => { e.stopPropagation(); destInput.value = item.city; locDropdown.classList.remove('open'); };
                locDropdown.appendChild(itemRow);
            });
        }

        destInput.addEventListener('focus', () => {
            if (destInput.value.trim() === '') renderLocations(geoLocations.slice(0, 6));
            locDropdown.classList.add('open');
        });

        destInput.addEventListener('input', (e) => {
            const word = e.target.value.toLowerCase().trim();
            const filtered = word === '' ? geoLocations.slice(0, 6) : geoLocations.filter(i => i.city.toLowerCase().includes(word));
            renderLocations(filtered);
            locDropdown.classList.add('open');
        });
    }

    // ==========================================
    // 2. სტუმრების და ოთახების მართვა
    // ==========================================
    let counts = { adults: 2, children: 0, rooms: 1 };
    function updateGuestsUI() {
        const d = document.getElementById('sgGuestsDisplay');
        if(!d) return;
        document.getElementById('valAdults').innerText = counts.adults;
        document.getElementById('valChildren').innerText = counts.children;
        document.getElementById('valRooms').innerText = counts.rooms;
        d.innerText = `${counts.adults} ზრდასრული · ${counts.children} ბავშვი · ${counts.rooms} ოთახი`;
    }

    ['Adult', 'Child', 'Room'].forEach(t => {
        document.getElementById(`btn${t}Plus`)?.addEventListener('click', (e) => { e.stopPropagation(); counts[t.toLowerCase() + (t==='Room'?'s':'')]++; updateGuestsUI(); });
        document.getElementById(`btn${t}Minus`)?.addEventListener('click', (e) => { e.stopPropagation(); if (counts[t.toLowerCase() + (t==='Room'?'s':'')] > (t==='Child'? -1 : 0)) { counts[t.toLowerCase() + (t==='Room'?'s':'')]--; updateGuestsUI(); }});
    });

    // ==========================================
    // 3. კალენდარი 
    // ==========================================
    const calPop = document.getElementById('sgCalPop');
    let startDate = null; let endDate = null;
    const monthNamesGeo = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
    
    function renderCalendar() {
        const container = document.getElementById('sgCalMonthsContainer');
        if(!container) return;
        container.innerHTML = '';
        let date = new Date();
        for (let m = 0; m < 2; m++) {
            let monthIdx = date.getMonth();
            let year = date.getFullYear();
            const section = document.createElement('div');
            section.className = 'sg-pop-month-section';
            section.innerHTML = `<div class="sg-month-name">${monthNamesGeo[monthIdx]} ${year}</div><div class="sg-day-names-row"><div>ორ</div><div>სმ</div><div>ოთ</div><div>ხთ</div><div>პრ</div><div>შბ</div><div>კვ</div></div>`;
            const grid = document.createElement('div');
            grid.className = 'sg-days-grid-wrapper';
            let daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                let cell = document.createElement('div');
                cell.className = 'sg-cal-day-cell';
                cell.innerText = d;
                cell.onclick = (e) => { e.stopPropagation(); /* აქ შენი თარიღის ლოგიკაა */ };
                grid.appendChild(cell);
            }
            section.appendChild(grid);
            container.appendChild(section);
            date.setMonth(date.getMonth() + 1);
        }
    }

    document.getElementById('sgDateBlock')?.addEventListener('click', (e) => {
        e.stopPropagation();
        calPop.classList.toggle('open');
        if(calPop.classList.contains('open')) renderCalendar();
    });

    // ==========================================
    // 4. განცხადებების გამოტანა და ფილტრაცია
    // ==========================================
    const listingsGrid = document.getElementById('listingsGrid');
    const searchBtn = document.querySelector('.sg-main-search-btn'); // ძებნის ღილაკი

    function renderListings(listings) {
        if (!listingsGrid) return;
        
        // თუ განცხადება ვერ მოიძებნა
        if (listings.length === 0) {
            listingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px dashed #ccc;">
                    <h3 style="color: #0b3127; font-size: 22px; margin-bottom: 10px;">ვერაფერი ვიპოვეთ 🤷‍♂️</h3>
                    <p style="color: #666; font-size: 15px;">მითითებულ ქალაქში განცხადება არ იძებნება.</p>
                </div>`;
            return;
        }

        listingsGrid.innerHTML = '';
        listings.forEach(l => {
            const card = document.createElement('div');
            card.className = 'listing-card';
            card.onclick = () => window.location.href = `details.html?id=${l.id}`;
            card.innerHTML = `
                <img src="${l.images?.[0] || ''}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${l.title}</h3>
                    <div class="card-location">📍 ${l.location}</div>
                    <div class="card-price">${l.price}₾ <span>/ ღამე</span></div>
                </div>
            `;
            listingsGrid.appendChild(card);
        });
    }

    function loadListings(filterLocation = "") {
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        
        // ფილტრაცია ლოკაციის მიხედვით
        if (filterLocation.trim() !== "") {
            listings = listings.filter(item => 
                item.location && item.location.toLowerCase().includes(filterLocation.toLowerCase().trim())
            );
        }
        
        renderListings(listings);
    }

    // თავდაპირველი ჩატვირთვა (გამოაქვს ყველა განცხადება)
    if (listingsGrid) {
        loadListings();
    }

    // ძებნის ღილაკის ლოგიკა
    if (searchBtn && destInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const searchedCity = destInput.value;
            loadListings(searchedCity);
            
            // ჩამოვსქროლოთ ეკრანი განცხადებებთან
            if(listingsGrid) {
                listingsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // გლობალური ფუნქციები
    window.toggleDropdown = function(e) { e.stopPropagation(); const d = document.getElementById('profileDropdown'); if(d) d.style.display = d.style.display === 'none' ? 'block' : 'none'; };
    window.logoutUser = function() { localStorage.removeItem('isLoggedIn'); window.location.reload(); };
});