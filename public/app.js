const WHATSAPP_NUMBER = '62895406015956';
const SUPABASE_IMAGE_BASE = 'https://jysaurfhpzofikauqatk.supabase.co/storage/v1/object/public/katalog-gorengan/product-images/';

const catalogProducts = [
    { id: 1, name: 'Otok Otok isi kacang ijo', category: 'goreng', price: 2500, filling: 'Kacang ijo', texture: 'Gurih renyah', badge: 'Favorit', accent: '#3fc06f' },
    { id: 2, name: 'Otok Otok isi coklat', category: 'goreng', price: 2500, filling: 'Coklat', texture: 'Gurih manis', badge: 'Manis', accent: '#8b5a3c' },
    { id: 3, name: 'Otok Otok isi Stroberi', category: 'goreng', price: 2500, filling: 'Stroberi', texture: 'Gurih fruity', badge: 'Fresh', accent: '#ef5b78' },
    { id: 4, name: 'Otok Otok isi Nanas', category: 'goreng', price: 2500, filling: 'Nanas', texture: 'Gurih segar', badge: 'Segar', accent: '#f0b429' },
    { id: 5, name: 'Donat misis', category: 'goreng', price: 3000, filling: 'Misis coklat', texture: 'Empuk', badge: 'Best Seller', accent: '#b5651d' },
    { id: 6, name: 'Donat misis + keju', category: 'goreng', price: 3500, filling: 'Misis dan keju', texture: 'Empuk creamy', badge: 'Premium', accent: '#f7c948' },
    { id: 7, name: 'Donat kacang', category: 'goreng', price: 3000, filling: 'Tabur kacang', texture: 'Empuk gurih', badge: 'Crunchy', accent: '#c28a45' },
    { id: 8, name: 'Donat Gula', category: 'goreng', price: 2500, filling: 'Gula halus', texture: 'Empuk klasik', badge: 'Klasik', accent: '#f5f5f5' },
    { id: 9, name: 'Bakpao isi coklat', category: 'kukus', price: 3500, filling: 'Coklat lumer', texture: 'Lembut kukus', badge: 'Lembut', accent: '#7b4a2d' },
    { id: 10, name: 'Bakpao isi kacang', category: 'kukus', price: 3500, filling: 'Kacang', texture: 'Lembut gurih', badge: 'Hangat', accent: '#d99a54' },
];

let allProducts = [...catalogProducts];

function supabaseImage(fileName) {
    return `${SUPABASE_IMAGE_BASE}${fileName}`;
}

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
    grid.innerHTML = Array(4).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-price"></div>
            <div class="shimmer"></div>
        </div>
    `).join('');

    try {
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (search) params.append('search', search);

        const response = await fetch(`/api/products?${params}`);
        if (!response.ok) throw new Error('API tidak merespons');
        const databaseProducts = await response.json();
        const normalizedProducts = databaseProducts
            .map(normalizeProduct)
            .filter((product) => ['goreng', 'kukus'].includes(product.category));
        const products = normalizedProducts.length > 0
            ? normalizedProducts
            : filterLocalProducts(category, search);

        allProducts = products;
        setTimeout(() => displayProducts(products), 250);
    } catch (error) {
        console.warn('Memakai data lokal:', error);
        const products = filterLocalProducts(category, search);
        allProducts = products;
        setTimeout(() => displayProducts(products), 250);
    }
}

function filterLocalProducts(category = 'all', search = '') {
    const keyword = search.trim().toLowerCase();
    return catalogProducts.filter((product) => {
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch = !keyword || `${product.name} ${product.filling} ${product.category}`.toLowerCase().includes(keyword);
        return matchesCategory && matchesSearch;
    });
}

function normalizeProduct(product) {
    const specs = parseSpecs(product.specs);

    return {
        id: product.id,
        name: product.name,
        category: product.category || 'goreng',
        price: Number(product.price || 0),
        stock: Number(product.stock || 0),
        image: product.image || '',
        filling: specs.filling || specs.isian || product.description || '-',
        texture: specs.texture || specs.tekstur || 'Fresh harian',
        badge: product.badge || specs.badge || 'Ready',
        accent: specs.accent || '#f5a623',
    };
}

function parseSpecs(specs) {
    if (!specs) return {};
    if (typeof specs !== 'string') return specs;

    try {
        return JSON.parse(specs);
    } catch {
        return {};
    }
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
                <span class="product-price">${rupiah(product.price)} <small>/ pcs</small></span>
                <div class="card-specs">
                    <span class="spec-pill"><i class="fas fa-bowl-food"></i> ${product.filling}</span>
                    <span class="spec-pill"><i class="fas fa-star"></i> ${product.texture}</span>
                </div>
            </div>
        </article>
    `).join('');

    setTimeout(() => {
        initScrollReveal();
        initTiltEffect();
    }, 80);
}

function openDetail(id) {
    const product = allProducts.find((item) => String(item.id) === String(id));
    if (!product) return;

    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');
    const message = encodeURIComponent(`Halo Bakul Gorengan, saya mau pesan ${product.name}. Boleh cek stok dan total harganya?`);

    body.innerHTML = `
        <div class="detail-grid">
            <div class="detail-img">
                ${productMedia(product)}
            </div>
            <div class="detail-info">
                <div class="detail-header">
                    <span class="hero-badge"><i class="fas fa-utensils"></i> ${categoryLabel(product.category)} fresh</span>
                    <h2>${product.name}</h2>
                    <span class="detail-price">${rupiah(product.price)} <small>/ pcs</small></span>
                </div>

                <div class="detail-sections">
                    <div class="specs-group">
                        <h4><i class="fas fa-circle-info"></i> Detail Menu</h4>
                        <div class="detail-list">
                            <div class="list-item"><span>Kategori</span><b>${categoryLabel(product.category)}</b></div>
                            <div class="list-item"><span>Isian</span><b>${product.filling}</b></div>
                            <div class="list-item"><span>Tekstur</span><b>${product.texture}</b></div>
                        </div>
                    </div>
                    <div class="specs-group">
                        <h4><i class="fas fa-bag-shopping"></i> Pemesanan</h4>
                        <div class="detail-list">
                            <div class="list-item"><span>Harga</span><b>${rupiah(product.price)}</b></div>
                            <div class="list-item"><span>Satuan</span><b>Per pcs</b></div>
                            <div class="list-item"><span>Kontak</span><b>0895-4060-15956</b></div>
                        </div>
                    </div>
                </div>

                <div class="minus-section">
                    <p class="note-title">Catatan</p>
                    <div class="minus-box">Harga dapat disesuaikan untuk pesanan banyak. Hubungi admin untuk cek stok hari ini.</div>
                </div>

                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${message}" target="_blank" rel="noopener" class="wa-btn">
                    <i class="fab fa-whatsapp"></i> Pesan Menu Ini
                </a>
            </div>
        </div>
    `;

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
