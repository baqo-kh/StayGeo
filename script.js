import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function updateHeaderAvatar() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const guestLinks = document.getElementById('guestLinks');
        const userProfile = document.getElementById('userProfile');
        const headerAvatar = document.getElementById('headerAvatarDisplay');

        if (guestLinks) guestLinks.style.display = 'none';
        if (userProfile) userProfile.style.display = 'contents';

        const defaultProfileBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmZmZmY7IGRpc3BsYXk6IGJsb2NrOyI+PHBhdGggZmlsbD0iIzgwODA4MCIgZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";
        let profileData = JSON.parse(localStorage.getItem('staygeo_user_profile')) || {};
        
        if (headerAvatar) {
            headerAvatar.alt = ""; 
            headerAvatar.src = (profileData.avatar && profileData.avatar !== '') ? profileData.avatar : defaultProfileBase64;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateHeaderAvatar();
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const addListingBtn = document.getElementById('addListingBtn');

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

    const geoLocations = [
        { city: "თბილისი", region: "თბილისი, საქართველო" },
        { city: "ბათუმი", region: "აჭარა, საქართველო" },
        { city: "ქუთაისი", region: "იმერეთი, საქართველო" },
        { city: "რუსთავი", region: "ქვემო ქართლი, საქართველო" },
        { city: "ზუგდიდი", region: "სამეგრელო, საქართველო" },
        { city: "გორი", region: "შიდა ქართლი, საქართველო" },
        { city: "ფოთი", region: "სამეგრელო, საქართველო" },
        { city: "თელავი", region: "კახეთი, საქართველო" },
        { city: "ქობულეთი", region: "აჭარა, საქართველო" },
        { city: "ურეკი", region: "გურია, საქართველო" },
        { city: "შეკვეთილი", region: "გურია, საქართველო" },
        { city: "გონიო", region: "აჭარა, საქართველო" },
        { city: "კვარიათი", region: "აჭარა, საქართველო" },
        { city: "მწვანე კონცხი", region: "აჭარა, საქართველო" },
        { city: "ანაკლია", region: "სამეგრელო, საქართველო" },
        { city: "გრიგოლეთი", region: "გურია, საქართველო" },
        { city: "ბაკურიანი", region: "სამცხე-ჯავახეთი, საქართველო" },
        { city: "გუდაური", region: "მცხეთა-მთიანეთი, საქართველო" },
        { city: "მესტია", region: "სამეგრელო-ზემო სვანეთი, საქართველო" },
        { city: "ყაზბეგი (სტეფანწმინდა)", region: "მცხეთა-მთიანეთი, საქართველო" },
        { city: "გოდერძი", region: "აჭარა, საქართველო" },
        { city: "ბახმარო", region: "გურია, საქართველო" },
        { city: "შოვი", region: "რაჭა-ლეჩხუმი, საქართველო" },
        { city: "ბორჯომი", region: "სამცხე-ჯავახეთი, საქართველო" },
        { city: "წყალტუბო", region: "იმერეთი, საქართველო" },
        { city: "საირმე", region: "იმერეთი, საქართველო" },
        { city: "აბასთუმანი", region: "სამცხე-ჯავახეთი, საქართველო" },
        { city: "სიღნაღი", region: "კახეთი, საქართველო" },
        { city: "მცხეთა", region: "მცხეთა-მთიანეთი, საქართველო" },
        { city: "ყვარელი", region: "კახეთი, საქართველო" },
        { city: "ცემი", region: "სამცხე-ჯავახეთი, საქართველო" },
        { city: "წაღვერი", region: "სამცხე-ჯავახეთი, საქართველო" },
        { city: "სურამი", region: "შიდა ქართლი, საქართველო" }
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
        
        document.addEventListener('click', (e) => {
            if (!destBlock.contains(e.target)) {
                locDropdown.classList.remove('open');
            }
        });
    }

    let counts = { adult: 2, child: 0, room: 1 }; 
    
    const guestsBlock = document.getElementById('sgGuestsBlock');
    const guestsDropdown = document.getElementById('sgGuestsDropdown');

    if (guestsBlock && guestsDropdown) {
        guestsBlock.addEventListener('click', (e) => {
            if (!guestsDropdown.contains(e.target)) { 
                guestsDropdown.style.display = guestsDropdown.style.display === 'block' ? 'none' : 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!guestsBlock.contains(e.target)) {
                guestsDropdown.style.display = 'none';
            }
        });
    }

    function updateGuestsUI() {
        const d = document.getElementById('sgGuestsDisplay');
        if(!d) return;
        document.getElementById('valAdults').innerText = counts.adult;
        document.getElementById('valChildren').innerText = counts.child;
        document.getElementById('valRooms').innerText = counts.room;
        d.innerText = `${counts.adult} ზრდ. · ${counts.child} ბავშ. · ${counts.room} ოთახი`;
    }

    ['Adult', 'Child', 'Room'].forEach(t => {
        const key = t.toLowerCase();
        document.getElementById(`btn${t}Plus`)?.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            counts[key]++; 
            updateGuestsUI(); 
        });
        document.getElementById(`btn${t}Minus`)?.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            if (counts[key] > (t === 'Child' ? 0 : 1)) { 
                counts[key]--; 
                updateGuestsUI(); 
            }
        });
    });

    const searchDatesInput = document.getElementById('searchDates');
    if (searchDatesInput && typeof flatpickr !== "undefined") {
        flatpickr(searchDatesInput, {
            mode: "range",
            minDate: "today",
            locale: "ka",
            dateFormat: "Y-m-d"
        });
    }

    const listingsGrid = document.getElementById('listingsGrid');
    const searchBtn = document.getElementById('mainSearchBtn'); 
    const typeInput = document.getElementById('sgTypeInput'); 

    let allListingsFromDB = []; 

    function renderListings(listings) {
        if (!listingsGrid) return;
        
        if (listings.length === 0) {
            listingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px dashed #ccc;">
                    <h3 style="color: #0b3127; font-size: 22px; margin-bottom: 10px;">ვერაფერი ვიპოვეთ 🤷‍♂️</h3>
                    <p style="color: #666; font-size: 15px;">მითითებულ პარამეტრებში განცხადება არ იძებნება.</p>
                </div>`;
            return;
        }

        listingsGrid.innerHTML = '';
        listings.forEach(l => {
            const card = document.createElement('div');
            card.className = 'listing-card';
            card.onclick = () => window.location.href = `details.html?id=${l.id}`;
            card.innerHTML = `
                <img src="${l.images?.[0] || ''}" class="card-image" alt="Listing Image">
                <div class="card-content">
                    <h3 class="card-title">${l.title}</h3>
                    <div class="card-location">📍 ${l.location}</div>
                    <div class="card-price">${l.price}₾ <span>/ ღამე</span></div>
                </div>
            `;
            listingsGrid.appendChild(card);
        });
    }

    async function loadAndFilterListings() {
        const filterLocation = destInput ? destInput.value.trim().toLowerCase() : "";
        const filterType = typeInput ? typeInput.value : "all";
        const datesVal = searchDatesInput ? searchDatesInput.value : "";
        
        const totalGuestsSearch = counts.adult + counts.child; 
        const requiredRooms = counts.room; 
        
        if (allListingsFromDB.length === 0) {
            try {
                const querySnapshot = await getDocs(collection(db, "listings"));
                allListingsFromDB = querySnapshot.docs.map(doc => ({
                    id: doc.id, 
                    ...doc.data()
                }));
            } catch (error) {
                console.error("შეცდომა Firebase-იდან განცხადებების წამოღებისას:", error);
            }
        }

        let filteredListings = allListingsFromDB.filter(listing => {
            
            if (filterLocation !== "") {
                if (!listing.location || !listing.location.toLowerCase().includes(filterLocation)) return false; 
            }

            if (filterType !== "all") {
                if (listing.propertyType !== filterType) return false;
            }

            if (listing.rooms && listing.rooms < requiredRooms) {
                return false;
            }

            if (listing.propertyType !== 'hotel') {
                if (listing.capacity && listing.capacity < totalGuestsSearch) return false; 
            }

            if (datesVal && datesVal.includes(' to ')) {
                const datesArr = datesVal.split(' to ');
                const searchStart = new Date(datesArr[0]);
                const searchEnd = new Date(datesArr[1]);

                let isFullyBlocked = false;

                if (listing.blockedDates && listing.blockedDates.length > 0) {
                    for (let block of listing.blockedDates) {
                        const blockStart = new Date(block.start);
                        const blockEnd = new Date(block.end);

                        if (searchStart < blockEnd && searchEnd > blockStart) {
                            if (listing.propertyType !== 'hotel') {
                                isFullyBlocked = true; 
                                break; 
                            } else if (listing.propertyType === 'hotel' && block.room === 'all') {
                                isFullyBlocked = true; 
                                break;
                            }
                        }
                    }
                }

                if (isFullyBlocked) return false; 
            }

            return true; 
        });
        
        renderListings(filteredListings);
    }

    if (listingsGrid) {
        loadAndFilterListings();
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 
            await loadAndFilterListings(); 
            
            if(listingsGrid) {
                listingsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    window.toggleDropdown = function(e) { 
        e.stopPropagation(); 
        const d = document.getElementById('profileDropdown'); 
        if(d) d.style.display = d.style.display === 'none' ? 'block' : 'none'; 
    };
    
    window.logoutUser = function() { 
        localStorage.removeItem('isLoggedIn'); 
        localStorage.removeItem('staygeo_user_profile');
        localStorage.removeItem('user_id');
        window.location.reload(); 
    };
    
    document.addEventListener('click', (e) => {
        const d = document.getElementById('profileDropdown');
        const p = document.getElementById('userProfile');
        if (d && p && !p.contains(e.target)) {
            d.style.display = 'none';
        }
    });
});