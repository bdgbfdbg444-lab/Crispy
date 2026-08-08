document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const menuContainer = document.getElementById('menu-container');

    let dbUrl = FIREBASE_DB_URL;
    if (!dbUrl.endsWith('/')) {
        dbUrl += '/';
    }

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

        categories.forEach(category => {
            // عرض جميع المنتجات داخل القسم
            const products = category.products || [];

            if (products.length === 0) return;

            const section = document.createElement('section');
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.name;
            section.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'products-grid';

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = `product-card ${product.isSoldOut ? 'sold-out' : ''}`;

                const imgSource = product.imagePath || 'https://via.placeholder.com/150?text=BBQ';
                const imageHtml = `<img src="${imgSource}" alt="${product.name}" class="product-image" loading="lazy">`;

                const priceHtml = `<div class="product-price">${product.sellingPrice} ج.م</div>`;
                const soldOutHtml = product.isSoldOut ? `<div class="sold-out-badge">نفدت الكمية</div>` : '';

                card.innerHTML = `
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        ${priceHtml}
                        ${soldOutHtml}
                    </div>
                    ${imageHtml}
                `;

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
    }
});
