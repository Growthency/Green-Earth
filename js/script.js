// === API ===
const API_ALL_PLANTS = 'https://openapi.programming-hero.com/api/plants';
const API_DETAIL = id => `https://openapi.programming-hero.com/api/plant/${id}`;

// === DOM ===
const categoryList = document.getElementById('categoryList');
const cardsGrid = document.getElementById('cardsGrid');
const spinner = document.getElementById('spinner');
const emptyMsg = document.getElementById('emptyMsg');
const cartList = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
// ❌ modalAddBtn বাদ দেওয়া হলো

// === State ===
let activeCategoryId = 'all';
let categoryMode = 'local';
let allPlantsCache = [];
const cart = {};
let lastDetail = null;

const showSpinner = s => spinner.classList.toggle('hidden', !s);
const formatPrice = p => `$${Number(p || 0)}`;
function setActiveButton(id) {
    activeCategoryId = id;
    [...categoryList.children].forEach(b =>
        b.classList.toggle('cat-btn-active', b.dataset.id === id)
    );
}

// === Init flow ===
init();
async function init() {
    showSpinner(true);
    try {
        const resP = await fetch(API_ALL_PLANTS);
        const dataP = await resP.json();
        allPlantsCache = dataP?.plants || [];
    } catch (e) {
        allPlantsCache = [];
    } finally {
        showSpinner(false);
    }

    const localNames = Array.from(
        new Set(allPlantsCache.map(p => (p.category || p.type || '').trim()).filter(Boolean))
    );
    const staticList = [
        'Fruit Tree', 'Flowering Tree', 'Shade Tree', 'Medicinal Tree', 'Timber Tree',
        'Evergreen Tree', 'Ornamental Plants', 'Bamboo', 'Climbers', 'Aquatic Plants'
    ];
    const finalCats = localNames.length ? localNames : staticList;

    renderCategories([
        { id: 'all', category: 'All Trees', local: true },
        ...finalCats.map(n => ({ id: n, category: n, local: true }))
    ]);
    setActiveButton('all');
    renderCards(allPlantsCache);
}

// === Render categories ===
function renderCategories(list) {
    const labelOf = (c) =>
        (c?.category && String(c.category).trim()) ||
        (c?.name && String(c.name).trim()) ||
        (c?.title && String(c.title).trim()) ||
        (c?.type && String(c.type).trim()) ||
        (typeof c === 'string' ? c : '') || '';

    categoryList.innerHTML = '';
    list.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        const label = labelOf(c) || (c.id === 'all' ? 'All Trees' : '');
        btn.textContent = label;
        btn.dataset.id = c.id;
        btn.onclick = () => onCategoryClick(c);
        categoryList.appendChild(btn);
    });
}

async function onCategoryClick(c) {
    setActiveButton(String(c.id));
    if (c.id === 'all') { renderCards(allPlantsCache); return; }
    const name = c.category;
    const list = allPlantsCache.filter(p => (p.category || p.type) === name);
    renderCards(list);
}

// === Cards ===
function renderCards(list) {
    cardsGrid.innerHTML = '';
    if (!list || list.length === 0) { emptyMsg.classList.remove('hidden'); return; }
    emptyMsg.classList.add('hidden');

    list.forEach(item => {
        const id = item.id || item.plantId || item._id || Math.random().toString(36).slice(2);
        const name = item.name || item.plant_name || 'Tree';
        const category = item.category || item.type || 'Tree';
        const price = item.price ?? 500;
        const description = item.description || item.short_description || 'A wonderful tree for your garden.';
        const imgUrl = `https://picsum.photos/seed/${encodeURIComponent(name + id)}/400/300`;

        const card = document.createElement('article');
        card.className = 'border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col';
        card.innerHTML = `
      <div class="h-36 bg-slate-100 skeleton">
        <img src="${imgUrl}" alt="${name}" class="w-full h-36 object-cover" onload="this.parentElement.classList.remove('skeleton')">
      </div>
      <div class="p-3 text-xs flex-1 flex flex-col">
        <button class="text-[13px] font-semibold text-left hover:text-[var(--brand)] underline decoration-transparent hover:decoration-[var(--brand)]" data-name>${name}</button>
        <p class="mt-1 text-slate-600 line-clamp-3">${description}</p>
        <div class="mt-2 flex items-center justify-between">
          <span class="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">${category}</span>
          <span class="font-semibold">${formatPrice(price)}</span>
        </div>
        <button class="mt-3 w-full bg-[var(--brand)] hover:bg-[var(--brand-2)] text-white rounded-md py-2 text-sm" data-add>Add to Cart</button>
      </div>`;
        card.querySelector('[data-name]').onclick = () => openDetailModal(id, { fallbackName: name, fallbackImg: imgUrl, fallbackCategory: category, fallbackPrice: price, fallbackDesc: description });
        card.querySelector('[data-add]').onclick = () => addToCart(id, { id, name, price });
        cardsGrid.appendChild(card);
    });
}

// === Modal ===
async function openDetailModal(id, fallback) {
    modalTitle.textContent = 'Loading...';
    modalBody.innerHTML = `
    <div class="py-6 flex items-center justify-center">
      <div class="flex space-x-2">
        <div class="w-3 h-3 bg-[var(--brand)] rounded-full animate-bounce"></div>
        <div class="w-3 h-3 bg-[var(--brand)] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
        <div class="w-3 h-3 bg-[var(--brand)] rounded-full animate-bounce [animation-delay:-0.4s]"></div>
      </div>
    </div>`;
    lastDetail = null;
    modal.classList.remove('hidden'); modal.classList.add('flex');

    try {
        const res = await fetch(API_DETAIL(id));
        const data = await res.json();
        const t = data?.plant || data?.data || {};
        const name = t.name || t.plant_name || fallback.fallbackName || 'Tree';
        const price = t.price ?? fallback.fallbackPrice ?? 500;
        const category = t.category || t.type || fallback.fallbackCategory || 'Tree';
        const desc = t.description || fallback.fallbackDesc || 'A beautiful tree that supports biodiversity and improves air quality.';
        let img = (Array.isArray(t.images) && t.images[2]) || t.image || fallback.fallbackImg || `https://picsum.photos/seed/${encodeURIComponent(name + id)}/800/500`;

        modalTitle.textContent = name;
        modalBody.innerHTML = `
      <img src="${img}" alt="${name}" class="w-full h-48 object-cover rounded-md">
      <div class="space-y-1">
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Price:</strong> ${formatPrice(price)}</p>
        <p><strong>Description:</strong> ${desc}</p>
      </div>`;
        lastDetail = { id, name, price };
    } catch (e) {
        modalTitle.textContent = fallback.fallbackName || 'Tree';
        modalBody.innerHTML = `
      <img src="${fallback.fallbackImg}" class="w-full h-48 object-cover rounded-md">
      <div class="space-y-1">
        <p><strong>Category:</strong> ${fallback.fallbackCategory}</p>
        <p><strong>Price:</strong> ${formatPrice(fallback.fallbackPrice)}</p>
        <p><strong>Description:</strong> ${fallback.fallbackDesc}</p>
      </div>`;
        lastDetail = { id: id, name: fallback.fallbackName, price: fallback.fallbackPrice };
    }
}
function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }
modalClose.onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
// ❌ modalAddBtn.onclick অংশ বাদ দেওয়া হলো

// === Cart ===
function addToCart(id, item) { if (!cart[id]) cart[id] = { ...item, qty: 0 }; cart[id].qty++; renderCart(); }
function removeFromCart(id) { if (!cart[id]) return; cart[id].qty--; if (cart[id].qty <= 0) delete cart[id]; renderCart(); }
function renderCart() {
    cartList.innerHTML = ''; let total = 0;
    const ids = Object.keys(cart);
    if (ids.length === 0) { cartList.innerHTML = '<li class="text-slate-400">Cart is empty.</li>'; }
    ids.forEach(id => {
        const { name, price, qty } = cart[id]; total += Number(price) * qty;
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between border rounded px-2 py-1';
        li.innerHTML = `<div class="flex items-center gap-2"><span>${name}</span><span class="text-xs text-slate-500">x${qty}</span></div>
    <div class="flex items-center gap-3"><span class="text-xs font-semibold">${formatPrice(price * qty)}</span>
    <button class="text-red-600 hover:text-red-700">✖</button></div>`;
        li.querySelector('button').onclick = () => removeFromCart(id);
        cartList.appendChild(li);
    });
    cartTotalEl.textContent = `$${total}`;
}

// Mobile menu toggle
const mBtn = document.getElementById('mobileBtn');
const mMenu = document.getElementById('mobileMenu');
mBtn?.addEventListener('click', () => { mMenu.classList.toggle('hidden'); });
mMenu?.addEventListener('click', (e) => { if (e.target.tagName === 'A') mMenu.classList.add('hidden'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') mMenu.classList.add('hidden'); });
document.addEventListener('click', (e) => {
    if (!mMenu.classList.contains('hidden')) {
        if (!mMenu.contains(e.target) && !mBtn.contains(e.target)) {
            mMenu.classList.add('hidden');
        }
    }
});
