document.addEventListener("DOMContentLoaded", () => {
    
    // ვამოწმებთ, არის თუ არა მომხმარებელი შესული
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const grid = document.getElementById('myListingsGrid');

    function loadMyListings() {
        // მოგვაქვს ყველა განცხადება ბაზიდან
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        
        grid.innerHTML = '';

        if (listings.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #eaeaea;">
                    <h3 style="color: #0b3127; margin-bottom: 10px;">ჯერ არაფერი დაგიმატებიათ 🤷‍♂️</h3>
                    <p style="color: #666; margin-bottom: 20px;">თქვენი დამატებული ადგილები აქ გამოჩნდება.</p>
                    <a href="add-listing.html" style="background: #febb02; color: #0b3127; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">პირველი განცხადების დამატება</a>
                </div>`;
            return;
        }

        // ვხატავთ თითოეულ განცხადებას
        listings.forEach(listing => {
            const mainImage = listing.images && listing.images.length > 0 ? listing.images[0] : '';
            
            const card = document.createElement('div');
            card.className = 'listing-card';
            
            card.innerHTML = `
                <img src="${mainImage}" alt="${listing.title}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${listing.title}</h3>
                    <div class="card-location">📍 ${listing.location}</div>
                    
                    <div class="price" style="font-size: 20px; font-weight: 800; color: #0b3127; margin-top: auto;">
                        ${listing.price}₾ <span style="font-size: 13px; font-weight: normal; color: #666;">/ ღამე</span>
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

    // თავდაპირველი ჩატვირთვა
    loadMyListings();

    // 🗑️ წაშლის ლოგიკა (გლობალური ფუნქცია, რომ ღილაკმა დაინახოს)
    window.deleteListing = function(id) {
        if (confirm("ნამდვილად გსურთ ამ განცხადების წაშლა?")) {
            let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
            
            // ვფილტრავთ და ვტოვებთ ყველას, გარდა წასაშლელისა
            listings = listings.filter(item => item.id !== id);
            
            // ვინახავთ განახლებულ სიას
            localStorage.setItem('staygeo_listings', JSON.stringify(listings));
            
            // ხელახლა ვხატავთ ეკრანს
            loadMyListings();
        }
    };

    // ✏️ რედაქტირების ლოგიკა
    window.editListing = function(id) {
        // გადაგვამისამართებს რედაქტირების გვერდზე და ლინკში გაატანს განცხადების ID-ს
        window.location.href = `edit-listing.html?id=${id}`;
    };
});