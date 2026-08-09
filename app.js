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
    const addonsList = document.getElementById('addons-list');
    const addonsPriceDisplay = document.getElementById('addons-price-display');
    const confirmAddonsBtn = document.getElementById('confirm-addons-btn');
    
    let currentAddonProduct = null;
    let windowGlobalAddons = [];

    // Toast UI
    const toast = document.getElementById('toast');

    let cart = [];
    let currentMarketing = null;
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

    const fetchMenu = async () => {
        try {
            const response = await fetch(`${dbUrl}menu.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            if (data) {
                if (data.addOns || data.addons) {
                    windowGlobalAddons = data.addOns || data.addons || [];
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
            grid.className = 'products-grid';

            if (products.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748B; padding: 20px;">لا يوجد منتجات في هذا القسم حالياً.</p>';
            } else {
                products.forEach(product => {
                    const card = document.createElement('div');
                    card.className = `product-card ${product.isSoldOut ? 'sold-out' : ''}`;

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
                      addBtn.onclick = () => window.addToCart(product);
                      info.appendChild(addBtn);
                  }

                card.appendChild(info);
                grid.appendChild(card);
                });
            }

            section.appendChild(grid);
            menuContainer.appendChild(section);
        });

        loader.style.display = 'none';
        menuContainer.style.display = 'block';
    };
    const showError = (message) => {
        loader.innerHTML = `<p style="color: red; text-align: center; font-weight: bold;">${message}</p>`;
    };

    const isHomePage = document.body.id === 'home-page';

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
        const url = `${FIREBASE_DB_URL}/menu.json`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (!data) {
                    showError('لا توجد بيانات في قاعدة البيانات.');
                    return;
                }
                
                // Set Restaurant Info
                const resTitle = document.getElementById('home-restaurant-title');
                const resDesc = document.getElementById('home-restaurant-desc');
                if (data.RestaurantName && resTitle) resTitle.textContent = data.RestaurantName;
                if (data.RestaurantDescription && resDesc) resDesc.textContent = data.RestaurantDescription;

                // Find Hot Items
                let hotItems = [];
                const categories = data.categories || data.Categories;
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
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                showError('حدث خطأ أثناء تحميل البيانات.');
            });
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
            
            const imageContainer = document.createElement('div');
            imageContainer.style.width = '120px';
            imageContainer.style.height = '120px';
            imageContainer.style.flexShrink = '0';
            
            const img = document.createElement('img');
            img.src = product.ImagePath || 'https://via.placeholder.com/120';
            img.className = 'product-image';
            img.style.width = '100%';
            img.style.height = '100%';
            imageContainer.appendChild(img);
            
            const info = document.createElement('div');
            info.style.flex = '1';
            info.style.display = 'flex';
            info.style.flexDirection = 'column';
            
            const name = document.createElement('div');
            name.className = 'product-name';
            name.textContent = product.Name || product.name;
            
            const price = document.createElement('div');
            price.className = 'product-price';
            price.textContent = `${product.SellingPrice || product.sellingPrice} ج.م`;
            
            info.appendChild(name);
            info.appendChild(price);
            
            card.appendChild(imageContainer);
            card.appendChild(info);
            
            grid.appendChild(card);
        });
        
        grid.style.display = 'grid';
    }

    // The buttons are already null-checked, so they won't throw on the home page.
    if (cartFab) cartFab.onclick = () => cartModal.classList.remove('hidden');
        if (closeCartBtn) closeCartBtn.onclick = () => cartModal.classList.add('hidden');
        if (closeSuccessBtn) closeSuccessBtn.onclick = () => successModal.classList.add('hidden');
        if (closePaymentBtn) closePaymentBtn.onclick = () => paymentModal.classList.add('hidden');

        // Weight Modal elements
        const weightModal = document.getElementById('weight-modal');
        const closeWeightModalBtn = document.getElementById('close-weight-modal');
        const weightMinusBtn = document.getElementById('weight-minus-btn');
        const weightPlusBtn = document.getElementById('weight-plus-btn');
        const weightDisplay = document.getElementById('weight-display');
        const weightPriceDisplay = document.getElementById('weight-price-display');
        const confirmWeightBtn = document.getElementById('confirm-weight-btn');
        const weightItemName = document.getElementById('weight-item-name');

        let currentWeightProduct = null;
        let currentWeight = 100; // starting at 100g
        
        if (closeWeightModalBtn) closeWeightModalBtn.onclick = () => weightModal.classList.add('hidden');

        const updateWeightUI = () => {
            if (!currentWeightProduct) return;
            weightDisplay.textContent = currentWeight;
            const totalPrice = (currentWeightProduct.sellingPrice / 1000) * currentWeight;
            weightPriceDisplay.textContent = `${totalPrice.toFixed(2)} ج.م`;
        };

        if (weightMinusBtn) {
            weightMinusBtn.onclick = () => {
                if (currentWeight > 100) {
                    currentWeight -= 50;
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
                // This allows it to check for modifiers (if any) or just add to cart
                window.addToCart(customProduct);
            };
        }

        window.addToCart = (product) => {
            if (product.isSoldByWeight || product.IsSoldByWeight) {
                currentWeightProduct = product;
                currentWeight = 100;
                weightItemName.textContent = product.name;
                updateWeightUI();
                weightModal.classList.remove('hidden');
                return;
            }

            if (product.autoShowModifiers && windowGlobalAddons.length > 0) {
                
                const validAddons = windowGlobalAddons.filter(addon => {
                    if (!addon.linkedProductIds || addon.linkedProductIds.trim() === '') return false;
                    const ids = addon.linkedProductIds.split(',').map(s => s.trim());
                    return ids.includes(product.id.toString());
                });

                if (validAddons.length > 0) {
                    currentAddonProduct = product;
                    addonsItemName.textContent = product.name;
                    
                    const limit = product.freeModifiersLimit || 0;
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
                    cb.value = addon.id;
                    cb.dataset.price = addon.price || 0;
                    cb.dataset.name = addon.name;
                    cb.dataset.group = addon.group || 'Free'; // Free or Paid
                    cb.className = 'addon-checkbox';
                    
                    cb.onchange = calculateAddonsPrice;
                    
                    const text = document.createElement('span');
                    text.textContent = `${addon.name} (+${addon.price} ج.م)`;
                    text.style.color = '#333';
                    
                    label.appendChild(cb);
                        label.appendChild(text);
                        div.appendChild(label);
                        addonsList.appendChild(div);
                    });
                    
                    calculateAddonsPrice();
                    addonsModal.classList.remove('hidden');
                    return;
                }
            }


            const existing = cart.find(item => item.product.name === product.name);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ product: { ...product }, quantity: 1 });
            }
            updateCartUI();
            showToast(`تمت إضافة ${product.name} للسلة`);
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
            if (!cartCount || !cartItemsContainer || !cartTotalPrice) return;
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartFab.classList.remove('hidden');
            } else {
                cartFab.classList.add('hidden');
                cartModal.classList.add('hidden');
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

    // --- Rating Logic ---
    const ratingFab = document.getElementById('rating-fab');
    const ratingModal = document.getElementById('rating-modal');
    const closeRatingBtn = document.getElementById('close-rating');
    const submitRatingBtn = document.getElementById('submit-rating-btn');
    const stars = document.querySelectorAll('.stars-container i');
    const ratingComment = document.getElementById('rating-comment');
    let selectedRating = 0;

    if (ratingFab) {
        ratingFab.onclick = () => {
            ratingModal.classList.remove('hidden');
        };
    }

    if (closeRatingBtn) {
        closeRatingBtn.onclick = () => {
            ratingModal.classList.add('hidden');
        };
    }

    stars.forEach(star => {
        star.onclick = (e) => {
            selectedRating = parseInt(e.target.getAttribute('data-value'));
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        };
    });

    if (submitRatingBtn) {
        submitRatingBtn.onclick = async () => {
            if (selectedRating === 0) {
                alert('يرجى اختيار عدد النجوم للتقييم!');
                return;
            }

            const custName = localStorage.getItem('lastCustomerName') || 'عميل غير مسجل';
            const custPhone = localStorage.getItem('lastCustomerPhone') || 'غير محدد';

            submitRatingBtn.textContent = 'جاري الإرسال...';
            submitRatingBtn.disabled = true;

            const reviewData = {
                customerName: custName,
                customerPhone: custPhone,
                rating: selectedRating,
                comment: ratingComment.value.trim(),
                createdAt: new Date().toISOString()
            };

            try {
                const response = await fetch(`${dbUrl}Reviews.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviewData)
                });

                if (response.ok) {
                    ratingModal.classList.add('hidden');
                    showToast('تم إرسال تقييمك بنجاح. شكراً لك!');
                    // Reset
                    selectedRating = 0;
                    stars.forEach(s => s.classList.remove('active'));
                    ratingComment.value = '';
                } else {
                    alert('حدث خطأ أثناء إرسال التقييم.');
                }
            } catch (error) {
                alert('تعذر الاتصال بالإنترنت.');
            } finally {
                submitRatingBtn.textContent = 'إرسال التقييم';
                submitRatingBtn.disabled = false;
            }
        };
    }
});
