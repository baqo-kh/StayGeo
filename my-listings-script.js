import { db } from './firebase-config.js';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const userProfile = JSON.parse(localStorage.getItem('staygeo_user_profile')) || {};
    const currentUserEmail = (userProfile.email || '').trim().toLowerCase();

    if (!currentUserEmail) {
        alert("პროფილის მონაცემები ვერ მოიძებნა. გთხოვთ, თავიდან გაიაროთ ავტორიზაცია.");
        window.location.href = 'login.html';
        return;
    }

    const grid = document.getElementById('myListingsGrid');
    if (!grid) return;

    let bookingsContainer = document.getElementById('pendingBookingsContainer');
    if (!bookingsContainer) {
        bookingsContainer = document.createElement('div');
        bookingsContainer.id = 'pendingBookingsContainer';
        bookingsContainer.style.cssText = 'width: 100%; max-width: 1100px; margin: 0 auto 30px auto; display: none;';
        grid.parentNode.insertBefore(bookingsContainer, grid);
    }

    async function loadPendingBookings() {
        try {
            const snapshot = await getDocs(collection(db, "bookings"));
            let myBookings = [];

            snapshot.forEach(docSnap => {
                const b = docSnap.data();
                const ownerEmail = (b.ownerEmail || '').trim().toLowerCase();
                
                if (ownerEmail === currentUserEmail && b.status === "pending") {
                    myBookings.push({ id: docSnap.id, ...b });
                }
            });

            if (myBookings.length === 0) {
                bookingsContainer.style.display = 'none';
                bookingsContainer.innerHTML = '';
                return;
            }

            bookingsContainer.style.display = 'block';
            let html = `
                <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 12px;">
                    <h2 style="color: #d84315; margin-top: 0; margin-bottom: 15px; font-size: 20px;">🔔 ახალი შემოსული ჯავშნები (მოლოდინში)</h2>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
            `;

            myBookings.forEach(b => {
                html += `
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 5px solid #ff9800; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div>
                            <span style="display: inline-block; background: #e0e0e0; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 16px; margin-bottom: 5px;">${b.bookingCode}</span>
                            <div style="font-size: 15px; color: #333;"><strong>ობიექტი:</strong> ${b.listingTitle} ${b.room !== 'all' ? `(ოთახი: ${b.room})` : ''}</div>
                            <div style="font-size: 14px; color: #666; margin-top: 3px;">📅 ${b.checkIn} -დან ${b.checkOut} -მდე</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #2e7d32; font-weight: bold; font-size: 15px; margin-bottom: 8px;">ჩასარიცხი დეპოზიტი: ${b.deposit} ₾</div>
                            <button onclick="confirmBooking('${b.id}', '${b.listingId}', '${b.checkIn}', '${b.checkOut}', '${b.room}')" 
                                    style="background: #00c853; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px;">
                                ✅ თანხა ჩაირიცხა (დადასტურება)
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
            bookingsContainer.innerHTML = html;

        } catch (error) {
            console.error("შეცდომა ჯავშნების ჩატვირთვისას:", error);
        }
    }

    async function loadMyListings() {
        grid.innerHTML = '<div style="text-align:center; width: 100%; padding: 40px; color:#fff;">⏳ მონაცემები იტვირთება ბაზიდან...</div>';
        
        try {
            const querySnapshot = await getDocs(collection(db, "listings"));
            let myListings = [];

            querySnapshot.forEach(docSnap => {
                const listing = docSnap.data();
                const hostEmail = (listing.hostEmail || '').trim().toLowerCase();
                
                if (hostEmail === currentUserEmail) {
                    myListings.push({ id: docSnap.id, ...listing });
                }
            });

            grid.innerHTML = '';

            if (myListings.length === 0) {
                grid.innerHTML = `
                    <div class="no-results-box" style="grid-column: 1 / -1; text-align: center; padding: 50px; background: rgba(255,255,255,0.1); border-radius: 12px;">
                        <h3 style="color: black; margin-bottom: 10px;">ჯერ არაფერი დაგიმატებიათ</h3>
                        <p style="color: #a0c4bc; margin-bottom: 20px;"></p>
                        <a href="add-listing.html" style="background: #febb02; color: #0b3127; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">პირველი განცხადების დამატება</a>
                    </div>`;
                return;
            }

            myListings.forEach(listing => {
                const mainImage = (listing.images && listing.images.length > 0) ? listing.images[0] : 'placeholder.jpg';
                
                const card = document.createElement('div');
                card.className = 'listing-card';
                
                card.innerHTML = `
                    <img src="${mainImage}" alt="${listing.title}" class="card-image" style="object-fit: cover;">
                    <div class="card-content">
                        <h3 class="card-title">${listing.title}</h3>
                        <div class="card-location">📍 ${listing.location}</div>
                        
                        <div class="price" style="margin-top: 10px;">
                            ${listing.price}₾ <span>/ ღამე</span>
                        </div>
                        
                        <div class="my-listing-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="edit-btn" onclick="editListing('${listing.id}')" style="flex:1; background:#febb02; border:none; padding:8px; border-radius:5px; font-weight:bold; cursor:pointer;">რედაქტირება</button>
                            <button class="delete-btn" onclick="deleteListing('${listing.id}')" style="flex:1; background:#ff4d4d; color:white; border:none; padding:8px; border-radius:5px; font-weight:bold; cursor:pointer;">წაშლა</button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (error) {
            console.error("შეცდომა განცხადებების წამოღებისას:", error);
            grid.innerHTML = '<div style="color:red; text-align:center; padding: 20px;">შეცდომა მონაცემების ჩატვირთვისას.</div>';
        }
    }

    loadPendingBookings();
    loadMyListings();

    window.confirmBooking = async function(bookingId, listingId, checkIn, checkOut, room) {
        if (!confirm("ნამდვილად ჩაგერიცხათ თანხა? ამის შემდეგ თარიღები ავტომატურად ჩაიკეტება საიტზე.")) {
            return;
        }

        try {
            const bookingRef = doc(db, "bookings", bookingId);
            await updateDoc(bookingRef, { status: "confirmed" });

            const listingRef = doc(db, "listings", listingId);
            const listingSnap = await getDoc(listingRef);

            if (listingSnap.exists()) {
                let listingData = listingSnap.data();
                let blockedDates = listingData.blockedDates || [];
                
                blockedDates.push({ start: checkIn, end: checkOut, room: room });
                await updateDoc(listingRef, { blockedDates: blockedDates });
            }

            alert("✅ ჯავშანი დადასტურებულია! თარიღები კალენდარში ჩაიკეტა.");
            loadPendingBookings(); 

        } catch (error) {
            console.error("შეცდომა ჯავშნის დადასტურებისას:", error);
            alert("სისტემური შეცდომა. სცადეთ მოგვიანებით.");
        }
    };

    window.deleteListing = async function(id) {
        if (confirm("ნამდვილად გსურთ ამ განცხადების სამუდამოდ წაშლა?")) {
            try {
                await deleteDoc(doc(db, "listings", id));
                alert("განცხადება წარმატებით წაიშალა.");
                loadMyListings(); 
            } catch (error) {
                console.error("წაშლის შეცდომა:", error);
                alert("შეცდომა განცხადების წაშლისას.");
            }
        }
    };

    window.editListing = function(id) {
        window.location.href = `edit-listing.html?id=${id}`;
    };
});