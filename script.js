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
            e.stopPropagation(); // აჩერებს გვერდის დახურვის ივენთს
            destInput.value = item.city;
            closeAllDropdowns();
        });
        locDropdown.appendChild(itemRow);
    });
}

// ლოკაციის ბლოკზე დაჭერა
destBlock.addEventListener('click', (e) => {
    e.stopPropagation(); // აჩერებს გვერდის დახურვას
});

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

// ==========================================
// 2. სტუმრების და ოთახების მართვა (გასწორებული)
// ==========================================
const guestsBlock = document.getElementById('sgGuestsBlock');
const guestsDropdown = document.getElementById('sgGuestsDropdown');
const guestsDisplay = document.getElementById('sgGuestsDisplay');

let counts = { adults: 2, children: 0, rooms: 1 };

function updateGuestsUI() {
    document.getElementById('valAdults').innerText = counts.adults;
    document.getElementById('valChildren').innerText = counts.children;
    document.getElementById('valRooms').innerText = counts.rooms;

    document.getElementById('btnAdultMinus').disabled = counts.adults <= 1;
    document.getElementById('btnChildMinus').disabled = counts.children <= 0;
    document.getElementById('btnRoomMinus').disabled = counts.rooms <= 1;

    guestsDisplay.innerText = `${counts.adults} ზრდასრული · ${counts.children} ბავშვი · ${counts.rooms} ოთახი`;
}

function setupCounter(idName, key, min) {
    document.getElementById(`btn${idName}Plus`).addEventListener('click', (e) => {
        e.stopPropagation();
        counts[key]++;
        updateGuestsUI();
    });
    document.getElementById(`btn${idName}Minus`).addEventListener('click', (e) => {
        e.stopPropagation();
        if (counts[key] > min) {
            counts[key]--;
            updateGuestsUI();
        }
    });
}
// გასწორდა გასაღებები ზუსტ შესაბამისობაში: 'adults', 'children', 'rooms'
setupCounter('Adult', 'adults', 1); 
setupCounter('Child', 'children', 0); 
setupCounter('Room', 'rooms', 1);

guestsBlock.addEventListener('click', (e) => {
    e.stopPropagation(); // არ აძლევს გვერდს დროპდაუნის დახურვის უფლებას
    if (e.target.closest('.sg-guests-dropdown')) return; // თუ შიგნით პლუსს აჭერს, არ დაკეტოს
    
    const isOpen = guestsDropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) guestsDropdown.classList.add('open');
});

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

dateBlock.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('.sg-exact-calendar-pop')) return;
    
    const isOpen = calPop.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) { calPop.classList.add('open'); renderCalendar(); }
});

// ==========================================
// 4. გლობალური ივენთი დახურვისთვის
// ==========================================
function closeAllDropdowns() {
    locDropdown.classList.remove('open');
    guestsDropdown.classList.remove('open');
    calPop.classList.remove('open');
}

// იხურება მხოლოდ მაშინ, როცა საძიებო ზოლის გარეთ აწკაპუნებენ
document.addEventListener('click', () => { closeAllDropdowns(); });

// საწყისი ჩატვირთვა
updateGuestsUI();

/* =========================================
   მესამე ეტაპი: განცხადებების გამოტანა და ფილტრაცია
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const listingsGrid = document.getElementById('listingsGrid');
    const searchForm = document.querySelector('.sg-search-inner-form'); // შენი საძიებო ფორმა

    if (!listingsGrid) return; // თუ ამ გვერდზე არ ვართ, არაფერი ქნას

    // 1. ფუნქცია: ბაზიდან მონაცემების წამოღება და გაფილტვრა
    function loadListings(filterLocation = "", filterRooms = 0) {
        // ვიღებთ მონაცემებს LocalStorage-დან
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        
        // 🔍 ფილტრაციის ლოგიკა
        if (filterLocation !== "") {
            // ვეძებთ ლოკაციას (ასოების სიდიდის მიუხედავად)
            listings = listings.filter(item => 
                item.location.toLowerCase().includes(filterLocation.toLowerCase())
            );
        }
        if (filterRooms > 0) {
            // ვაჩვენებთ მხოლოდ იმას, რასაც იმდენივე ან მეტი ოთახი აქვს
            listings = listings.filter(item => item.rooms >= filterRooms);
        }

        // ვაგზავნით გასახატად
        renderListings(listings);
    }

    // 2. ფუნქცია: HTML ბარათების გენერაცია
    function renderListings(listings) {
        listingsGrid.innerHTML = ''; // ვასუფთავებთ წინა შედეგებს


        // ვხატავთ თითოეულ ბარათს
        listings.forEach(listing => {
            // ვიღებთ მთავარ სურათს (ინდექსი 0, რადგან დამატებისას დავალაგეთ)
            const mainImage = listing.images && listing.images.length > 0 ? listing.images[0] : '';
            
            // ვიღებთ პირველ 3 კეთილმოწყობას, რომ ბარათი არ გადაიტვირთოს
            let amenitiesHTML = '';
            if (listing.amenities && listing.amenities.length > 0) {
                const topAmenities = listing.amenities.slice(0, 3);
                amenitiesHTML = topAmenities.map(a => `<span>${a}</span>`).join('');
                
                if (listing.amenities.length > 3) {
                    amenitiesHTML += `<span>+${listing.amenities.length - 3} მეტი</span>`;
                }
            }

            // ვქმნით HTML ელემენტს
            const card = document.createElement('div');
            card.className = 'listing-card';
            
            // მომავალში აქ დავადებთ ლინკს დეტალური გვერდისკენ: onclick="window.location.href='details.html?id=${listing.id}'"
            
            card.innerHTML = `
                <img src="${mainImage}" alt="${listing.title}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${listing.title}</h3>
                    <div class="card-location">📍 ${listing.location}</div>
                    
                    <div class="card-amenities">
                        ${amenitiesHTML}
                    </div>
                    
                    <div class="card-footer">
                        <div class="details">
                            ${listing.area} მ²<br>
                            ${listing.rooms} ოთახი
                        </div>
                        <div class="price">
                            ${listing.price}₾ <span>/ ღამე</span>
                        </div>
                    </div>
                </div>
            `;
            listingsGrid.appendChild(card);
        });
    }

    // 3. საწყისი ჩატვირთვა (როცა საიტზე ახალი შემოსულია)
    loadListings();

    // 4. ძებნის ღილაკზე დაჭერის ივენთი
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // გვერდის დარეფრეშებას ვბლოკავთ
            
            // ვიღებთ მნიშვნელობას ლოკაციის ინპუტიდან
            const locationInput = document.getElementById('sgDestInput').value.trim();
            // ვიღებთ ოთახების რაოდენობას მრიცხველიდან
            const roomsValue = parseInt(document.getElementById('valRooms').innerText) || 0;

            // ვძახით ფილტრს
            loadListings(locationInput, roomsValue);
            
            // ეკრანს რბილად ჩამოვასქროლებთ შედეგებისკენ
            document.querySelector('.sg-listings-section').scrollIntoView({ behavior: 'smooth' });
        });
    }
});