document.addEventListener('DOMContentLoaded', () => {
    // 1. URL-დან ვიღებთ განცხადების ID-ს
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    // 2. მოგვაქვს ბაზა და ვპოულობთ ჩვენს ბინას
    let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
    const listing = listings.find(item => item.id === id);

    // თუ განცხადება არ არსებობს, ვაბრუნებთ მთავარ გვერდზე
    if (!listing) {
        alert("განცხადება ვერ მოიძებნა ან წაშლილია!");
        window.location.href = 'index.html';
        return;
    }

    // 3. ვავსებთ ტექსტურ ინფორმაციას
    document.getElementById('detTitle').innerText = listing.title;
    document.getElementById('detLocation').innerText = `📍 ${listing.location}`;
    document.getElementById('detArea').innerText = `📏 ${listing.area} მ²`;
    document.getElementById('detRooms').innerText = `🛏️ ${listing.rooms} ოთახი`;
    document.getElementById('detDesc').innerText = listing.description;
    document.getElementById('detPrice').innerText = `${listing.price}₾`;

    // 4. ვხატავთ კეთილმოწყობას
    const amGrid = document.getElementById('detAmenities');
    if (listing.amenities && listing.amenities.length > 0) {
        // თითოეულ სიტყვას წინ ვუწერთ მწვანე "ჩეკს" (✔️)
        amGrid.innerHTML = listing.amenities.map(am => `<div class="am-item">✔️ ${am}</div>`).join('');
    } else {
        amGrid.innerHTML = "<p>ინფორმაცია არ არის მითითებული.</p>";
    }

    // 5. ვხატავთ ფოტოების გალერეას
    const mainImg = document.getElementById('detMainImg');
    const thumbGrid = document.getElementById('detThumbnails');

    if (listing.images && listing.images.length > 0) {
        // პირველ ფოტოს ვსვამთ მთავარ ადგილას
        mainImg.src = listing.images[0];
        
        // დანარჩენებს ვამწკრივებთ ქვემოთ
        thumbGrid.innerHTML = listing.images.map(imgSrc => 
            `<img src="${imgSrc}" class="thumb" onclick="changeMainImage('${imgSrc}')">`
        ).join('');
    } else {
        // თუ ფოტო არ აქვს, რამე ნაგულისხმევი ფოტო შეგვიძლია ჩავსვათ (სურვილისამებრ)
        mainImg.src = 'https://via.placeholder.com/800x500?text=No+Image';
    }
});

// გლობალური ფუნქცია, რომელიც პატარა ფოტოზე დაჭერისას მთავარს ცვლის
window.changeMainImage = function(src) {
    document.getElementById('detMainImg').src = src;
};