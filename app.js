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
    
    // Toast UI
    const toast = document.getElementById('toast');

    let cart = [];
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
            
            if (data && data.categories) {
                renderMenu(data.categories);
            } else {
                showError('لا يوجد أصناف حالياً.');
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            showError('حدث خطأ أثناء تحميل المنيو. يرجى المحاولة لاحقاً.');
        }
    };

    const renderMenu = (categories) => {
        menuContainer.innerHTML = ''; 
        if (categoryNav) categoryNav.innerHTML = '';

        categories.forEach((category, index) => {
            const products = category.products || [];
            if (products.length === 0) return;

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
            section.className = 'category-section';
            section.id = categoryId;

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.name;
            section.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'products-grid';

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

            section.appendChild(grid);
            menuContainer.appendChild(section);
        });

        loader.style.display = 'none';
        menuContainer.style.display = 'block';
    };

    const showError = (message) => {
        loader.innerHTML = `<p style="color: red; text-align: center; font-weight: bold;">${message}</p>`;
    };

    if(FIREBASE_DB_URL.includes("YOUR-FIREBASE-PROJECT")) {
        showError('يرجى تعديل ملف config.js ووضع رابط Firebase الخاص بك.');
    } else {
        fetchMenu();

        if (cartFab) cartFab.onclick = () => cartModal.classList.remove('hidden');
        if (closeCartBtn) closeCartBtn.onclick = () => cartModal.classList.add('hidden');
        if (closeSuccessBtn) closeSuccessBtn.onclick = () => successModal.classList.add('hidden');

        window.addToCart = (product) => {
            const existing = cart.find(item => item.product.name === product.name);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ product, quantity: 1 });
            }
            updateCartUI();
            showToast(`تمت إضافة ${product.name} للسلة`);
        };

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

            if (!custName || !custPhone) {
                alert('يرجى إدخال اسم العميل ورقم الموبايل أولاً!');
                return;
            }

            checkoutBtn.textContent = 'جاري الإرسال...';
            checkoutBtn.disabled = true;

            const orderTotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
            
            const newOrder = {
                orderDate: new Date().toISOString(),
                customerName: custName,
                customerPhone: custPhone,
                notes: notes,
                totalAmount: orderTotal,
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
                    cart = [];
                    updateCartUI();
                    document.getElementById('customer-name').value = '';
                    document.getElementById('customer-phone').value = '';
                    document.getElementById('order-notes').value = '';
                    cartModal.classList.add('hidden');
                    successModal.classList.remove('hidden');
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
    }
});
