import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    
    const countries = [
        { name: "საქართველო", code: "+995", iso: "ge" },
        { name: "დიდი ბრიტანეთი", code: "+44", iso: "gb" },
        { name: "გერმანია", code: "+49", iso: "de" },
        { name: "საფრანგეთი", code: "+33", iso: "fr" },
        { name: "იტალია", code: "+39", iso: "it" },
        { name: "ესპანეთი", code: "+34", iso: "es" },
        { name: "პოლონეთი", code: "+48", iso: "pl" },
        { name: "უკრაინა", code: "+380", iso: "ua" },
        { name: "საბერძნეთი", code: "+30", iso: "gr" },
        { name: "ავსტრია", code: "+43", iso: "at" },
        { name: "შვეიცარია", code: "+41", iso: "ch" },
        { name: "ნიდერლანდები", code: "+31", iso: "nl" },
        { name: "ბელგია", code: "+32", iso: "be" },
        { name: "შვედეთი", code: "+46", iso: "se" },
        { name: "ნორვეგია", code: "+47", iso: "no" },
        { name: "დანია", code: "+45", iso: "dk" },
        { name: "ფინეთი", code: "+358", iso: "fi" },
        { name: "ჩეხეთი", code: "+420", iso: "cz" },
        { name: "სლოვაკეთი", code: "+421", iso: "sk" },
        { name: "უნგრეთი", code: "+36", iso: "hu" },
        { name: "რუმინეთი", code: "+40", iso: "ro" },
        { name: "ბულგარეთი", code: "+359", iso: "bg" },
        { name: "ხორვატია", code: "+385", iso: "hr" },
        { name: "სერბეთი", code: "+381", iso: "rs" },
        { name: "ბოსნია და ჰერცეგოვინა", code: "+387", iso: "ba" },
        { name: "ჩრდ. მაკედონია", code: "+389", iso: "mk" },
        { name: "მონტენეგრო", code: "+382", iso: "me" },
        { name: "სლოვენია", code: "+386", iso: "si" },
        { name: "ალბანეთი", code: "+355", iso: "al" },
        { name: "ირლანდია", code: "+353", iso: "ie" },
        { name: "პორტუგალია", code: "+351", iso: "pt" },
        { name: "ლიეტუვა", code: "+370", iso: "lt" },
        { name: "ლატვია", code: "+371", iso: "lv" },
        { name: "ესტონეთი", code: "+372", iso: "ee" },
        { name: "ბელარუსი", code: "+375", iso: "by" },
        { name: "მოლდოვა", code: "+373", iso: "md" },
        { name: "ისლანდია", code: "+354", iso: "is" },
        { name: "კვიპროსი", code: "+357", iso: "cy" },
        { name: "მალტა", code: "+356", iso: "mt" },
        { name: "ლუქსემბურგი", code: "+352", iso: "lu" },
        { name: "ანდორა", code: "+376", iso: "ad" },
        { name: "მონაკო", code: "+377", iso: "mc" },
        { name: "სან-მარინო", code: "+378", iso: "sm" },
        { name: "ვატიკანი", code: "+379", iso: "va" },
        { name: "ლიხტენშტაინი", code: "+423", iso: "li" },
        { name: "აშშ", code: "+1", iso: "us" },
        { name: "კანადა", code: "+1", iso: "ca" },
        { name: "მექსიკა", code: "+52", iso: "mx" },
        { name: "ბრაზილია", code: "+55", iso: "br" },
        { name: "არგენტინა", code: "+54", iso: "ar" },
        { name: "კოლუმბია", code: "+57", iso: "co" },
        { name: "ჩილე", code: "+56", iso: "cl" },
        { name: "პერუ", code: "+51", iso: "pe" },
        { name: "ვენესუელა", code: "+58", iso: "ve" },
        { name: "ეკვადორი", code: "+593", iso: "ec" },
        { name: "გვატემალა", code: "+502", iso: "gt" },
        { name: "კუბა", code: "+53", iso: "cu" },
        { name: "ბოლივია", code: "+591", iso: "bo" },
        { name: "ჰაიტი", code: "+509", iso: "ht" },
        { name: "დომინიკელთა რესპ.", code: "+1", iso: "do" },
        { name: "ჰონდურასი", code: "+504", iso: "hn" },
        { name: "პარაგვაი", code: "+595", iso: "py" },
        { name: "ელ-სალვადორი", code: "+503", iso: "sv" },
        { name: "ნიკარაგუა", code: "+505", iso: "ni" },
        { name: "კოსტა-რიკა", code: "+506", iso: "cr" },
        { name: "პანამა", code: "+507", iso: "pa" },
        { name: "ურუგვაი", code: "+598", iso: "uy" },
        { name: "იამაიკა", code: "+1", iso: "jm" },
        { name: "თურქეთი", code: "+90", iso: "tr" },
        { name: "სომხეთი", code: "+374", iso: "am" },
        { name: "აზერბაიჯანი", code: "+994", iso: "az" },
        { name: "რუსეთი", code: "+7", iso: "ru" },
        { name: "ყაზახეთი", code: "+7", iso: "kz" },
        { name: "უზბეკეთი", code: "+998", iso: "uz" },
        { name: "ტაჯიკეთი", code: "+992", iso: "tj" },
        { name: "ყირგიზეთი", code: "+996", iso: "kg" },
        { name: "თურქმენეთი", code: "+993", iso: "tm" },
        { name: "ჩინეთი", code: "+86", iso: "cn" },
        { name: "იაპონია", code: "+81", iso: "jp" },
        { name: "სამხრეთ კორეა", code: "+82", iso: "kr" },
        { name: "ინდოეთი", code: "+91", iso: "in" },
        { name: "პაკისტანი", code: "+92", iso: "pk" },
        { name: "ავღანეთი", code: "+93", iso: "af" },
        { name: "ბანგლადეში", code: "+880", iso: "bd" },
        { name: "ინდონეზია", code: "+62", iso: "id" },
        { name: "მალაიზია", code: "+60", iso: "my" },
        { name: "სინგაპური", code: "+65", iso: "sg" },
        { name: "ვიეტნამი", code: "+84", iso: "vn" },
        { name: "ტაილანდი", code: "+66", iso: "th" },
        { name: "ფილიპინები", code: "+63", iso: "ph" },
        { name: "მიანმარი", code: "+95", iso: "mm" },
        { name: "ნეპალი", code: "+977", iso: "np" },
        { name: "შრი-ლანკა", code: "+94", iso: "lk" },
        { name: "ტაივანი", code: "+886", iso: "tw" },
        { name: "კამბოჯა", code: "+855", iso: "kh" },
        { name: "მონღოლეთი", code: "+976", iso: "mn" },
        { name: "მალდივები", code: "+960", iso: "mv" },
        { name: "საამიროები (UAE)", code: "+971", iso: "ae" },
        { name: "საუდის არაბეთი", code: "+966", iso: "sa" },
        { name: "კატარი", code: "+974", iso: "qa" },
        { name: "ქუვეითი", code: "+965", iso: "kw" },
        { name: "ომანი", code: "+968", iso: "om" },
        { name: "ბაჰრეინი", code: "+973", iso: "bh" },
        { name: "ეგვიპტე", code: "+20", iso: "eg" },
        { name: "იორდანია", code: "+962", iso: "jo" },
        { name: "ლიბანი", code: "+961", iso: "lb" },
        { name: "ერაყი", code: "+964", iso: "iq" },
        { name: "სირია", code: "+963", iso: "sy" },
        { name: "იემენი", code: "+967", iso: "ye" },
        { name: "მაროკო", code: "+212", iso: "ma" },
        { name: "ალჟირი", code: "+213", iso: "dz" },
        { name: "ტუნისი", code: "+216", iso: "tn" },
        { name: "ლიბია", code: "+218", iso: "ly" },
        { name: "პალესტინა", code: "+970", iso: "ps" },
        { name: "ისრაელი", code: "+972", iso: "il" },
        { name: "ირანი", code: "+98", iso: "ir" },
        { name: "სამხრეთ აფრიკა", code: "+27", iso: "za" },
        { name: "ნიგერია", code: "+234", iso: "ng" },
        { name: "ეთიოპია", code: "+251", iso: "et" },
        { name: "ტანზანია", code: "+255", iso: "tz" },
        { name: "კენია", code: "+254", iso: "ke" },
        { name: "უგანდა", code: "+256", iso: "ug" },
        { name: "სუდანი", code: "+249", iso: "sd" },
        { name: "ანგოლა", code: "+244", iso: "ao" },
        { name: "მოზამბიკი", code: "+258", iso: "mz" },
        { name: "განა", code: "+233", iso: "gh" },
        { name: "მადაგასკარი", code: "+261", iso: "mg" },
        { name: "კამერუნი", code: "+237", iso: "cm" },
        { name: "კოტ-დ'ივუარი", code: "+225", iso: "ci" },
        { name: "სენეგალი", code: "+221", iso: "sn" },
        { name: "ზიმბაბვე", code: "+263", iso: "zw" },
        { name: "რუანდა", code: "+250", iso: "rw" },
        { name: "ნამიბია", code: "+264", iso: "na" },
        { name: "ავსტრალია", code: "+61", iso: "au" },
        { name: "ახალი ზელანდია", code: "+64", iso: "nz" },
        { name: "პაპუა-ახალი გვინეა", code: "+675", iso: "pg" },
        { name: "ფიჯი", code: "+679", iso: "fj" },
        { name: "ვანუატუ", code: "+678", iso: "vu" },
        { name: "სამოა", code: "+685", iso: "ws" }
    ];

    const selectedCountry = document.getElementById('selectedCountry');
    const countryDropdown = document.getElementById('countryDropdown');
    const countryList = document.getElementById('countryList');
    const selectedFlag = document.getElementById('selectedFlag');
    const selectedCodeText = document.getElementById('selectedCodeText');
    const regCountryCodeInput = document.getElementById('regCountryCodeInput');
    const countrySearch = document.getElementById('countrySearch');

    if (countryDropdown && countryList) {
        
        function renderOptions(filterText = "") {
            countryList.innerHTML = ''; 
            
            const filteredCountries = countries.filter(country => 
                country.name.toLowerCase().includes(filterText.toLowerCase()) || 
                country.code.includes(filterText)
            );

            if (filteredCountries.length === 0) {
                countryList.innerHTML = '<div style="padding: 10px; color: #a0c4bc; font-size: 13px; text-align: center;">ვერ მოიძებნა</div>';
                return;
            }

            filteredCountries.forEach(country => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'custom-option';
                optionDiv.innerHTML = `
                    <img src="https://flagcdn.com/w20/${country.iso}.png" alt="${country.iso}">
                    <span>${country.name} (${country.code})</span>
                `;
                
                optionDiv.addEventListener('click', () => {
                    selectedFlag.src = `https://flagcdn.com/w20/${country.iso}.png`;
                    selectedCodeText.innerText = country.code;
                    regCountryCodeInput.value = country.code;
                    countryDropdown.style.display = 'none';
                    countrySearch.value = ''; 
                    renderOptions(); 
                });
                
                countryList.appendChild(optionDiv);
            });
        }

        renderOptions();

        countrySearch.addEventListener('input', (e) => {
            renderOptions(e.target.value);
        });

        selectedCountry.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const isClosed = countryDropdown.style.display === 'none' || countryDropdown.style.display === '';
            
            if (isClosed) {
                countryDropdown.style.display = 'block';
                countrySearch.focus(); 
            } else {
                countryDropdown.style.display = 'none';
            }
        });

        countrySearch.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
            if (!selectedCountry.contains(e.target) && !countryDropdown.contains(e.target)) {
                countryDropdown.style.display = 'none';
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('regFirstName').value.trim();
            const lastName = document.getElementById('regLastName').value.trim();
            const countryCode = document.getElementById('regCountryCodeInput').value;
            const phoneNumber = document.getElementById('regPhone').value.trim();
            const fullPhone = `${countryCode} ${phoneNumber}`; 
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;

            if (!firstName || !lastName || !phoneNumber || !email || !password) {
                alert("გთხოვთ შეავსოთ ყველა ველი!");
                return;
            }

            if (password.length < 6) {
                alert("პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს!");
                return;
            }

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "მიმდინარეობს რეგისტრაცია ⏳...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, {
                    displayName: `${firstName} ${lastName}`
                });

                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    firstName: firstName,
                    lastName: lastName,
                    phone: fullPhone,
                    email: email,
                    avatar: "", 
                    role: "user", 
                    createdAt: new Date().toISOString()
                });

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('staygeo_user_profile', JSON.stringify({
                    uid: user.uid,
                    name: `${firstName} ${lastName}`,
                    email: email,
                    phone: fullPhone,
                    avatar: ""
                }));

                alert("✅ რეგისტრაცია წარმატებით დასრულდა! ახლა შეგიძლიათ გაიაროთ ავტორიზაცია.");
                window.location.href = "login.html";

            } catch (err) {
                console.error(err);
                
                let errorMessage = "დაფიქსირდა შეცდომა. სცადეთ მოგვიანებით.";
                
                if (err.code === 'auth/email-already-in-use') {
                    errorMessage = "ამ ელ-ფოსტით მომხმარებელი უკვე რეგისტრირებულია.";
                } else if (err.code === 'auth/weak-password') {
                    errorMessage = "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.";
                } else if (err.code === 'auth/invalid-email') {
                    errorMessage = "ელ-ფოსტის ფორმატი არასწორია.";
                } else if (err.code === 'auth/network-request-failed') {
                    errorMessage = "ინტერნეტთან კავშირი გაწყვეტილია.";
                }
                
                alert(`❌ ${errorMessage}`);
                
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        });
    }
});