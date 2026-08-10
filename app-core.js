document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loader = document.getElementById('loader');
    const menuContainer = document.getElementById('menu-container');
    const categoryNav = document.getElementById('category-nav');
    
    // Cart UI Elements
    const cartFab = document.getElementById('cart-fab');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Success Modal UI Elements
    const successModal = document.getElementById('success-modal');
    const closeSuccessBtn = document.getElementById('close-success');
    
    // Payment Modal UI Elements
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentBtn = document.getElementById('close-payment');
    const paymentAmount = document.getElementById('payment-amount');
    const paymentWallet = document.getElementById('payment-wallet');
    const whatsappConfirmBtn = document.getElementById('whatsapp-confirm-btn');

    // Addons Modal UI
    const addonsModal = document.getElementById('addons-modal');
    const closeAddonsModalBtn = document.getElementById('close-addons-modal');
    const addonsItemName = document.getElementById('addons-item-name');
    const addonsFreeLimitText = document.getElementById('addons-free-limit-text');
    const addonsList = document.getElementById('addons-container') || document.getElementById('addons-list');
    const addonsPriceDisplay = document.getElementById('addons-price-display');
    const confirmAddonsBtn = document.getElementById('confirm-addons-btn');
    
    let currentAddonProduct = null;
    let windowGlobalAddons = [];

    // Toast UI
    const toast = document.getElementById('toast');

    let cart = [];
    let currentMarketing = null;
    let cloudinaryConfig = null;
    let dbUrl = FIREBASE_DB_URL;
    if (!dbUrl.endsWith('/')) {
        dbUrl += '/';
    }

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    };

    async function fetchWithVersion(url) {
        try {
            const vRes = await fetch(`${FIREBASE_DB_URL}/version.json?t=${new Date().getTime()}`);
            if (vRes.ok) {
                const vData = await vRes.json();
                if (vData && vData.version) {
                    return await fetch(`${url}?v=${vData.version}`);
                }
            }
        } catch (e) {
            console.warn('Version check failed', e);
        }
        // Fallback to generic timestamp if version file fails or is missing
        return await fetch(`${url}?t=${new Date().getTime()}`);
    }

    const fetchMenu = async () => {
        try {
            const response = await fetchWithVersion(`${dbUrl}menu.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            if (data) {
                if (data.addOns || data.addons) {
                    windowGlobalAddons = data.addOns || data.addons || [];
                }
                if (data.config || data.Config) {
                    cloudinaryConfig = data.config || data.Config;
                }
                
                if (data.restaurant) {
                    applyRestaurantInfo(data.restaurant);
                }
                if (data.marketing) {
                    applyMarketing(data.marketing);
                }
                if (data.categories) {
                    renderMenu(data.categories);
                } else {
                    showError('لا يوجد أصناف حالياً.');
                }
            } else {
                showError('لا يوجد بيانات حالياً.');
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            showError('حدث خطأ أثناء تحميل المنيو. يرجى المحاولة لاحقاً.');
        }
    };

    const applyRestaurantInfo = (restaurant) => {
        if (!restaurant) return;
        
        const titleEl = document.getElementById('restaurant-title');
        const logoEl = document.getElementById('restaurant-logo');
        
        if (titleEl && restaurant.name) {
            titleEl.textContent = restaurant.name;
        }
        
        if (logoEl && restaurant.logoPath && restaurant.logoPath.trim() !== '') {
            logoEl.src = restaurant.logoPath;
            logoEl.style.display = 'block';
        } else if (logoEl) {
            logoEl.style.display = 'none';
        }
    };

    const applyMarketing = (marketing) => {
        currentMarketing = marketing;
        // Banner
        const banner = document.getElementById('announcement-banner');
        const text = document.getElementById('announcement-text');
        if (banner && text) {
            if (marketing.announcementText && marketing.announcementText.trim() !== '') {
                text.textContent = marketing.announcementText;
                banner.classList.remove('hidden');
            } else {
                banner.classList.add('hidden');
            }
        }

        // Social Media Footer
        const footer = document.getElementById('social-footer');
        let hasLink = false;

        const ensureHttp = (url) => {
            if (!url) return '';
            const trimmed = url.trim();
            if (trimmed === '') return '';
            if (!/^https?:\/\//i.test(trimmed)) {
                return 'https://' + trimmed;
            }
            return trimmed;
        };

        const setLink = (id, url) => {
            const el = document.getElementById(id);
            if (el) {
                const validUrl = ensureHttp(url);
                if (validUrl) {
                    el.href = validUrl;
                    el.classList.remove('hidden');
                    hasLink = true;
                } else {
                    el.classList.add('hidden');
                }
            }
        };

        setLink('link-facebook', marketing.facebookLink);
        setLink('link-instagram', marketing.instagramLink);
        setLink('link-tiktok', marketing.tikTokLink);
        setLink('link-whatsapp', marketing.whatsAppLink);
        setLink('link-googlemaps', marketing.googleMapsLink);

        if (footer) {
            if (hasLink) {
                footer.classList.remove('hidden');
            } else {
                footer.classList.add('hidden');
            }
        }
    };

    const renderMenu = (categories) => {
        menuContainer.innerHTML = ''; 
        if (categoryNav) categoryNav.innerHTML = '';

        categories.forEach((category, index) => {
            const products = category.products || [];
            
            const categoryId = `cat-${index}`;

            // Create Nav Button
            if (categoryNav) {
                const navBtn = document.createElement('button');
                navBtn.className = 'category-nav-btn';
                if (index === 0) navBtn.classList.add('active');
                navBtn.textContent = category.name;
                navBtn.onclick = () => {
                    document.querySelectorAll('.category-nav-btn').forEach(btn => btn.classList.remove('active'));
                    navBtn.classList.add('active');
                    document.getElementById(categoryId).scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
                categoryNav.appendChild(navBtn);
            }

            // Create Section
            const section = document.createElement('section');
            section.id = categoryId;
            section.className = 'category-section';
            
            section.innerHTML = `<h2 class="category-title">${category.name}</h2>`;
            
            const grid = document.createElement('div');
            grid.className = 'products-grid swiper-wrapper';

            if (products.length === 0) {
                grid.innerHTML = '<p class="text-center w-100 swiper-slide" style="color: #64748b;">لا توجد أصناف في هذا القسم حالياً.</p>';
            } else {
                products.forEach(product => {
                    const card = document.createElement('div');
                    card.className = `product-card swiper-slide ${product.isSoldOut ? 'sold-out' : ''}`;
                    card.setAttribute('data-aos', 'fade-up');

                    if (product.imagePath) {
                        const img = document.createElement('img');
                        img.src = product.imagePath;
                        img.alt = product.name;
                        img.className = 'product-image';
                        card.appendChild(img);
                    }

                const info = document.createElement('div');
                info.className = 'product-info';

                const name = document.createElement('h3');
                name.className = 'product-name';
                name.textContent = product.name;
                info.appendChild(name);

                const price = document.createElement('p');
                price.className = 'product-price';
                price.textContent = `${parseFloat(product.sellingPrice).toFixed(2)} ج.م`;
                info.appendChild(price);

                if (product.isSoldOut) {
                    const badge = document.createElement('span');
                    badge.className = 'sold-out-badge';
                    badge.textContent = 'نفذ حالياً / Sold Out';
                    info.appendChild(badge);
                  } else {
                      const addBtn = document.createElement('button');
                      addBtn.className = 'add-to-cart-btn';
                      addBtn.textContent = 'إضافة للسلة +';
                      addBtn.onclick = (e) => window.addToCart(product, e);
                      info.appendChild(addBtn);
                  }

                card.appendChild(info);
                grid.appendChild(card);
                });
            }

            const swiperContainer = document.createElement('div');
            swiperContainer.className = 'products-swiper';
            swiperContainer.appendChild(grid);

            section.appendChild(swiperContainer);
            menuContainer.appendChild(section);
        });

        if (window.initDesktop3DMenu) window.initDesktop3DMenu();
        if (window.initMobileSwiper) window.initMobileSwiper();

        loader.style.display = 'none';
        menuContainer.style.display = 'block';
    };
    const showError = (message) => {
        loader.innerHTML = `<p style="color: red; text-align: center; font-weight: bold;">${message}</p>`;
    };

    const isHomePage = document.body.id === 'home-page' || document.body.id === 'about-page';

    if(FIREBASE_DB_URL.includes("YOUR-FIREBASE-PROJECT")) {
        showError('يرجى تحديث رابط config.js لربطه بقاعدة Firebase الخاصة بك.');
    } else {
        if (isHomePage) {
            fetchHomeData();
        } else {
            fetchMenu();
        }
    }

    function fetchHomeData() {
        Promise.all([
            fetchWithVersion(`${FIREBASE_DB_URL}/menu.json`).then(res => res.json()),
            fetchWithVersion(`${FIREBASE_DB_URL}/WebsiteData.json`).then(res => res.json()).catch(() => null)
        ])
        .then(([menuData, websiteData]) => {
            if (menuData) {
                // Find Hot Items
                let hotItems = [];
                const categories = menuData.categories || menuData.Categories;
                if (categories) {
                    categories.forEach(c => {
                        const products = c.products || c.Products;
                        if (products) {
                            products.forEach(p => {
                                if (p.isHotItem || p.IsHotItem) {
                                    hotItems.push(p);
                                }
                            });
                        }
                    });
                }
                renderBestSellers(hotItems);
                
                if (menuData.config || menuData.Config) {
                    cloudinaryConfig = menuData.config || menuData.Config;
                }
            }

            if (websiteData) {
                applyWebsiteData(websiteData);
            }

            fetchApprovedReviews();
        })
        .catch(error => {
            console.error('Error fetching home data:', error);
            showError('حدث خطأ أثناء تحميل بيانات الصفحة الرئيسية.');
        });
    }

    function applyWebsiteData(data) {
        // Theme Colors
        if (data.primaryThemeColor) {
            document.documentElement.style.setProperty('--primary-color', data.primaryThemeColor);
        }

        // Reviews Toggle
        const reviewFab = document.getElementById('review-fab');
        if (reviewFab) {
            if (data.enableReviewsIcon === false) {
                reviewFab.classList.add('hidden');
            } else {
                reviewFab.classList.remove('hidden');
            }
        }

        // Dark Mode
        if (data.enableDarkModeToggle) {
            document.body.classList.add('dark-mode');
        }

        // AOS Animations Toggle
        if (data.enableScrollAnimations === false) {
            const style = document.createElement('style');
            style.innerHTML = '[data-aos] { opacity: 1 !important; transform: none !important; transition: none !important; }';
            document.head.appendChild(style);
        }

        // Popups
        if (data.showPopupOffer && data.popupOfferText && !sessionStorage.getItem('popupSeen')) {
            setTimeout(() => {
                // simple alert for now, could be enhanced to custom modal
                alert(data.popupOfferText);
                sessionStorage.setItem('popupSeen', 'true');
            }, 1500);
        }

        // Hero
        if (data.heroMediaUrl) {
            const heroEl = document.getElementById('hero-section');
            if (heroEl) {
                // Determine if video or image
                if (data.heroMediaUrl.match(/\.(mp4|webm)$/i)) {
                    heroEl.innerHTML = `<video autoplay loop muted playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:0;"><source src="${data.heroMediaUrl}" type="video/mp4"></video>` + heroEl.innerHTML;
                    heroEl.style.backgroundImage = 'none';
                } else {
                    heroEl.style.backgroundImage = `url('${data.heroMediaUrl}')`;
                }
            }
        }
        
        // Story
        if (data.ourStoryText) {
            const storyEl = document.getElementById('story-text-preview');
            if (storyEl) storyEl.innerText = data.ourStoryText;
        }

        // Location & Hours
        if (data.locationAddress) {
            const addrEl = document.getElementById('location-address-preview');
            if (addrEl) addrEl.innerText = data.locationAddress;
        }
        if (data.workingHours) {
            const hoursEl = document.getElementById('location-hours-preview');
            if (hoursEl) hoursEl.innerText = data.workingHours;
        }
        if (data.googleMapsIframe) {
            const mapEl = document.getElementById('map-iframe-preview');
            if (mapEl) {
                let val = data.googleMapsIframe.trim();
                if (val.toLowerCase().startsWith('<iframe')) {
                    mapEl.innerHTML = val;
                } else if (val.startsWith('http') || val.includes('goo.gl') || val.includes('google.com/maps') || val.includes('!3d')) {
                    if (!val.startsWith('http')) val = 'https://' + val;
                    // Try to extract coordinates from URL
                    let lat = '', lng = '';
                    let match = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                    if (match) {
                        lat = match[1]; lng = match[2];
                    } else {
                        match = val.match(/3d(-?\d+\.\d+).*?4d(-?\d+\.\d+)/);
                        if (match) { lat = match[1]; lng = match[2]; }
                    }

                    let query = (lat && lng) ? `${lat},${lng}` : ((data.restaurantName || '') + ' ' + (data.locationAddress || '')).trim();
                    if (!query) query = 'Restaurant';
                    let embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=ar&z=16&output=embed`;

                    mapEl.innerHTML = `
                        <div style="position:relative; width:100%; height:350px; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                            <iframe src="${embedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                            <a href="${val}" target="_blank" style="position:absolute; bottom:15px; left:50%; transform:translateX(-50%); background:#d9480f; color:white; padding:10px 20px; border-radius:30px; font-weight:bold; font-size:14px; text-decoration:none; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; gap:8px; z-index:1000;">
                                <i class="fa-solid fa-map-location-dot"></i> فتح الرابط الأصلي
                            </a>
                        </div>
                    `;
                } else {
                    mapEl.innerHTML = val;
                }
            }
        }

        // Gallery
        if (data.galleryImages) {
            const galleryEl = document.getElementById('gallery-grid');
            if (galleryEl) {
                const urls = data.galleryImages.split(',').filter(url => url.trim() !== '');
                if (urls.length > 0) {
                    galleryEl.innerHTML = '';
                    urls.forEach(url => {
                        const img = document.createElement('img');
                        img.src = url.trim();
                        img.className = 'gallery-img';
                        galleryEl.appendChild(img);
                    });
                }
            }
        }
        
        // B-Roll Video
        if (data.bRollVideoUrl) {
            const brollSection = document.getElementById('broll-section');
            const indexBrollSection = document.getElementById('index-broll-section');
            const videoHtml = `<video autoplay loop muted playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:0;"><source src="${data.bRollVideoUrl}" type="video/mp4"></video>`;
            
            if (brollSection) {
                brollSection.innerHTML = videoHtml + brollSection.innerHTML;
            }
            if (indexBrollSection) {
                indexBrollSection.innerHTML = videoHtml + indexBrollSection.innerHTML;
                indexBrollSection.classList.remove('hidden');
            }
        }

        // Social Links
        const socialFooter = document.getElementById('social-footer');
        let hasSocials = false;
        
        const updateSocialLink = (id, url) => {
            const el = document.getElementById(id);
            if (el) {
                if (url && url.trim() !== '') {
                    el.href = url.startsWith('http') ? url : 'https://' + url;
                    el.classList.remove('hidden');
                    hasSocials = true;
                } else {
                    el.classList.add('hidden');
                }
            }
        };

        updateSocialLink('link-facebook', data.facebookLink);
        updateSocialLink('link-instagram', data.instagramLink);
        updateSocialLink('link-tiktok', data.tikTokLink || data.tiktokLink);
        updateSocialLink('link-whatsapp', data.whatsAppLink || data.whatsappLink);
        updateSocialLink('link-googlemaps', data.googleMapsIframe && data.googleMapsIframe.startsWith('http') ? data.googleMapsIframe : null);

        if (socialFooter) {
            if (hasSocials) {
                socialFooter.classList.remove('hidden');
            } else {
                socialFooter.classList.add('hidden');
            }
        }
        
        // Testimonials can be added similarly if JSON parsed
    }

    async function fetchApprovedReviews() {
        try {
            const response = await fetchWithVersion(`${dbUrl}ApprovedReviews.json`);
            if (response.ok) {
                const data = await response.json();
                const section = document.getElementById('testimonials-section');
                const grid = document.getElementById('testimonials-grid');
                if (data && section && grid) {
                    const reviewsArray = Object.values(data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
                    if (reviewsArray.length > 0) {
                        grid.innerHTML = '';
                        reviewsArray.forEach(review => {
                            const stars = Array(5).fill('<i class="fa-regular fa-star"></i>');
                            for (let i = 0; i < review.rating; i++) {
                                stars[i] = '<i class="fa-solid fa-star" style="color: #F97316;"></i>';
                            }
                            
                            let imgHtml = '';
                            if (review.imageUrl) {
                                imgHtml = `<img src="${review.imageUrl}" alt="Review Image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">`;
                            }
                            
                            grid.innerHTML += `
                                <div class="glass-effect" style="padding: 1.5rem; border-radius: 12px; text-align: right; border: 1px solid rgba(255,255,255,0.1);">
                                    ${imgHtml}
                                    <div style="margin-bottom: 1rem; direction: ltr; display: inline-block;">
                                        ${stars.join('')}
                                    </div>
                                    <p style="font-size: 1.1rem; margin-bottom: 1rem;">"${review.comment}"</p>
                                    <h4 style="color: var(--primary-color);">${review.customerName}</h4>
                                </div>
                            `;
                        });
                        section.style.display = 'block';
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching reviews:', e);
        }
    }

    function renderBestSellers(items) {
        if(loader) loader.style.display = 'none';
        const grid = document.getElementById('best-sellers-grid');
        if (!grid) return;
        
        if (items.length === 0) {
            grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">لا توجد أصناف مميزة حالياً.</p>';
            grid.style.display = 'grid';
            return;
        }

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-aos', 'fade-up');
            
            const imagePath = product.imagePath || product.ImagePath;
            if (imagePath) {
                const img = document.createElement('img');
                img.src = imagePath;
                img.className = 'product-image';
                card.appendChild(img);
            }
            
            const info = document.createElement('div');
            info.className = 'product-info';
            
            const name = document.createElement('h3');
            name.className = 'product-name';
            name.textContent = product.Name || product.name;
            
            const price = document.createElement('p');
            price.className = 'product-price';
            const priceVal = product.SellingPrice || product.sellingPrice;
            price.textContent = `${parseFloat(priceVal).toFixed(2)} ج.م`;
            
            info.appendChild(name);
            info.appendChild(price);
            
            card.appendChild(info);
            
            grid.appendChild(card);
        });
        
        grid.style.display = 'grid';
    }

    // Initialize cart triggers
    const cartTriggers = document.querySelectorAll('.cart-trigger');
    cartTriggers.forEach(trigger => {
        trigger.onclick = (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                showToast("السلة فارغة حالياً");
                return;
            }
            if (cartModal) cartModal.classList.remove('hidden');
        };
    });
    if (closeCartBtn) {
        closeCartBtn.onclick = () => {
            if (cartModal) cartModal.classList.add('hidden');
        };
    }
    if (closeSuccessBtn) closeSuccessBtn.onclick = () => successModal.classList.add('hidden');
    const closeRatingEl = document.getElementById('close-rating');
    if (closeRatingEl && ratingModal) {
        closeRatingEl.onclick = () => ratingModal.classList.add('hidden');
    }
    
    // ======== FLY TO CART ANIMATION ========
    function flyToCart(event) {
        if (!event) return;
        const button = event.target || event.currentTarget;
        if (!button) return;
        
        const cartIcon = document.querySelector('.desktop-nav .cart-trigger') || document.querySelector('.cart-trigger');
        if (!cartIcon) return;
        
        const card = button.closest('.product-card');
        if (!card) return;
        
        const img = card.querySelector('img');
        if (!img) return;
        
        const rect = img.getBoundingClientRect();
        executeFlyAnimation(img.src, rect.left, rect.top, rect.width, rect.height);
    }
    
    function flyToCartSynthetic(x, y) {
        // Fallback for modals: fly a generic dot from the clicked position
        executeFlyAnimation(null, parseFloat(x), parseFloat(y), 40, 40);
    }
    
    function executeFlyAnimation(imgSrc, left, top, width, height) {
        const cartIcon = document.getElementById('cart-fab');
        if (!cartIcon) return;
        
        const flyingEl = document.createElement('div');
        flyingEl.className = 'flying-img';
        flyingEl.style.left = `${left}px`;
        flyingEl.style.top = `${top}px`;
        flyingEl.style.width = `${width}px`;
        flyingEl.style.height = `${height}px`;
        
        if (imgSrc) {
            flyingEl.style.backgroundImage = `url('${imgSrc}')`;
            flyingEl.style.backgroundSize = 'cover';
            flyingEl.style.backgroundPosition = 'center';
            flyingEl.style.borderRadius = '50%';
        } else {
            flyingEl.style.backgroundColor = '#F97316';
            flyingEl.style.borderRadius = '50%';
        }
        
        document.body.appendChild(flyingEl);
        
        // Trigger reflow
        void flyingEl.offsetWidth;
        
        const cartRect = cartIcon.getBoundingClientRect();
        
        // Animate
        flyingEl.style.left = `${cartRect.left + (cartRect.width / 2) - 10}px`;
        flyingEl.style.top = `${cartRect.top + (cartRect.height / 2) - 10}px`;
        flyingEl.style.width = '20px';
        flyingEl.style.height = '20px';
        flyingEl.style.opacity = '0.5';
        
        setTimeout(() => {
            if(document.body.contains(flyingEl)) {
                flyingEl.remove();
            }
            cartIcon.classList.add('bounce');
            setTimeout(() => cartIcon.classList.remove('bounce'), 300);
        }, 600);
    }

        // Weight Modal elements
        const weightModal = document.getElementById('weight-modal');
        const closeWeightModalBtn = document.getElementById('close-weight-modal') || document.getElementById('cancel-weight-btn');
        const weightMinusBtn = document.getElementById('btn-minus-weight');
        const weightPlusBtn = document.getElementById('btn-plus-weight');
        const weightDisplay = document.getElementById('weight-display');
        const weightPriceDisplay = document.getElementById('weight-total-price');
        const confirmWeightBtn = document.getElementById('confirm-weight-btn');
        const weightItemName = document.getElementById('weight-item-name');

        let currentWeightProduct = null;
        let currentWeight = 100; // starting at 100g
        
        if (closeWeightModalBtn) closeWeightModalBtn.onclick = () => weightModal.classList.add('hidden');

        const updateWeightUI = () => {
            if (!currentWeightProduct || !weightDisplay || !weightPriceDisplay) return;
            weightDisplay.innerHTML = `${currentWeight}<span style="font-size:1.5rem;">g</span>`;
            const totalPrice = (currentWeightProduct.sellingPrice / 1000) * currentWeight;
            weightPriceDisplay.textContent = totalPrice.toFixed(2);
        };

        if (weightMinusBtn) {
            weightMinusBtn.onclick = () => {
                if (currentWeight > 100) {
                    currentWeight -= 100;
                    updateWeightUI();
                }
            };
        }

        if (weightPlusBtn) {
            weightPlusBtn.onclick = () => {
                currentWeight += 50;
                updateWeightUI();
            };
        }

        if (confirmWeightBtn) {
            confirmWeightBtn.onclick = () => {
                if (!currentWeightProduct) return;
                
                const totalPrice = (currentWeightProduct.sellingPrice / 1000) * currentWeight;
                
                const customProduct = {
                    ...currentWeightProduct,
                    name: `${currentWeightProduct.name} - ${currentWeight}g`,
                    sellingPrice: totalPrice,
                    isSoldByWeight: false, // Since we've already calculated it
                    IsSoldByWeight: false
                };

                weightModal.classList.add('hidden');
                
                // Now pass the modified product back to addToCart
                window.addToCart(customProduct);
                
                if (weightModal.dataset.sourceX && weightModal.dataset.sourceY) {
                    flyToCartSynthetic(weightModal.dataset.sourceX, weightModal.dataset.sourceY);
                }

                window.addToCart(customProduct);
            };
        }

        window.addToCart = (product, event) => {
            try {
                if (window.triggerHapticFeedback) window.triggerHapticFeedback();
                
                if (product.isSoldByWeight || product.IsSoldByWeight) {
                    currentWeightProduct = product;
                    currentWeight = 100;
                    weightItemName.textContent = product.name || product.Name;
                    updateWeightUI();
                    weightModal.classList.remove('hidden');
                    
                    if(event) {
                        weightModal.dataset.sourceX = event.clientX;
                        weightModal.dataset.sourceY = event.clientY;
                    }
                    return;
                }

                const shouldShowModifiers = product.autoShowModifiers || product.AutoShowModifiers;
                if (shouldShowModifiers && windowGlobalAddons.length > 0) {
                    const validAddons = windowGlobalAddons.filter(addon => {
                        if (!addon.linkedProductIds || addon.linkedProductIds.trim() === '') return false;
                        const ids = addon.linkedProductIds.split(',').map(s => s.trim());
                        const pId = (product.id || product.Id || '').toString();
                        return ids.includes(pId);
                    });

                    if (validAddons.length > 0) {
                        currentAddonProduct = product;
                        addonsItemName.textContent = product.name || product.Name;
                        
                        const limit = product.freeModifiersLimit || product.FreeModifiersLimit || 0;
                        if (limit > 0) {
                            addonsFreeLimitText.textContent = `مسموح لك بـ ${limit} إضافات مجانية`;
                        } else {
                            addonsFreeLimitText.textContent = '';
                        }
                        
                        addonsList.innerHTML = '';
                        validAddons.forEach(addon => {
                            const div = document.createElement('div');
                            div.style.marginBottom = '10px';
                            
                            const label = document.createElement('label');
                            label.style.display = 'flex';
                            label.style.alignItems = 'center';
                            label.style.gap = '10px';
                            label.style.cursor = 'pointer';
                            
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.value = addon.id || addon.Id;
                            cb.dataset.price = addon.price || addon.Price || 0;
                            cb.dataset.name = addon.name || addon.Name;
                            cb.dataset.group = addon.group || addon.Group || 'Free'; 
                            cb.className = 'addon-checkbox';
                            cb.onchange = calculateAddonsPrice;
                            
                            const text = document.createElement('span');
                            text.textContent = `${addon.name || addon.Name} (+${addon.price || addon.Price || 0} ج.م)`;
                            text.style.color = '#333';
                            
                            label.appendChild(cb);
                            label.appendChild(text);
                            div.appendChild(label);
                            addonsList.appendChild(div);
                        });
                        
                        calculateAddonsPrice();
                        addonsModal.classList.remove('hidden');
                        
                        if(event) {
                            addonsModal.dataset.sourceX = event.clientX;
                            addonsModal.dataset.sourceY = event.clientY;
                        }
                        return;
                    }
                }

                const prodName = product.name || product.Name || 'منتج';
                const existing = cart.find(item => (item.product.name || item.product.Name) === prodName);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({ product: { ...product }, quantity: 1 });
                }
                updateCartUI();
                showToast(`تمت إضافة ${prodName} للسلة`);
                
                if(event) {
                    flyToCart(event);
                }
            } catch (err) {
                alert("Error in addToCart: " + err.message);
                console.error(err);
            }
        };

        if (closeAddonsModalBtn) closeAddonsModalBtn.onclick = () => addonsModal.classList.add('hidden');

        const calculateAddonsPrice = () => {
            if (!currentAddonProduct) return;
            const limit = currentAddonProduct.freeModifiersLimit || 0;
            let freeCount = 0;
            let totalAddonsPrice = 0;
            const checkboxes = document.querySelectorAll('.addon-checkbox');
            
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    const price = parseFloat(cb.dataset.price);
                    if (cb.dataset.group === 'Free') {
                        freeCount++;
                        if (freeCount > limit) {
                            totalAddonsPrice += price;
                        }
                    } else {
                        // Paid addons always charge
                        totalAddonsPrice += price;
                    }
                }
            });
            
            const total = currentAddonProduct.sellingPrice + totalAddonsPrice;
            addonsPriceDisplay.textContent = `${total.toFixed(2)} ج.م`;
            return { totalAddonsPrice, total };
        };

        if (confirmAddonsBtn) {
            confirmAddonsBtn.onclick = () => {
                if (!currentAddonProduct) return;
                
                const prices = calculateAddonsPrice();
                const checkboxes = document.querySelectorAll('.addon-checkbox:checked');
                const selectedNames = Array.from(checkboxes).map(cb => cb.dataset.name);
                
                let customName = currentAddonProduct.name;
                if (selectedNames.length > 0) {
                    customName += ' | ' + selectedNames.join(', ');
                }
                
                const customProduct = {
                    ...currentAddonProduct,
                    name: customName,
                    sellingPrice: prices.total,
                    autoShowModifiers: false // don't show again
                };

                const existing = cart.find(item => item.product.name === customProduct.name);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({ product: customProduct, quantity: 1 });
                }
                
                updateCartUI();
                showToast(`تمت إضافة ${currentAddonProduct.name} للسلة`);
                
                // Trigger fly-to-cart animation if we saved the coordinates
                if (addonsModal.dataset.sourceX && addonsModal.dataset.sourceY) {
                    flyToCartSynthetic(addonsModal.dataset.sourceX, addonsModal.dataset.sourceY);
                }
                
                addonsModal.classList.add('hidden');
            };
        }

        window.updateCartQuantity = (productName, delta) => {
            const itemIndex = cart.findIndex(i => i.product.name === productName);
            if (itemIndex > -1) {
                cart[itemIndex].quantity += delta;
                if (cart[itemIndex].quantity <= 0) {
                    cart.splice(itemIndex, 1);
                }
                updateCartUI();
            }
        };

        const updateCartUI = () => {
            if (!cartItemsContainer || !cartTotalPrice) return;
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (cartCount) cartCount.textContent = totalItems;
                        if (totalItems > 0) {
                // We use standard badges in the new layout
                const badges = document.querySelectorAll('.cart-count');
                badges.forEach(b => {
                    b.style.display = 'inline-block';
                    b.textContent = totalItems;
                });
            } else {
                const badges = document.querySelectorAll('.cart-count');
                badges.forEach(b => {
                    b.style.display = 'none';
                    b.textContent = 0;
                });
                if(cartModal) cartModal.classList.add('hidden');
            }

            cartItemsContainer.innerHTML = '';
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.product.sellingPrice * item.quantity;
                total += itemTotal;

                const row = document.createElement('div');
                row.className = 'cart-item';
                row.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.product.name}</div>
                        <div class="cart-item-price">${parseFloat(item.product.sellingPrice).toFixed(2)} ج.م</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.product.name}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity('${item.product.name}', 1)">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(row);
            });

            cartTotalPrice.textContent = total.toFixed(2);
        };

        if (checkoutBtn) checkoutBtn.onclick = async () => {
            const custName = document.getElementById('customer-name').value.trim();
            const custPhone = document.getElementById('customer-phone').value.trim();
            const notes = document.getElementById('order-notes').value.trim();
            const selectedOrderType = document.querySelector('input[name="orderType"]:checked').value;

            if (!custName || !custPhone) {
                alert('يرجى إدخال اسم العميل ورقم الموبايل أولاً!');
                return;
            }

            checkoutBtn.textContent = 'جاري الإرسال...';
            checkoutBtn.disabled = true;

            const orderTotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
            const shortOrderId = "#" + Math.floor(1000 + Math.random() * 9000);
            
            const newOrder = {
                orderDate: new Date().toISOString(),
                customerName: custName,
                customerPhone: custPhone,
                notes: notes,
                totalAmount: orderTotal,
                orderType: selectedOrderType,
                displayOrderId: shortOrderId,
                items: cart.map(item => ({
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.product.sellingPrice
                }))
            };

            try {
                const response = await fetch(`${dbUrl}Orders.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newOrder)
                });

                if (response.ok) {
                    localStorage.setItem('lastCustomerName', custName);
                    localStorage.setItem('lastCustomerPhone', custPhone);
                    
                    cart = [];
                    updateCartUI();
                    document.getElementById('customer-name').value = '';
                    document.getElementById('customer-phone').value = '';
                    document.getElementById('order-notes').value = '';
                    cartModal.classList.add('hidden');
                    
                    if (selectedOrderType === 'PickUp') {
                        paymentAmount.textContent = `${orderTotal.toFixed(2)} ج.م`;
                        const walletNumber = (currentMarketing && currentMarketing.walletNumber) ? currentMarketing.walletNumber : 'غير متوفر';
                        paymentWallet.textContent = walletNumber;
                        
                        whatsappConfirmBtn.onclick = () => {
                            let phoneNum = (currentMarketing && currentMarketing.orderWhatsAppNumber) ? currentMarketing.orderWhatsAppNumber.trim() : '';
                            // Remove any spaces or special characters just in case
                            phoneNum = phoneNum.replace(/\s+/g, '');
                            
                            // Ensure country code (20 for Egypt)
                            if (phoneNum.startsWith('0')) {
                                phoneNum = '20' + phoneNum.substring(1);
                            } else if (!phoneNum.startsWith('20') && !phoneNum.startsWith('+') && phoneNum.length > 0) {
                                phoneNum = '20' + phoneNum;
                            }
                            
                            const msg = `أنا ${custName}، قمت بتحويل مبلغ ${orderTotal} ج.م لتأكيد طلب رقم ${shortOrderId}، (مرفق مع هذه الرسالة سكرين شوت إيصال التحويل).`;
                            const waUrl = `whatsapp://send?phone=${phoneNum}&text=${encodeURIComponent(msg)}`;
                            window.location.href = waUrl;
                            paymentModal.classList.add('hidden');
                        };
                        
                        paymentModal.classList.remove('hidden');
                    } else {
                        successModal.classList.remove('hidden');
                    }
                } else {
                    alert('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
                }
            } catch (error) {
                alert('تعذر الاتصال بالإنترنت.');
            } finally {
                checkoutBtn.textContent = 'تأكيد وإرسال الطلب';
                checkoutBtn.disabled = false;
            }
        };

    // --- Review Logic ---
    const reviewFab = document.getElementById('review-fab');
    const reviewModal = document.getElementById('review-modal');
    const openReviewModalBtn = document.getElementById('open-review-modal');
    const closeReviewModalBtn = document.getElementById('close-review-modal');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    const starIcons = document.querySelectorAll('#star-rating i');
    const reviewImageInput = document.getElementById('review-image');
    const reviewImageName = document.getElementById('review-image-name');
    
    let reviewRating = 0;

    if (openReviewModalBtn && reviewModal) {
        openReviewModalBtn.onclick = () => {
            reviewModal.classList.remove('hidden');
        };
    }

    if (closeReviewModalBtn && reviewModal) {
        closeReviewModalBtn.onclick = () => {
            reviewModal.classList.add('hidden');
        };
    }

    if (reviewImageInput && reviewImageName) {
        reviewImageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                reviewImageName.textContent = e.target.files[0].name;
            } else {
                reviewImageName.textContent = '';
            }
        });
    }

    starIcons.forEach(star => {
        star.onclick = (e) => {
            reviewRating = parseInt(e.target.getAttribute('data-rating'));
            starIcons.forEach(s => {
                if (parseInt(s.getAttribute('data-rating')) <= reviewRating) {
                    s.classList.add('active');
                    s.style.color = '#F97316';
                } else {
                    s.classList.remove('active');
                    s.style.color = '#444';
                }
            });
        };
    });

    if (submitReviewBtn) {
        submitReviewBtn.onclick = async () => {
            if (reviewRating === 0) {
                alert('يرجى اختيار عدد النجوم للتقييم!');
                return;
            }

            const custName = document.getElementById('review-name').value.trim() || 'عميل';
            const reviewComment = document.getElementById('review-comment').value.trim();
            const file = reviewImageInput.files[0];

            submitReviewBtn.textContent = 'جاري الإرسال...';
            submitReviewBtn.disabled = true;

            let imageUrl = '';
            
            // Upload to Cloudinary if file exists and config is ready
            if (file) {
                if (cloudinaryConfig && cloudinaryConfig.cloudinaryCloudName && cloudinaryConfig.cloudinaryUploadPreset) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', cloudinaryConfig.cloudinaryUploadPreset);
                    
                    try {
                        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudinaryCloudName}/image/upload`, {
                            method: 'POST',
                            body: formData
                        });
                        const cloudData = await cloudRes.json();
                        if (cloudData.secure_url) {
                            imageUrl = cloudData.secure_url;
                        }
                    } catch (e) {
                        console.error('Cloudinary upload error:', e);
                        alert('حدث خطأ أثناء رفع الصورة، سيتم إرسال التقييم بدون صورة.');
                    }
                } else {
                    alert('لم يتم إعداد بيانات الرفع للصور. سيتم إرسال التقييم بدون صورة.');
                }
            }

            const reviewData = {
                customerName: custName,
                rating: reviewRating,
                comment: reviewComment,
                imageUrl: imageUrl,
                createdAt: new Date().toISOString(),
                isRead: false
            };

            try {
                const response = await fetch(`${dbUrl}PendingReviews.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviewData)
                });

                if (response.ok) {
                    reviewModal.classList.add('hidden');
                    showToast('تم إرسال تقييمك لمدير المطعم بنجاح. شكراً لك!');
                    
                    // Reset
                    reviewRating = 0;
                    starIcons.forEach(s => { s.classList.remove('active'); s.style.color = '#444'; });
                    document.getElementById('review-name').value = '';
                    document.getElementById('review-comment').value = '';
                    reviewImageInput.value = '';
                    reviewImageName.textContent = '';
                } else {
                    alert('حدث خطأ أثناء إرسال التقييم.');
                }
            } catch (error) {
                alert('تعذر الاتصال بالإنترنت.');
            } finally {
                submitReviewBtn.textContent = 'إرسال التقييم';
                submitReviewBtn.disabled = false;
            }
        };
    }
});
