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

// …6373 tokens truncated…0.5">
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
