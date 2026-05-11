const API_URL = '/api';
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    setupEventListeners();
});

function checkLogin() {
    if (sessionStorage.getItem('isAdminLogged') === 'true') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'grid';
        loadProducts();
    }
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value.trim().length > 0) {
        sessionStorage.setItem('isAdminLogged', 'true');
        sessionStorage.setItem('adminPassword', document.getElementById('password').value);
        location.reload();
    } else {
        alert('Login Gagal');
    }
});

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        const tbody = document.getElementById('productsTableBody');
        document.getElementById('productCount').textContent = `${data.length} menu`;
        tbody.innerHTML = data.map(p => {
            const specs = parseSpecs(p.specs);
            return `
            <tr>
                <td>#${p.id}</td>
                <td><img src="${p.image || ''}" style="width:50px; border-radius:8px;"></td>
                <td><strong>${p.name}</strong><br><small>${specs.filling || '-'} | ${specs.texture || '-'}</small></td>
                <td>${p.category}</td>
                <td>Rp ${parseInt(p.price || 0).toLocaleString('id-ID')}</td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="editProduct(${p.id})" class="btn-icon btn-edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="btn-icon btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `}).join('');
    } catch (e) { console.error(e); }
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

async function handleFormSubmit(e) {
    e.preventDefault();
    console.log("🚀 Submit dimulai...");
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    try {
        const adminPassword = sessionStorage.getItem('adminPassword') || '';
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseInt(document.getElementById('productPrice').value) || 0,
            stock: parseInt(document.getElementById('productStock').value) || 0,
            badge: document.getElementById('productReleaseYear').value,
            description: document.getElementById('productMinus').value,
            image: document.getElementById('productImage').value,
            specs: {
                priority: parseInt(document.getElementById('productBH').value) || null,
                filling: document.getElementById('productStorage').value,
                texture: document.getElementById('productCamera').value,
                production: document.getElementById('productFaceId').value,
                packaging: document.getElementById('productScreen').value,
                size: document.getElementById('productBody').value,
                minimumOrder: document.getElementById('productIcloud').value,
                readyEstimate: document.getElementById('productImei').value,
                completeness: document.getElementById('productCompleteness').value
            }
        };

        const imageFile = document.getElementById('productImageFile').files[0];
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            const upRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: { 'x-admin-password': adminPassword },
                body: formData
            });
            const upData = await upRes.json();
            if (upData.success) productData.image = upData.imageUrl;
        }

        const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`;
        const method = editingProductId ? 'PUT' : 'POST';

        console.log(`📡 Mengirim ${method} ke ${url}`);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': adminPassword
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Berhasil Simpan Data!');
            resetForm();
            loadProducts();
        } else {
            alert('❌ Gagal: ' + (result.error || 'Unknown Error'));
        }
    } catch (err) {
        alert('❌ Error: ' + err.message);
    } finally {
        submitBtn.disabled = false;
    }
}

async function editProduct(id) {
    const res = await fetch(`${API_URL}/products/${id}`);
    const p = await res.json();
    editingProductId = id;
    document.getElementById('formTitle').textContent = 'Edit Produk #' + id;
    document.getElementById('productName').value = p.name || '';
    document.getElementById('productCategory').value = p.category || 'goreng';
    document.getElementById('productPrice').value = p.price || 0;
    document.getElementById('productStock').value = p.stock || 1;
    const specs = parseSpecs(p.specs);
    document.getElementById('productBH').value = specs.priority || '';
    document.getElementById('productStorage').value = specs.filling || '';
    document.getElementById('productCamera').value = specs.texture || '';
    document.getElementById('productFaceId').value = specs.production || '';
    document.getElementById('productScreen').value = specs.packaging || '';
    document.getElementById('productBody').value = specs.size || '';
    document.getElementById('productIcloud').value = specs.minimumOrder || '';
    document.getElementById('productImei').value = specs.readyEstimate || '';
    document.getElementById('productCompleteness').value = specs.completeness || '';
    document.getElementById('productReleaseYear').value = p.badge || '';
    document.getElementById('productMinus').value = p.description || '';
    document.getElementById('productImage').value = p.image || '';
    document.getElementById('submitBtn').textContent = 'Update Produk';
    document.getElementById('cancelEdit').style.display = 'inline-block';
    window.scrollTo(0,0);
}

async function deleteProduct(id) {
    if (confirm('Hapus?')) {
        await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-password': sessionStorage.getItem('adminPassword') || '' }
        });
        loadProducts();
    }
}

function resetForm() {
    editingProductId = null;
    document.getElementById('productForm').reset();
    document.getElementById('submitBtn').textContent = 'Simpan Produk';
    document.getElementById('cancelEdit').style.display = 'none';
}

function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelEdit').addEventListener('click', resetForm);
}

function logout() {
    sessionStorage.clear();
    location.reload();
}
