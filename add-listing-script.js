document.addEventListener("DOMContentLoaded", () => {
    // 1. უსაფრთხოება: თუ შესული არ არის, მთავარზე ვაგდებთ
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const imageInput = document.getElementById('listImage');
    const imagePreview = document.getElementById('imagePreview');
    let imageBase64 = '';

    // 2. სურათის ატვირთვა და ეკრანზე გამოჩენა
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imageBase64 = event.target.result;
                imagePreview.src = imageBase64;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file); // აქცევს სურათს ტექსტურ კოდად
        }
    });

    // 3. ფორმის გაგზავნა და ბაზაში (მეხსიერებაში) შენახვა
    document.getElementById('addListingForm').addEventListener('submit', (e) => {
        e.preventDefault();

        if (!imageBase64) {
            alert("გთხოვთ, ატვირთოთ მთავარი სურათი.");
            return;
        }

        // ვქმნით ახალ ობიექტს ყველა მონაცემით
        const newListing = {
            id: Date.now(), // უნიკალური ID
            title: document.getElementById('listTitle').value,
            location: document.getElementById('listLocation').value,
            rooms: parseInt(document.getElementById('listRooms').value),
            price: parseInt(document.getElementById('listPrice').value),
            description: document.getElementById('listDesc').value,
            image: imageBase64,
            dateAdded: new Date().toISOString()
        };

        // ვიღებთ ძველ განცხადებებს ან ვქმნით ცარიელ სიას
        let listings = JSON.parse(localStorage.getItem('staygeo_listings')) || [];
        
        // ვამატებთ ახალს სიაში
        listings.push(newListing);
        
        // ვაბრუნებთ შენახულ სიას უკან ბრაუზერის მეხსიერებაში
        localStorage.setItem('staygeo_listings', JSON.stringify(listings));

        alert("🎉 განცხადება წარმატებით დაემატა!");
        
        // გადაგვყავს მთავარ გვერდზე
        window.location.href = 'index.html';
    });
});