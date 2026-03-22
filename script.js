document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const header = document.querySelector('.header');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.classList.add('mobile-menu-overlay');

    // Copy nav links to overlay
    const navLinks = document.querySelector('.nav-links').cloneNode(true);
    navLinks.style.display = 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.alignItems = 'center';

    overlay.appendChild(navLinks);
    document.body.appendChild(overlay);

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when a link is clicked
    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Header scroll background change
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Parallax effect for hero image
    const heroBg = document.querySelector('.parallax-img');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (heroBg && scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
    });

    // Intersection Observer for scroll animations
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade');

    const revealOpts = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOpts);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // Room Gallery Modal Logic
    const galleryModal = document.getElementById('roomGalleryModal');
    const openGalleryBtn = document.getElementById('openGalleryBtn');
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');
    const galleryMainImg = document.getElementById('galleryMainImg');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const thumbs = document.querySelectorAll('.thumb');

    let currentImageIndex = 1;
    const totalImages = 10;

    if (openGalleryBtn && galleryModal) {
        openGalleryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            galleryModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateGallery(currentImageIndex);
        });

        closeGalleryBtn.addEventListener('click', () => {
            galleryModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close on background click
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                galleryModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentImageIndex = currentImageIndex > 1 ? currentImageIndex - 1 : totalImages;
                updateGallery(currentImageIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentImageIndex = currentImageIndex < totalImages ? currentImageIndex + 1 : 1;
                updateGallery(currentImageIndex);
            });
        }
    }

    window.setGalleryImage = function (index) {
        currentImageIndex = index;
        updateGallery(index);
    };

    function updateGallery(index) {
        if (!galleryMainImg) return;
        galleryMainImg.src = `room ${index}.jpg`;
        thumbs.forEach(t => t.classList.remove('active'));
        if (thumbs[index - 1]) {
            thumbs[index - 1].classList.add('active');
            thumbs[index - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Fetch Rooms from Strapi CMS
    const roomsList = document.getElementById('rooms-list');
    if (roomsList) {
        // Set some basic styling to hold images
        roomsList.style.listStyle = "none";
        roomsList.style.padding = "0";

        fetch('http://localhost:1337/api/rooms?populate=*')
            .then(res => res.json())
            .then(data => {
                const rooms = data.data || [];
                if (rooms.length > 0) {
                    roomsList.innerHTML = '';
                    rooms.forEach(room => {
                        const title = room.title || (room.attributes && room.attributes.title) || 'Unnamed Room';
                        const price = room.price || (room.attributes && room.attributes.price) || '';
                        
                        // Extract Image URL
                        let imageUrl = '';
                        const imgData = room.image || (room.attributes && room.attributes.image && room.attributes.image.data);
                        if (imgData) {
                            // Fix relative path from Strapi
                            const rawUrl = imgData.url || (imgData.attributes && imgData.attributes.url);
                            if (rawUrl) {
                                imageUrl = rawUrl.startsWith('/') ? 'http://localhost:1337' + rawUrl : rawUrl;
                            }
                        }

                        const li = document.createElement('li');
                        li.style.display = "flex";
                        li.style.alignItems = "center";
                        li.style.marginBottom = "15px";
                        li.style.background = "#fff";
                        li.style.padding = "10px";
                        li.style.borderRadius = "8px";
                        li.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";

                        // Add image HTML if it exists
                        const imgHtml = imageUrl 
                            ? `<img src="${imageUrl}" alt="${title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; margin-right: 15px;">` 
                            : `<div style="width: 80px; height: 80px; background: #eee; border-radius: 6px; margin-right: 15px; display: flex; align-items:center; justify-content:center; color:#999; font-size:12px;">No Image</div>`;

                        li.innerHTML = `
                            ${imgHtml}
                            <div>
                                <strong style="display:block; font-size:1.1rem; color:#333;">${title}</strong>
                                ${price ? '<span style="color:var(--primary); font-weight:600;">₹' + price + ' /night</span>' : ''}
                            </div>
                        `;
                        roomsList.appendChild(li);
                    });
                } else {
                    roomsList.innerHTML = '<li>Check back soon for available rooms. Add some in the Strapi Admin!</li>';
                }
            })
            .catch(err => {
                console.error('Error fetching rooms:', err);
                roomsList.innerHTML = '<li>Error loading rooms. Please make sure Strapi is running.</li>';
            });
    }

    // Helper to get image url from Strapi data
    function getStrapiImageUrl(imageField) {
        if (!imageField) return null;
        // Strapi v5 media fields can be an array if "multiple: true" was used
        let imgData = imageField.data || imageField; 
        if (Array.isArray(imgData)) imgData = imgData[0]; // Take first image if multiple
        if (!imgData) return null;
        let url = imgData.url || (imgData.attributes && imgData.attributes.url);
        if (!url) return null;
        return url.startsWith('/') ? 'http://localhost:1337' + url : url;
    }

    // Helper to render Strapi Blocks rich text
    function renderStrapiBlocks(blocks) {
        if (!blocks || !Array.isArray(blocks)) return '';
        return blocks.map(block => {
            if (block.type === 'paragraph') {
                const content = block.children.map(child => {
                    let text = child.text || '';
                    if (child.bold) text = `<strong>${text}</strong>`;
                    if (child.italic) text = `<em>${text}</em>`;
                    if (child.underline) text = `<u>${text}</u>`;
                    return text;
                }).join('');
                return `<p>${content}</p>`;
            }
            if (block.type === 'heading') {
                const level = block.level || 2;
                const content = block.children.map(child => child.text).join('');
                return `<h${level}>${content}</h${level}>`;
            }
            return '';
        }).join('');
    }

    // Fetch Homepage Hero
    fetch('http://localhost:1337/api/homepage?populate=*')
        .then(res => res.json())
        .then(res => {
            const data = res.data;
            if (data) {
                const title = data.heroTitle || (data.attributes && data.attributes.heroTitle);
                const subtitle = data.heroSubtitle || (data.attributes && data.attributes.heroSubtitle);
                const image = getStrapiImageUrl(data.heroImage || (data.attributes && data.attributes.heroImage));
                
                if (title) document.getElementById('hero-title').innerHTML = title;
                if (subtitle) document.getElementById('hero-subtitle').innerHTML = subtitle;
                if (image) document.getElementById('hero-img').src = image;
            }
        }).catch(err => console.log('Homepage fetch error:', err));

    // Fetch About
    fetch('http://localhost:1337/api/about?populate=*')
        .then(res => res.json())
        .then(res => {
            const data = res.data;
            if (data) {
                const title = data.title || (data.attributes && data.attributes.title);
                const descBlocks = data.description || (data.attributes && data.attributes.description);
                const image = getStrapiImageUrl(data.image || (data.attributes && data.attributes.image));
                
                if (title) document.getElementById('about-title').innerHTML = title;
                if (descBlocks) document.getElementById('about-description').innerHTML = renderStrapiBlocks(descBlocks);
                if (image) document.getElementById('about-img').src = image;
            }
        }).catch(err => console.log('About fetch error:', err));

    // Fetch Facilities (Services)
    const facilitiesList = document.getElementById('facilities-list');
    if (facilitiesList) {
        fetch('http://localhost:1337/api/services?populate=*')
            .then(res => res.json())
            .then(res => {
                const items = res.data || [];
                if (items.length > 0) {
                    facilitiesList.innerHTML = '';
                    items.forEach(item => {
                        const name = item.name || (item.attributes && item.attributes.name) || 'Facility';
                        const desc = item.description || (item.attributes && item.attributes.description) || '';
                        
                        // The user manually added an 'Image' field to their service. We check for 'Image' or 'icon'
                        const image = getStrapiImageUrl(item.Image || item.icon || (item.attributes && (item.attributes.Image || item.attributes.icon)));
                        
                        const imgHtml = image 
                            ? `<img src="${image}" alt="${name}" style="width:100%; height:150px; object-fit:cover; border-radius:8px 8px 0 0; margin-bottom:15px;">`
                            : `<div class="card-icon" style="font-size:3rem; margin-bottom:15px; padding-top: 20px;">🏨</div>`;
                            
                        const card = document.createElement('div');
                        card.className = "card glass-card";
                        card.style.background = "white";
                        card.style.padding = image ? "0 0 20px 0" : "30px";
                        card.style.overflow = "hidden";
                        
                        card.innerHTML = `
                            ${imgHtml}
                            <div style="padding: 0 20px;">
                                <h3>${name}</h3>
                                <p>${desc}</p>
                            </div>
                        `;
                        facilitiesList.appendChild(card);
                    });
                } else {
                    facilitiesList.innerHTML = '<p>Check back soon for our facilities.</p>';
                }
            }).catch(err => console.log('Facilities fetch error:', err));
    }

    // Fetch Offers
    const offersList = document.getElementById('offers-list');
    if (offersList) {
        fetch('http://localhost:1337/api/offers?populate=*')
            .then(res => res.json())
            .then(res => {
                const items = res.data || [];
                if (items.length > 0) {
                    offersList.innerHTML = '';
                    items.forEach(item => {
                        const title = item.title || (item.attributes && item.attributes.title) || 'Special Offer';
                        const descBlocks = item.description || (item.attributes && item.attributes.description);
                        const image = getStrapiImageUrl(item.image || (item.attributes && item.attributes.image));
                        
                        const imgHtml = image 
                            ? `<img src="${image}" alt="${title}" style="width:100%; height:200px; object-fit:cover; border-radius:8px 8px 0 0; margin-bottom:15px;">`
                            : `<div class="card-icon" style="font-size:3rem; margin-bottom:15px; padding-top:20px;">🎁</div>`;
                            
                        const card = document.createElement('div');
                        card.className = "card glass-card";
                        card.style.background = "white";
                        card.style.padding = image ? "0 0 20px 0" : "30px";
                        card.style.overflow = "hidden";
                        
                        card.innerHTML = `
                            ${imgHtml}
                            <div style="padding: 0 20px;">
                                <h3>${title}</h3>
                                ${renderStrapiBlocks(descBlocks)}
                            </div>
                        `;
                        offersList.appendChild(card);
                    });
                } else {
                    offersList.innerHTML = '<p>No special offers at this time.</p>';
                }
            }).catch(err => console.log('Offers fetch error:', err));
    }

    // Fetch Dining
    fetch('http://localhost:1337/api/dining?populate=*')
        .then(res => res.json())
        .then(res => {
            const data = res.data;
            if (data) {
                const title = data.title || (data.attributes && data.attributes.title);
                const descBlocks = data.description || (data.attributes && data.attributes.description);
                const image = getStrapiImageUrl(data.image || (data.attributes && data.attributes.image));
                
                if (title) document.getElementById('dining-title').innerHTML = title;
                if (descBlocks) document.getElementById('dining-desc').innerHTML = renderStrapiBlocks(descBlocks);
                if (image) document.getElementById('dining-img').src = image;
            }
        }).catch(err => console.log('Dining fetch error:', err));

    // Fetch Reviews
    const reviewsList = document.getElementById('reviews-list');
    if (reviewsList) {
        fetch('http://localhost:1337/api/reviews?populate=*&filters[approved][$eq]=true&sort=createdAt:desc')
            .then(res => res.json())
            .then(res => {
                const items = res.data || [];
                if (items.length > 0) {
                    reviewsList.innerHTML = '';
                    items.forEach(item => {
                        const name = item.name || (item.attributes && item.attributes.name) || 'Anonymous';
                        const rating = item.rating || (item.attributes && item.attributes.rating) || 5;
                        const content = item.content || (item.attributes && item.attributes.content) || '';
                        
                        let starsHtml = '';
                        for (let i = 0; i < 5; i++) {
                            starsHtml += i < rating ? '★' : '☆';
                        }
                        
                        const card = document.createElement('div');
                        card.className = "review-card";
                        card.innerHTML = `
                            <div class="review-header">
                                <span class="review-author">${name}</span>
                                <span class="stars">${starsHtml}</span>
                            </div>
                            <p class="review-body">"${content}"</p>
                        `;
                        reviewsList.appendChild(card);
                    });
                } else {
                    reviewsList.innerHTML = '<p>No reviews yet. Be the first to share your experience!</p>';
                }
            }).catch(err => console.log('Reviews fetch error:', err));
    }

    // Handle Review Form Submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reviewer-name').value;
            const content = document.getElementById('review-content').value;
            let rating = 5;
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            if (ratingInput) rating = parseInt(ratingInput.value);
            
            const submitMsg = document.getElementById('review-submit-msg');
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            
            submitBtn.textContent = "Submitting...";
            submitBtn.disabled = true;

            fetch('http://localhost:1337/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: { name, rating, content, approved: false }
                })
            })
            .then(res => {
                if(res.ok) {
                    reviewForm.reset();
                    submitMsg.textContent = "Thank you! Your review has been submitted and is pending approval.";
                    submitMsg.style.display = "block";
                    submitMsg.style.color = "var(--primary)";
                } else {
                    throw new Error("Failed to submit");
                }
            })
            .catch(err => {
                submitMsg.textContent = "An error occurred. Please try again later.";
                submitMsg.style.display = "block";
                submitMsg.style.color = "red";
                console.error("Review Submit Error:", err);
            })
            .finally(() => {
                submitBtn.textContent = "Submit Review";
                submitBtn.disabled = false;
                setTimeout(() => submitMsg.style.display = "none", 5000);
            });
        });
    }

});
