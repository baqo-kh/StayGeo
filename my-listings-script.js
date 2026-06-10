document.addEventListener("DOMContentLoaded", () => {
    // 1. უსაფრთხოება: ვამოწმებთ შესვლას
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const grid = document.getElementById('myListingsGrid');
    if (!grid) return; // უსაფრთხოების შემოწმება

    function loadMyListings() {
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        
        grid.innerHTML = '';

        if (listings.length === 0) {
            grid.innerHTML = `
                <div class="no-results-box">
                    <h3>ჯერ არაფერი დაგიმატებიათ 🤷‍♂️</h3>
                    <p>თქვენი დამატებული ადგილები აქ გამოჩნდება.</p>
                    <a href="add-listing.html" class="add-first-btn">პირველი განცხადების დამატება</a>
                </div>`;
            return;
        }

        listings.forEach(listing => {
            const mainImage = (listing.images && listing.images.length > 0) ? listing.images[0] : 'placeholder.jpg';
            
            const card = document.createElement('div');
            card.className = 'listing-card';
            
            card.innerHTML = `
                <img src="${mainImage}" alt="${listing.title}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${listing.title}</h3>
                    <div class="card-location">📍 ${listing.location}</div>
                    
                    <div class="price">
                        ${listing.price}₾ <span>/ ღამე</span>
                    </div>
                    
                    <div class="my-listing-actions">
                        <button class="edit-btn" onclick="editListing(${listing.id})">რედაქტირება</button>
                        <button class="delete-btn" onclick="deleteListing(${listing.id})">წაშლა</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    loadMyListings();

    // 🗑️ წაშლის ლოგიკა
    window.deleteListing = function(id) {
        if (confirm("ნამდვილად გსურთ ამ განცხადების წაშლა?")) {
            let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
            listings = listings.filter(item => item.id !== id);
            localStorage.setItem('staygeo_listings', JSON.stringify(listings));
            loadMyListings();
        }
    };

    // ✏️ რედაქტირების ლოგიკა
    window.editListing = function(id) {
        window.location.href = `edit-listing.html?id=${id}`;
    };
});