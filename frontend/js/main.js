// ================================================================
//  DATA
// ================================================================
const CATEGORIES = [
  { label: 'Todos',       icon: '🏠' },
  { label: 'Smartphones', icon: '📱' },
  { label: 'Notebooks',   icon: '💻' },
  { label: 'Games',       icon: '🎮' },
  { label: 'Tablets',     icon: '📟' },
  { label: 'Áudio',       icon: '🎧' },
  { label: 'Câmeras',     icon: '📷' },
  { label: 'Wearables',   icon: '⌚' },
  { label: 'Acessórios',  icon: '🔌' },
];

const PRODUCTS = [
  {
    id: 1, title: 'iPhone 14 Pro 256GB', category: 'Smartphones',
    price: 2999, originalPrice: 4299, condition: 'Excelente',
    seller: 'TechStore SP', sellerRating: 4.8, sales: 342,
    description: 'iPhone 14 Pro em excelente estado. Sem arranhões visíveis, bateria com 89% de saúde. Acompanha cabo original, carregador 20W e caixa completa. Desbloqueado para todas as operadoras.',
    specs: ['Tela Super Retina XDR 6.1"', 'Chip A16 Bionic', 'Câmera 48MP Triple', '256GB armazenamento', 'iOS 17 atualizado'],
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=400&auto=format&fit=crop', views: 1243,
  },
  {
    id: 2, title: 'MacBook Pro M2 14" 512GB', category: 'Notebooks',
    price: 8499, originalPrice: 12999, condition: 'Excelente',
    seller: 'AppleZone', sellerRating: 4.9, sales: 87,
    description: 'MacBook Pro M2 em perfeito estado. Bateria com apenas 95 ciclos. Acompanha carregador MagSafe original e caixa. Performance excepcional para desenvolvimento e design.',
    specs: ['Chip Apple M2 Pro', 'Tela Liquid Retina XDR 14"', '16GB RAM unificada', '512GB SSD', 'macOS Sonoma'],
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop', views: 892,
  },
  {
    id: 3, title: 'PlayStation 5 + 2 Controles', category: 'Games',
    price: 2799, originalPrice: 3999, condition: 'Bom',
    seller: 'GamerStore', sellerRating: 4.6, sales: 156,
    description: 'PlayStation 5 Edition Disc em bom estado. Pequena marca na lateral, funciona perfeitamente. Acompanha 2 controles DualSense e todos os cabos. Sem jogos inclusos.',
    specs: ['CPU AMD Zen 2 8-core', 'GPU 10.28 TFLOPS', '16GB GDDR6', 'SSD 825GB ultrarrápido', 'Leitor Blu-ray 4K'],
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop', views: 2156,
  },
  {
    id: 4, title: 'Samsung Galaxy S23 Ultra 256GB', category: 'Smartphones',
    price: 3299, originalPrice: 5499, condition: 'Bom',
    seller: 'SamsungPro RJ', sellerRating: 4.7, sales: 201,
    description: 'Galaxy S23 Ultra com S Pen inclusa. Pequenos arranhões na tela (invisíveis com ela ligada). Bateria com 92% de saúde. Carregador 45W e caixa inclusos.',
    specs: ['Tela Dynamic AMOLED 6.8"', 'Snapdragon 8 Gen 2', 'Câmera 200MP Quad', '256GB armazenamento', 'S Pen integrada'],
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=400&auto=format&fit=crop', views: 987,
  },
  {
    id: 5, title: 'iPad Air 5ª Geração Wi-Fi 64GB', category: 'Tablets',
    price: 2199, originalPrice: 3299, condition: 'Excelente',
    seller: 'MobileDeals', sellerRating: 4.5, sales: 64,
    description: 'iPad Air 5ª geração em excelente estado, sem marcas. Chip M1 ultra-rápido. Compatível com Apple Pencil 2ª geração (não incluso). Acompanha cabo USB-C e caixa original.',
    specs: ['Chip Apple M1', 'Tela Liquid Retina 10.9"', '64GB armazenamento', 'iPadOS 17', 'Touch ID lateral'],
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop', views: 543,
  },
  {
    id: 6, title: 'AirPods Pro 2ª Geração MagSafe', category: 'Áudio',
    price: 1099, originalPrice: 1699, condition: 'Excelente',
    seller: 'AudioWorld', sellerRating: 4.8, sales: 289,
    description: 'AirPods Pro 2ª geração com estojo MagSafe. Em perfeito estado, poucas horas de uso. Cancelamento de ruído ativo e modo transparência. Caixa original e todos os acessórios.',
    specs: ['Chip H2', 'ANC adaptativo', 'Áudio Espacial Personalizado', 'Até 30h total (estojo)', 'Resistência IP54'],
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=400&auto=format&fit=crop', views: 678,
  },
  {
    id: 7, title: 'Nintendo Switch OLED Branco', category: 'Games',
    price: 1599, originalPrice: 2299, condition: 'Usado',
    seller: 'NintendoFan', sellerRating: 4.3, sales: 45,
    description: 'Nintendo Switch OLED na cor branca. Marcas de uso na dock e Joy-Con. Funciona perfeitamente. Não acompanha cartuchos de jogos. Ótima opção custo-benefício.',
    specs: ['Tela OLED 7"', '64GB armazenamento', 'Autonomia 4.5-9h', 'Dock OLED inclusa', 'Joy-Con brancos'],
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=400&auto=format&fit=crop', views: 1102,
  },
  {
    id: 8, title: 'Dell XPS 15 i7 + RTX 3050 Ti', category: 'Notebooks',
    price: 5499, originalPrice: 8999, condition: 'Bom',
    seller: 'NotebookPro', sellerRating: 4.4, sales: 32,
    description: 'Dell XPS 15 em bom estado. Arranhões na tampa (não visíveis aberto). Bateria substituída há 3 meses com 100% de saúde. Ideal para programação e edição de vídeo.',
    specs: ['Intel Core i7-12700H', 'NVIDIA RTX 3050 Ti 4GB', '16GB DDR5', 'SSD 512GB NVMe', 'Tela 4K OLED 15.6"'],
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=400&auto=format&fit=crop', views: 421,
  },
  {
    id: 9, title: 'Apple Watch Series 8 GPS 45mm', category: 'Wearables',
    price: 1799, originalPrice: 2999, condition: 'Excelente',
    seller: 'WatchStore', sellerRating: 4.9, sales: 118,
    description: 'Apple Watch Series 8 GPS 45mm em excelente estado. Pulseira original meia-noite inclusa. Bateria com 91% de saúde. Inclui carregador magnético e caixa original.',
    specs: ['Chip S8 SiP', 'GPS + Altímetro', 'Sensor temperatura corporal', 'Detecção de acidentes', 'watchOS 10'],
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=400&auto=format&fit=crop', views: 765,
  },
  {
    id: 10, title: 'Sony WH-1000XM5 Preto', category: 'Áudio',
    price: 1299, originalPrice: 2199, condition: 'Excelente',
    seller: 'AudioWorld', sellerRating: 4.8, sales: 203,
    description: 'Sony WH-1000XM5 em excelente estado. Melhor ANC da categoria. Acompanha estojo original, cabo USB-C e adaptador de avião. Pouco tempo de uso.',
    specs: ['ANC líder de mercado', 'Até 30h de bateria', 'Bluetooth 5.2 Multipoint', 'LDAC Hi-Res Audio', 'Microfone duplo beamforming'],
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop', views: 532,
  },
  {
    id: 11, title: 'Canon EOS R50 + Lente 18-45mm', category: 'Câmeras',
    price: 3799, originalPrice: 5499, condition: 'Bom',
    seller: 'FotoGear', sellerRating: 4.6, sales: 28,
    description: 'Canon EOS R50 mirrorless com lente kit 18-45mm STM. Menos de 3.000 disparos. Perfeita para iniciar em fotografia e criação de conteúdo.',
    specs: ['Sensor APS-C 24.2MP', 'Processador DIGIC X', 'AF Dual Pixel CMOS II', 'Vídeo 4K 30fps', 'Wi-Fi + Bluetooth'],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop', views: 344,
  },
  {
    id: 12, title: 'Carregador Apple MagSafe 15W', category: 'Acessórios',
    price: 199, originalPrice: 349, condition: 'Novo',
    seller: 'AcessoriosPro', sellerRating: 4.7, sales: 892,
    description: 'Carregador MagSafe original Apple 15W. Lacrado, sem uso. Compatível com iPhone 12 ou superior. Certificado MFi original pela Apple.',
    specs: ['15W para iPhone 15', 'Conexão USB-C', 'Cabo 1 metro', 'Original Apple certificado', 'MFi Certificado'],
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400&auto=format&fit=crop', views: 2341,
  },
];

// ================================================================
//  STATE
// ================================================================
let cart = [];
let currentCategory = 'Todos';
let searchQuery = '';
let sortBy = 'relevancia';
let cartOpen = false;
let modalQty = 1;
let checkoutStep = 0; // 0=cart 1=entrega 2=pagamento 3=confirmação

// ================================================================
//  HELPERS
// ================================================================
const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function condBadge(c) {
  return {
    'Novo':      'bg-green-100 text-green-700',
    'Excelente': 'bg-blue-100  text-blue-700',
    'Bom':       'bg-yellow-100 text-yellow-700',
    'Usado':     'bg-orange-100 text-orange-700',
  }[c] || 'bg-gray-100 text-gray-700';
}

const pct = (o, p) => Math.round((1 - p / o) * 100);
const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
const cartQty   = () => cart.reduce((s, i) => s + i.qty, 0);

function getFiltered() {
  let list = [...PRODUCTS];
  if (currentCategory !== 'Todos') list = list.filter(p => p.category === currentCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q) ||
      p.seller.toLowerCase().includes(q)
    );
  }
  if (sortBy === 'menor') list.sort((a, b) => a.price - b.price);
  else if (sortBy === 'maior') list.sort((a, b) => b.price - a.price);
  else if (sortBy === 'vendidos') list.sort((a, b) => b.sales - a.sales);
  return list;
}

// ================================================================
//  RENDER CATEGORIES
// ================================================================
function renderCats() {
  document.getElementById('catBar').innerHTML = CATEGORIES.map(c => {
    const active = c.label === currentCategory;
    return `
      <button onclick="setCategory('${c.label}')"
        class="cat-pill flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border
          ${active
            ? 'bg-indigo-600 text-white border-indigo-600 shadow shadow-indigo-200'
            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
          }">
        <span>${c.icon}</span><span>${c.label}</span>
      </button>`;
  }).join('');
}

// ================================================================
//  RENDER GRID
// ================================================================
function renderGrid() {
  const list = getFiltered();
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('empty');
  document.getElementById('resultsLabel').textContent =
    `${list.length} produto${list.length !== 1 ? 's' : ''} encontrado${list.length !== 1 ? 's' : ''}`;

  if (!list.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  grid.innerHTML = list.map(p => `
    <article onclick="openModal(${p.id})"
      class="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer shadow-sm hover:border-indigo-200">
      <!-- Image -->
      <div class="relative h-44 bg-gray-100 flex items-center justify-center">
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
        <span class="absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${condBadge(p.condition)}">${p.condition}</span>
        ${p.originalPrice > p.price ? `
        <span class="absolute top-2 right-2 text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">-${pct(p.originalPrice, p.price)}%</span>` : ''}
      </div>
      <!-- Info -->
      <div class="p-3">
        <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2">${p.title}</h3>
        <div class="mb-2">
          ${p.originalPrice > p.price
            ? `<span class="text-xs text-gray-400 line-through">${fmt(p.originalPrice)}</span>`
            : ''}
          <div class="text-lg font-bold text-gray-900 leading-tight">${fmt(p.price)}</div>
          <div class="text-[11px] text-gray-400">12x de ${fmt(p.price / 12)}</div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1 text-xs text-gray-500">
            <span class="text-yellow-400">★</span>
            <span>${p.sellerRating}</span>
            <span class="text-gray-300">·</span>
            <span>${p.sales} vend.</span>
          </div>
          <button
            onclick="event.stopPropagation(); addToCart(${p.id})"
            class="w-7 h-7 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg flex items-center justify-center transition-colors"
            title="Adicionar ao carrinho">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
          </button>
        </div>
      </div>
    </article>`).join('');
}

// ================================================================
//  PRODUCT MODAL
// ================================================================
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  modalQty = 1;

  document.getElementById('modalContent').innerHTML = `
    <button onclick="closeModal()"
      class="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    <div class="flex flex-col sm:flex-row">
      <!-- Image -->
      <div class="sm:w-56 flex-shrink-0 h-56 sm:h-auto flex items-center justify-center
        rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none bg-gray-100 overflow-hidden">
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
      </div>
      <!-- Info -->
      <div class="flex-1 p-6">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${condBadge(p.condition)}">${p.condition}</span>
          <span class="text-xs text-gray-400">${p.category}</span>
          <span class="text-xs text-gray-400 ml-auto">👁 ${p.views.toLocaleString()}</span>
        </div>

        <h2 class="text-xl font-bold text-gray-900 mb-3">${p.title}</h2>

        <div class="mb-4">
          ${p.originalPrice > p.price ? `
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-sm text-gray-400 line-through">${fmt(p.originalPrice)}</span>
            <span class="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">-${pct(p.originalPrice, p.price)}%</span>
          </div>` : ''}
          <div class="text-3xl font-black text-gray-900">${fmt(p.price)}</div>
          <div class="text-xs text-gray-400 mt-0.5">em até 12x de ${fmt(p.price / 12)} sem juros</div>
        </div>

        <!-- Seller -->
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
          <div class="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
            ${p.seller.charAt(0)}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-800 truncate">${p.seller}</div>
            <div class="text-xs text-gray-500 flex items-center gap-1">
              <span class="text-yellow-400">★</span>${p.sellerRating} · ${p.sales} vendidos
            </div>
          </div>
          <button class="ml-auto text-xs text-indigo-600 font-medium hover:underline flex-shrink-0">Ver perfil</button>
        </div>

        <!-- Qty + Add -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 border border-gray-200 rounded-xl px-1 py-1">
            <button onclick="changeModalQty(-1)"
              class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 font-bold text-lg">−</button>
            <span id="mqNum" class="text-sm font-bold w-6 text-center">1</span>
            <button onclick="changeModalQty(1)"
              class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 font-bold text-lg">+</button>
          </div>
          <button onclick="addToCartFromModal(${p.id})"
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>

    <!-- Description + Specs -->
    <div class="border-t border-gray-100 p-6 grid sm:grid-cols-2 gap-6">
      <div>
        <h4 class="text-sm font-bold text-gray-700 mb-2">Descrição</h4>
        <p class="text-sm text-gray-600 leading-relaxed">${p.description}</p>
      </div>
      <div>
        <h4 class="text-sm font-bold text-gray-700 mb-2">Especificações</h4>
        <ul class="space-y-1.5">
          ${p.specs.map(s => `
            <li class="flex items-start gap-2 text-sm text-gray-600">
              <svg class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
              </svg>
              ${s}
            </li>`).join('')}
        </ul>
      </div>
    </div>`;

  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('backdrop').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function changeModalQty(d) {
  modalQty = Math.max(1, modalQty + d);
  const el = document.getElementById('mqNum');
  if (el) el.textContent = modalQty;
}

function addToCartFromModal(id) {
  addToCart(id, modalQty);
  closeModal();
  setTimeout(openCart, 180);
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  if (!cartOpen) {
    document.getElementById('backdrop').classList.remove('show');
    document.body.style.overflow = '';
  }
  modalQty = 1;
}

// ================================================================
//  CART
// ================================================================
function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, condition: p.condition, qty });
  updateBadge();
  if (cartOpen) renderCartPanel();
  flashCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateBadge();
  renderCartPanel();
}

function updateQty(id, d) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + d);
  updateBadge();
  renderCartPanel();
}

function updateBadge() {
  const n = cartQty();
  const el = document.getElementById('cartCount');
  el.textContent = n > 99 ? '99+' : n;
  n > 0 ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function flashCart() {
  const btn = document.getElementById('cartBtn');
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 200);
}

function toggleCart() { cartOpen ? closeCart() : openCart(); }

function openCart() {
  checkoutStep = 0;
  cartOpen = true;
  renderCartPanel();
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('backdrop').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartOpen = false;
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('backdrop').classList.remove('show');
  document.body.style.overflow = '';
}

function closeAll() { closeModal(); closeCart(); }

// ================================================================
//  CART PANEL
// ================================================================
function renderCartPanel() {
  const views = [cartView, deliveryView, paymentView, confirmView];
  document.getElementById('cartPanel').innerHTML = (views[checkoutStep] || cartView)();
}

const SHIPPING = 19.90;

// --- Cart view ---
function cartView() {
  const total = cartTotal() + (cart.length ? SHIPPING : 0);
  return `
    <div class="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
        </svg>
        <h2 class="font-bold text-gray-900">Carrinho</h2>
        ${cart.length ? `<span class="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">${cartQty()} ite${cartQty() > 1 ? 'ns' : 'm'}</span>` : ''}
      </div>
      <button onclick="closeCart()" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      ${!cart.length ? `
        <div class="flex flex-col items-center justify-center h-full text-center py-16">
          <div class="text-6xl mb-4">🛒</div>
          <p class="font-semibold text-gray-700 mb-1">Seu carrinho está vazio</p>
          <p class="text-sm text-gray-400 mb-4">Adicione produtos para continuar</p>
          <button onclick="closeCart()" class="text-sm text-indigo-600 font-semibold hover:underline">Ver produtos →</button>
        </div>
      ` : cart.map(item => `
        <div class="flex gap-3 bg-gray-50 rounded-xl p-3">
          <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 line-clamp-1">${item.title}</p>
            <p class="text-xs text-gray-500 mb-2">${item.condition}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center border border-gray-200 bg-white rounded-lg">
                <button onclick="updateQty(${item.id},-1)" class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900 font-bold">−</button>
                <span class="text-sm font-bold w-5 text-center">${item.qty}</span>
                <button onclick="updateQty(${item.id},1)"  class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900 font-bold">+</button>
              </div>
              <span class="text-sm font-bold text-gray-900">${fmt(item.price * item.qty)}</span>
            </div>
          </div>
          <button onclick="removeFromCart(${item.id})"
            class="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
          </button>
        </div>`).join('')}
    </div>

    ${cart.length ? `
    <div class="border-t border-gray-100 p-5 bg-white space-y-3 flex-shrink-0">
      <div class="space-y-2 text-sm">
        <div class="flex justify-between text-gray-600"><span>Subtotal</span><span>${fmt(cartTotal())}</span></div>
        <div class="flex justify-between text-gray-600"><span>Frete</span><span class="text-green-600">+ ${fmt(SHIPPING)}</span></div>
        <div class="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
          <span>Total</span><span>${fmt(total)}</span>
        </div>
      </div>
      <button onclick="checkoutStep=1; renderCartPanel()"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
        Finalizar Compra →
      </button>
      <button onclick="closeCart()" class="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1">
        Continuar comprando
      </button>
    </div>` : ''}`;
}

// --- Delivery view ---
function deliveryView() {
  return `
    <div class="flex items-center gap-3 p-5 border-b border-gray-100 flex-shrink-0">
      <button onclick="checkoutStep=0; renderCartPanel()"
        class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
      </button>
      <div class="flex-1">
        <h2 class="font-bold text-gray-900 text-sm">Endereço de Entrega</h2>
        <div class="flex gap-1 mt-1.5">
          <div class="h-1 w-10 rounded-full bg-indigo-600"></div>
          <div class="h-1 w-10 rounded-full bg-gray-200"></div>
          <div class="h-1 w-10 rounded-full bg-gray-200"></div>
        </div>
      </div>
      <button onclick="closeCart()" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-5">
      <form id="deliveryForm" onsubmit="submitDelivery(event)" class="space-y-4">
        ${[
          ['Nome completo', 'text', 'João da Silva'],
          ['CPF', 'text', '000.000.000-00'],
          ['Telefone', 'tel', '(11) 99999-9999'],
          ['CEP', 'text', '00000-000'],
          ['Endereço', 'text', 'Rua das Flores, 123 — Apto 45'],
        ].map(([label, type, ph]) => `
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">${label}</label>
            <input type="${type}" placeholder="${ph}" required
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
          </div>`).join('')}
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Cidade</label>
            <input type="text" placeholder="São Paulo" required
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
            <select required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer">
              <option value="">UF</option>
              ${['SP','RJ','MG','RS','PR','SC','BA','CE','PE','GO','DF'].map(s => `<option>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Shipping -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-2">Opção de Frete</label>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer">
              <input type="radio" name="frete" value="padrao" checked class="accent-indigo-600">
              <div class="flex-1">
                <div class="text-sm font-semibold text-gray-800">Entrega Padrão</div>
                <div class="text-xs text-gray-500">5-7 dias úteis</div>
              </div>
              <span class="text-sm font-bold text-gray-700">R$ 19,90</span>
            </label>
            <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition">
              <input type="radio" name="frete" value="expresso" class="accent-indigo-600">
              <div class="flex-1">
                <div class="text-sm font-semibold text-gray-800">Entrega Expressa</div>
                <div class="text-xs text-gray-500">1-2 dias úteis</div>
              </div>
              <span class="text-sm font-bold text-gray-700">R$ 39,90</span>
            </label>
          </div>
        </div>

        <button type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
          Continuar para Pagamento →
        </button>
      </form>
    </div>`;
}

function submitDelivery(e) { e.preventDefault(); checkoutStep = 2; renderCartPanel(); }

// --- Payment view ---
function paymentView() {
  const total = cartTotal() + SHIPPING;
  return `
    <div class="flex items-center gap-3 p-5 border-b border-gray-100 flex-shrink-0">
      <button onclick="checkoutStep=1; renderCartPanel()"
        class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
      </button>
      <div class="flex-1">
        <h2 class="font-bold text-gray-900 text-sm">Forma de Pagamento</h2>
        <div class="flex gap-1 mt-1.5">
          <div class="h-1 w-10 rounded-full bg-indigo-600"></div>
          <div class="h-1 w-10 rounded-full bg-indigo-600"></div>
          <div class="h-1 w-10 rounded-full bg-gray-200"></div>
        </div>
      </div>
      <button onclick="closeCart()" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-5">
      <!-- Summary -->
      <div class="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-1">
        <div class="flex justify-between text-gray-600"><span>Subtotal</span><span>${fmt(cartTotal())}</span></div>
        <div class="flex justify-between text-gray-600"><span>Frete</span><span>${fmt(SHIPPING)}</span></div>
        <div class="flex justify-between font-black text-base text-gray-900 pt-2 border-t border-gray-200 mt-2">
          <span>Total</span><span class="text-indigo-700">${fmt(total)}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div id="payTabs" class="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        <button id="t-pix"    onclick="switchTab('pix')"    class="flex-1 py-2 text-sm font-semibold rounded-lg bg-white shadow text-indigo-600 transition">PIX</button>
        <button id="t-card"   onclick="switchTab('card')"   class="flex-1 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-700 transition">Cartão</button>
        <button id="t-boleto" onclick="switchTab('boleto')" class="flex-1 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-700 transition">Boleto</button>
      </div>

      <!-- PIX -->
      <div id="c-pix">
        <div class="text-center">
          <div class="w-44 h-44 mx-auto mb-3 bg-white border-2 border-gray-200 rounded-xl p-2 grid grid-cols-9 gap-0.5">
            ${Array.from({length:81},()=>`<div class="rounded-sm ${Math.random()>.45?'bg-gray-900':'bg-white'}"></div>`).join('')}
          </div>
          <p class="text-sm font-semibold text-gray-700 mb-1">Escaneie o QR Code</p>
          <p class="text-xs text-gray-500 mb-3">ou copie a chave abaixo</p>
          <div class="flex gap-2">
            <input readonly value="mercadex@pagamentos.com.br"
              class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 outline-none">
            <button onclick="alert('Chave PIX copiada!')"
              class="px-3 py-2 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-200 transition">Copiar</button>
          </div>
          <p class="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Válido por 15 minutos
          </p>
        </div>
      </div>

      <!-- Card -->
      <div id="c-card" class="hidden space-y-3">
        ${[
          ['Número do Cartão','text','0000 0000 0000 0000'],
          ['Nome no Cartão','text','NOME COMO NO CARTÃO'],
        ].map(([l,t,p])=>`
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">${l}</label>
            <input type="${t}" placeholder="${p}" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition">
          </div>`).join('')}
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Validade</label>
            <input type="text" placeholder="MM/AA" maxlength="5"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
            <input type="text" placeholder="•••" maxlength="4"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Parcelas</label>
          <select class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer">
            ${[1,2,3,6,12].map(n=>`<option>${n}x de ${fmt(total/n)}${n===1?' (à vista)':' sem juros'}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Boleto -->
      <div id="c-boleto" class="hidden text-center py-4">
        <div class="text-5xl mb-3">🧾</div>
        <p class="text-sm font-semibold text-gray-700 mb-1">Boleto Bancário</p>
        <p class="text-xs text-gray-500 mb-4">Vencimento em 3 dias úteis. Aprovação em até 2 dias úteis após pagamento.</p>
        <div class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 font-mono text-xs text-gray-600 break-all">
          23793.38128 60007.577974 61947.140000 4 91800000045000
        </div>
        <button onclick="alert('Código copiado!')"
          class="mt-3 text-xs text-indigo-600 font-semibold hover:underline">Copiar linha digitável</button>
      </div>

      <button onclick="checkoutStep=3; renderCartPanel()"
        class="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
        </svg>
        Confirmar Pedido
      </button>
    </div>`;
}

function switchTab(tab) {
  ['pix','card','boleto'].forEach(t => {
    const btn = document.getElementById(`t-${t}`);
    const cnt = document.getElementById(`c-${t}`);
    if (!btn || !cnt) return;
    if (t === tab) {
      btn.classList.add('bg-white','shadow','text-indigo-600');
      btn.classList.remove('text-gray-500');
      cnt.classList.remove('hidden');
    } else {
      btn.classList.remove('bg-white','shadow','text-indigo-600');
      btn.classList.add('text-gray-500');
      cnt.classList.add('hidden');
    }
  });
}

// --- Confirm view ---
function confirmView() {
  const total = cartTotal() + SHIPPING;
  const orderNum = `MX${Date.now().toString().slice(-8)}`;
  const snapshot = [...cart];
  return `
    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
      <div class="check-pop w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>

      <h2 class="text-2xl font-black text-gray-900 mb-1">Pedido Confirmado!</h2>
      <p class="text-gray-500 text-sm mb-1">Obrigado pela sua compra no Mercadex</p>
      <span class="text-xs font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-6">#${orderNum}</span>

      <div class="w-full bg-gray-50 rounded-2xl p-4 mb-5 text-left space-y-3">
        ${snapshot.map(item => `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 line-clamp-1">${item.title}</p>
              <p class="text-xs text-gray-500">${item.qty}x · ${fmt(item.price)}</p>
            </div>
          </div>`).join('')}
        <div class="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm">
          <span>Total pago</span>
          <span class="text-green-700">${fmt(total)}</span>
        </div>
      </div>

      <div class="space-y-2 text-sm text-gray-500 mb-6 w-full">
        <p class="flex items-center gap-2 justify-center">📦 Previsão de entrega: <strong class="text-gray-700">5 a 7 dias úteis</strong></p>
        <p class="flex items-center gap-2 justify-center">📧 Confirmação enviada para o seu e-mail</p>
      </div>

      <button onclick="finishOrder()"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
        Continuar Comprando
      </button>
    </div>`;
}

function finishOrder() {
  cart = [];
  checkoutStep = 0;
  updateBadge();
  closeCart();
}

// ================================================================
//  CONTROLS
// ================================================================
function setCategory(cat) {
  currentCategory = cat;
  renderCats();
  renderGrid();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setSearch(q) { searchQuery = q; renderGrid(); }
function setSort(s)   { sortBy = s; renderGrid(); }

function resetFilters() {
  currentCategory = 'Todos';
  searchQuery = '';
  document.getElementById('searchInput').value = '';
  renderCats();
  renderGrid();
}

// ================================================================
//  INIT
// ================================================================
renderCats();
renderGrid();
renderCartPanel();