const WHATSAPP_NUMBER = '6283163387668';

function localImage(path) {
    return `/${path.split('/').map(encodeURIComponent).join('/')}`;
}

const catalogProducts = [
    {
        id: 1,
        name: 'Bakpao',
        category: 'kukus',
        price: 2500,
        filling: 'Isi coklat atau kacang',
        texture: 'Lembut kukus',
        badge: 'Kukus Lembut',
        accent: '#d99a54',
        image: localImage('image/Bakpao/Bakpao Isi Coklat.jpg'),
        optionGroups: [
            {
                id: 'isian',
                title: 'Pilihan Isian',
                choices: [
                    { id: 'coklat', label: 'Isi Coklat', price: 2500, image: localImage('image/Bakpao/Bakpao Isi Coklat.jpg') },
                    { id: 'kacang', label: 'Isi Kacang', price: 2500, image: localImage('image/Bakpao/Bakpao isi Kacang.png') },
                ],
            },
        ],
    },
    {
        id: 2,
        name: 'Otok-otok',
        category: 'goreng',
        price: 2500,
        filling: 'Kacang hijau, coklat, strawberry, atau nanas',
        texture: 'Goreng renyah',
        badge: 'Banyak Varian',
        accent: '#f0b429',
        image: localImage('image/Otok-Otok/full menu gula halus.png'),
        optionGroups: [
            {
                id: 'isian',
                title: 'Pilihan Isian',
                choices: [
                    {
                        id: 'kacang-hijau',
                        label: 'Isi Kacang Hijau',
                        price: 2500,
                        image: localImage('image/Otok-Otok/Otok-otok isi kacang hijau.jpg'),
                        images: {
                            gula: localImage('image/Otok-Otok/Otok-otok isi Coklat.png'),
                            tanpa: localImage('image/Otok-Otok/Otok-otok isi coklat tanpa gula halus.jpg'),
                        },
                    },
                    {
                        id: 'coklat',
                        label: 'Isi Coklat',
                        price: 2500,
                        image: localImage('image/Otok-Otok/Otok-otok isi Coklat.png'),
                        images: {
                            gula: localImage('image/Otok-Otok/Otok-otok isi Coklat.png'),
                            tanpa: localImage('image/Otok-Otok/Otok-otok isi coklat tanpa gula halus.jpg'),
                        },
                    },
                    {
                        id: 'strawberry',
                        label: 'Isi Strawberry',
                        price: 2500,
                        image: localImage('image/Otok-Otok/Strawberry .png'),
                        images: {
                            gula: localImage('image/Otok-Otok/Strawberry .png'),
                            tanpa: localImage('image/Otok-Otok/Otok-otok isi strawberry tanpa gula.jpg'),
                        },
                    },
                    {
                        id: 'nanas',
                        label: 'Isi Nanas',
                        price: 2500,
                        image: localImage('image/Otok-Otok/Nanas Gula (1).png'),
                        images: {
                            gula: localImage('image/Otok-Otok/Nanas Gula (1).png'),
                            tanpa: localImage('image/Otok-Otok/Otok-otok Nanas tanpa gula halus.jpg'),
                        },
                    },
                ],
            },
            {
                id: 'taburan',
                title: 'Pilihan Taburan',
                choices: [
                    { id: 'gula', label: 'Gula Halus' },
                    { id: 'tanpa', label: 'Tanpa Gula Halus' },
                ],
            },
        ],
    },
    {
        id: 3,
        name: 'Donat',
        category: 'goreng',
        price: 2500,
        filling: 'Meses, keju, kacang, atau gula halus',
        texture: 'Empuk manis',
        badge: 'Favorit Anak',
        accent: '#b5651d',
        image: localImage('image/Donat/Donat Meses.png'),
        optionGroups: [
            {
                id: 'topping',
                title: 'Pilihan Topping',
                choices: [
                    { id: 'meses', label: 'Donat Meses', price: 2500, image: localImage('image/Donat/Donat Meses.png') },
                    { id: 'meses-keju', label: 'Donat Meses & Keju', price: 2500, image: localImage('image/Donat/Donat Keju.png') },
                    { id: 'meses-kacang', label: 'Donat Meses & Kacang', price: 2500, image: localImage('image/Donat/Donat meses + kacang.png') },
                    { id: 'gula-halus', label: 'Donat Gula Halus', price: 2500, image: localImage('image/Donat/Donat Gula Halus.png') },
                ],
            },
        ],
    },
];

let allProducts = [...catalogProducts];

document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    setupEventListeners();
    initDarkMode();
    loadProducts();
    setTimeout(initScrollReveal, 200);
});

function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow) return;
    document.addEventListener('mousemove', (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    });
}

function rupiah(value) {
    return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function categoryLabel(category) {
    return category === 'kukus' ? 'Kukus' : 'Goreng';
}

async function loadProducts(category = 'all', search = '') {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = Array(3).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-price"></div>
            <div class="shimmer"></div>
        </div>
    `).join('');

    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const remoteProducts = await response.json();
            const products = filterProducts(remoteProducts, category, search);
            allProducts = products;
            setTimeout(() => displayProducts(products), 180);
            return;
        }
    } catch (error) {
        console.warn('Gagal memuat produk dari API, memakai data lokal:', error);
    }

    const products = filterProducts(catalogProducts, category, search);
    allProducts = products;
    setTimeout(() => displayProducts(products), 180);
}

function filterProducts(products, category = 'all', search = '') {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
        const optionText = (product.optionGroups || [])
            .flatMap((group) => group.choices.map((choice) => choice.label))
            .join(' ');
        const haystack = `${product.name} ${product.filling || ''} ${product.category || ''} ${optionText}`.toLowerCase();
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch = !keyword || haystack.includes(keyword);
        return matchesCategory && matchesSearch;
    });
}

function productVisual(product) {
    const isDonut = product.name.toLowerCase().includes('donat');
    const isBao = product.name.toLowerCase().includes('bakpao');
    const fillLabel = product.filling.split(' ')[0];

    if (isDonut) {
        return `
            <div class="product-art donut-art" style="--accent:${product.accent}">
                <span class="sprinkle s1"></span><span class="sprinkle s2"></span><span class="sprinkle s3"></span>
                <span class="donut-hole"></span>
            </div>
        `;
    }

    if (isBao) {
        return `
            <div class="product-art bao-art" style="--accent:${product.accent}">
                <span class="steam st1"></span><span class="steam st2"></span><span class="steam st3"></span>
                <span class="bao-fold"></span>
            </div>
        `;
    }

    return `
        <div class="product-art otok-art" style="--accent:${product.accent}">
            <span class="filling-dot"></span>
            <span class="fill-label">${fillLabel}</span>
        </div>
    `;
}

function productMedia(product) {
    if (!product.image) return productVisual(product);

    return `
        <img
            src="${product.image}"
            alt="${product.name}"
            class="product-thumb"
            loading="lazy"
            onerror="this.outerHTML = this.dataset.fallback"
            data-fallback='${productVisual(product).replace(/'/g, '&apos;')}'
        >
    `;
}

function formatProductPrice(product) {
    return `${product.pricePrefix || ''}${rupiah(product.price)}`;
}

function getPrimaryOptionGroup(product) {
    return (product.optionGroups || []).find((group) => group.choices.some((choice) => choice.price || choice.image || choice.images));
}

function getVariantCount(product) {
    return getPrimaryOptionGroup(product)?.choices.length || 0;
}

function variantPreview(product) {
    return (product.optionGroups || [])
        .flatMap((group) => group.choices.map((choice) => choice.label.replace(/^Donat\s+/i, '').replace(/^Isi\s+/i, '')))
        .slice(0, 4)
        .join(', ');
}

function displayProducts(products) {
    const grid = document.getElementById('productGrid');

    if (products.length === 0) {
        grid.innerHTML = '<div class="no-results">Menu tidak ditemukan. Coba kata kunci lain.</div>';
        return;
    }

    grid.innerHTML = products.map((product, index) => `
        <article class="product-card reveal" style="transition-delay: ${index * 0.06}s" onclick="openDetail(${product.id})">
            <div class="glare"></div>
            <span class="card-badge">${product.badge}</span>
            <div class="img-container">
                ${productMedia(product)}
            </div>
            <div class="product-info">
                <span class="product-cat">${categoryLabel(product.category)}</span>
                <h3>${product.name}</h3>
                <span class="product-price">${formatProductPrice(product)} <small>/ pcs</small></span>
                <div class="card-specs">
                    <span class="spec-pill"><i class="fas fa-list-check"></i> ${getVariantCount(product)} varian</span>
                    <span class="spec-pill"><i class="fas fa-bowl-food"></i> ${variantPreview(product)}</span>
                </div>
            </div>
        </article>
    `).join('');

    setTimeout(() => {
        initScrollReveal();
        initTiltEffect();
    }, 80);
}

function getDefaultSelections(product) {
    return (product.optionGroups || []).reduce((selections, group) => {
        selections[group.id] = group.choices[0]?.id || '';
        return selections;
    }, {});
}

function getChoice(product, groupId, choiceId) {
    const group = (product.optionGroups || []).find((item) => item.id === groupId);
    return group?.choices.find((choice) => choice.id === choiceId) || group?.choices[0] || null;
}

function getPrimaryVariant(product, selections) {
    const primaryGroup = getPrimaryOptionGroup(product);
    if (!primaryGroup) return null;
    return getChoice(product, primaryGroup.id, selections[primaryGroup.id]);
}

function getSelectedPrice(product, selections) {
    return getPrimaryVariant(product, selections)?.price || product.price;
}

function getSelectedImage(product, selections) {
    const variant = getPrimaryVariant(product, selections);
    if (variant?.images && selections.taburan && variant.images[selections.taburan]) {
        return variant.images[selections.taburan];
    }

    return variant?.image || product.image;
}

function getSelectionSummary(product, selections) {
    return (product.optionGroups || []).map((group) => {
        const choice = getChoice(product, group.id, selections[group.id]);
        return `${group.title.replace('Pilihan ', '')}: ${choice?.label || '-'}`;
    }).join(', ');
}

function makeWhatsAppUrl(product, selections) {
    const summary = getSelectionSummary(product, selections);
    const price = rupiah(getSelectedPrice(product, selections));
    const message = encodeURIComponent(`Halo Dapur Roti Ibu, saya mau pesan ${product.name} (${summary}) harga ${price}/pcs. Boleh cek stok dan total harganya?`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function renderOptionGroups(product, selections) {
    if (!product.optionGroups?.length) return '';

    return `
        <div class="option-panel">
            <h4><i class="fas fa-sliders"></i> Pilihan Opsi</h4>
            ${product.optionGroups.map((group) => `
                <div class="option-group">
                    <p>${group.title}</p>
                    <div class="option-choices">
                        ${group.choices.map((choice) => `
                            <button
                                type="button"
                                class="option-chip ${selections[group.id] === choice.id ? 'active' : ''}"
                                data-group-id="${group.id}"
                                data-choice-id="${choice.id}"
                            >
                                <span>${choice.label}</span>
                                ${choice.price ? `<small>${rupiah(choice.price)}</small>` : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <div class="option-summary" id="selectedSummary">${getSelectionSummary(product, selections)}</div>
        </div>
    `;
}

function updateOrderPanel(product, selections) {
    const selectedProduct = { ...product, image: getSelectedImage(product, selections) };
    const selectedMedia = document.getElementById('selectedMedia');
    const selectedPrice = document.getElementById('selectedPrice');
    const selectedPriceText = document.getElementById('selectedPriceText');
    const selectedSummary = document.getElementById('selectedSummary');
    const orderButton = document.getElementById('orderButton');

    if (selectedMedia) selectedMedia.innerHTML = productMedia(selectedProduct);
    if (selectedPrice) selectedPrice.innerHTML = `${rupiah(getSelectedPrice(product, selections))} <small>/ pcs</small>`;
    if (selectedPriceText) selectedPriceText.textContent = rupiah(getSelectedPrice(product, selections));
    if (selectedSummary) selectedSummary.textContent = getSelectionSummary(product, selections);
    if (orderButton) orderButton.href = makeWhatsAppUrl(product, selections);
}

function bindOptionButtons(product, selections) {
    document.querySelectorAll('.option-chip').forEach((button) => {
        button.addEventListener('click', () => {
            const groupId = button.dataset.groupId;
            selections[groupId] = button.dataset.choiceId;

            document.querySelectorAll(`.option-chip[data-group-id="${groupId}"]`).forEach((item) => {
                item.classList.toggle('active', item === button);
            });

            updateOrderPanel(product, selections);
        });
    });
}

function openDetail(id) {
    const product = allProducts.find((item) => String(item.id) === String(id));
    if (!product) return;

    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');
    const selections = getDefaultSelections(product);
    const selectedProduct = { ...product, image: getSelectedImage(product, selections) };

    body.innerHTML = `
        <div class="detail-grid">
            <div class="detail-img" id="selectedMedia">
                ${productMedia(selectedProduct)}
            </div>
            <div class="detail-info">
                <div class="detail-header">
                    <span class="hero-badge"><i class="fas fa-utensils"></i> ${categoryLabel(product.category)} fresh</span>
                    <h2>${product.name}</h2>
                    <span class="detail-price" id="selectedPrice">${rupiah(getSelectedPrice(product, selections))} <small>/ pcs</small></span>
                </div>

                ${renderOptionGroups(product, selections)}

                <div class="detail-sections">
                    <div class="specs-group">
                        <h4><i class="fas fa-circle-info"></i> Detail Menu</h4>
                        <div class="detail-list">
                            <div class="list-item"><span>Kategori</span><b>${categoryLabel(product.category)}</b></div>
                            <div class="list-item"><span>Varian</span><b>${getVariantCount(product)} varian</b></div>
                            <div class="list-item"><span>Tekstur</span><b>${product.texture}</b></div>
                        </div>
                    </div>
                    <div class="specs-group">
                        <h4><i class="fas fa-bag-shopping"></i> Pemesanan</h4>
                        <div class="detail-list">
                            <div class="list-item"><span>Harga</span><b id="selectedPriceText">${rupiah(getSelectedPrice(product, selections))}</b></div>
                            <div class="list-item"><span>Satuan</span><b>Per pcs</b></div>
                            <div class="list-item"><span>Kontak</span><b>0831-6338-7668</b></div>
                        </div>
                    </div>
                </div>

                <div class="minus-section">
                    <p class="note-title">Catatan</p>
                    <div class="minus-box">Pilih opsi menu sebelum pesan. Harga dapat disesuaikan untuk pesanan banyak, hubungi admin untuk cek stok hari ini.</div>
                </div>

                <a href="${makeWhatsAppUrl(product, selections)}" target="_blank" rel="noopener" class="wa-btn" id="orderButton">
                    <i class="fab fa-whatsapp"></i> Pesan Menu Ini
                </a>
            </div>
        </div>
    `;

    bindOptionButtons(product, selections);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function initTiltEffect() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => {
        const glare = card.querySelector('.glare');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
            const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
            card.style.transition = 'none';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            if (glare) {
                glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.18) 0%, transparent 70%)`;
                glare.style.opacity = '1';
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
            if (glare) glare.style.opacity = '0';
        });
    });
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .feature-card, .cta-content');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    reveals.forEach((element) => observer.observe(element));
}

function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    const icon = toggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    icon.classList.toggle('fa-sun', savedTheme === 'dark');
    icon.classList.toggle('fa-moon', savedTheme !== 'dark');

    toggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        icon.classList.toggle('fa-sun', isDark);
        icon.classList.toggle('fa-moon', !isDark);
    });
}

function setupEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            navMenu?.classList.remove('active');
            const icon = menuToggle?.querySelector('i');
            icon?.classList.add('fa-bars');
            icon?.classList.remove('fa-times');
        });
    });

    const modal = document.getElementById('detailModal');
    const closeBtn = document.querySelector('.modal-close');
    const overlay = document.querySelector('.modal-overlay');
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((item) => item.classList.remove('active'));
            btn.classList.add('active');
            loadProducts(btn.dataset.category, document.getElementById('searchInput').value);
        });
    });

    let debounceTimer;
    document.getElementById('searchInput').addEventListener('input', (event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const category = document.querySelector('.filter-btn.active').dataset.category;
            loadProducts(category, event.target.value);
        }, 250);
    });
}
