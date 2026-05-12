import type { Category, Product } from "@/shared/types/catalog";

export const CATEGORIES: Category[] = [
  { label: "Todos", icon: "🏠" },
  { label: "Smartphones", icon: "📱" },
  { label: "Notebooks", icon: "💻" },
  { label: "Games", icon: "🎮" },
  { label: "Tablets", icon: "📟" },
  { label: "Áudio", icon: "🎧" },
  { label: "Câmeras", icon: "📷" },
  { label: "Wearables", icon: "⌚" },
  { label: "Acessórios", icon: "🔌" }
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "iPhone 14 Pro 256GB",
    category: "Smartphones",
    price: 2999,
    originalPrice: 4299,
    condition: "Excelente",
    seller: "TechStore SP",
    sellerRating: 4.8,
    sales: 342,
    description:
      "iPhone 14 Pro em excelente estado. Sem arranhões visíveis, bateria com 89% de saúde. Acompanha cabo original, carregador 20W e caixa completa. Desbloqueado para todas as operadoras.",
    specs: [
      "Tela Super Retina XDR 6.1\"",
      "Chip A16 Bionic",
      "Câmera 48MP Triple",
      "256GB armazenamento",
      "iOS 17 atualizado"
    ],
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=400&auto=format&fit=crop",
    views: 1243
  },
  {
    id: 2,
    title: "MacBook Pro M2 14\" 512GB",
    category: "Notebooks",
    price: 8499,
    originalPrice: 12999,
    condition: "Excelente",
    seller: "AppleZone",
    sellerRating: 4.9,
    sales: 87,
    description:
      "MacBook Pro M2 em perfeito estado. Bateria com apenas 95 ciclos. Acompanha carregador MagSafe original e caixa. Performance excepcional para desenvolvimento e design.",
    specs: ["Chip Apple M2 Pro", "Tela Liquid Retina XDR 14\"", "16GB RAM unificada", "512GB SSD", "macOS Sonoma"],
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop",
    views: 892
  },
  {
    id: 3,
    title: "PlayStation 5 + 2 Controles",
    category: "Games",
    price: 2799,
    originalPrice: 3999,
    condition: "Bom",
    seller: "GamerStore",
    sellerRating: 4.6,
    sales: 156,
    description:
      "PlayStation 5 Edition Disc em bom estado. Pequena marca na lateral, funciona perfeitamente. Acompanha 2 controles DualSense e todos os cabos. Sem jogos inclusos.",
    specs: ["CPU AMD Zen 2 8-core", "GPU 10.28 TFLOPS", "16GB GDDR6", "SSD 825GB ultrarrápido", "Leitor Blu-ray 4K"],
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
    views: 2156
  },
  {
    id: 4,
    title: "Samsung Galaxy S23 Ultra 256GB",
    category: "Smartphones",
    price: 3299,
    originalPrice: 5499,
    condition: "Bom",
    seller: "SamsungPro RJ",
    sellerRating: 4.7,
    sales: 201,
    description:
      "Galaxy S23 Ultra com S Pen inclusa. Pequenos arranhões na tela (invisíveis com ela ligada). Bateria com 92% de saúde. Carregador 45W e caixa inclusos.",
    specs: ["Tela Dynamic AMOLED 6.8\"", "Snapdragon 8 Gen 2", "Câmera 200MP Quad", "256GB armazenamento", "S Pen integrada"],
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=400&auto=format&fit=crop",
    views: 987
  },
  {
    id: 5,
    title: "iPad Air 5ª Geração Wi-Fi 64GB",
    category: "Tablets",
    price: 2199,
    originalPrice: 3299,
    condition: "Excelente",
    seller: "MobileDeals",
    sellerRating: 4.5,
    sales: 64,
    description:
      "iPad Air 5ª geração em excelente estado, sem marcas. Chip M1 ultra-rápido. Compatível com Apple Pencil 2ª geração (não incluso). Acompanha cabo USB-C e caixa original.",
    specs: ["Chip Apple M1", "Tela Liquid Retina 10.9\"", "64GB armazenamento", "iPadOS 17", "Touch ID lateral"],
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop",
    views: 543
  },
  {
    id: 6,
    title: "AirPods Pro 2ª Geração MagSafe",
    category: "Áudio",
    price: 1099,
    originalPrice: 1699,
    condition: "Excelente",
    seller: "AudioWorld",
    sellerRating: 4.8,
    sales: 289,
    description:
      "AirPods Pro 2ª geração com estojo MagSafe. Em perfeito estado, poucas horas de uso. Cancelamento de ruído ativo e modo transparência. Caixa original e todos os acessórios.",
    specs: ["Chip H2", "ANC adaptativo", "Áudio Espacial Personalizado", "Até 30h total (estojo)", "Resistência IP54"],
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=400&auto=format&fit=crop",
    views: 678
  },
  {
    id: 7,
    title: "Nintendo Switch OLED Branco",
    category: "Games",
    price: 1599,
    originalPrice: 2299,
    condition: "Usado",
    seller: "NintendoFan",
    sellerRating: 4.3,
    sales: 45,
    description:
      "Nintendo Switch OLED na cor branca. Marcas de uso na dock e Joy-Con. Funciona perfeitamente. Não acompanha cartuchos de jogos. Ótima opção custo-benefício.",
    specs: ["Tela OLED 7\"", "64GB armazenamento", "Autonomia 4.5-9h", "Dock OLED inclusa", "Joy-Con brancos"],
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=400&auto=format&fit=crop",
    views: 1102
  },
  {
    id: 8,
    title: "Dell XPS 15 i7 + RTX 3050 Ti",
    category: "Notebooks",
    price: 5499,
    originalPrice: 8999,
    condition: "Bom",
    seller: "NotebookPro",
    sellerRating: 4.4,
    sales: 32,
    description:
      "Dell XPS 15 em bom estado. Arranhões na tampa (não visíveis aberto). Bateria substituída há 3 meses com 100% de saúde. Ideal para programação e edição de vídeo.",
    specs: ["Intel Core i7-12700H", "NVIDIA RTX 3050 Ti 4GB", "16GB DDR5", "SSD 512GB NVMe", "Tela 4K OLED 15.6\""],
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=400&auto=format&fit=crop",
    views: 421
  },
  {
    id: 9,
    title: "Apple Watch Series 8 GPS 45mm",
    category: "Wearables",
    price: 1799,
    originalPrice: 2999,
    condition: "Excelente",
    seller: "WatchStore",
    sellerRating: 4.9,
    sales: 118,
    description:
      "Apple Watch Series 8 GPS 45mm em excelente estado. Pulseira original meia-noite inclusa. Bateria com 91% de saúde. Inclui carregador magnético e caixa original.",
    specs: ["Chip S8 SiP", "GPS + Altímetro", "Sensor temperatura corporal", "Detecção de acidentes", "watchOS 10"],
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=400&auto=format&fit=crop",
    views: 765
  },
  {
    id: 10,
    title: "Sony WH-1000XM5 Preto",
    category: "Áudio",
    price: 1299,
    originalPrice: 2199,
    condition: "Excelente",
    seller: "AudioWorld",
    sellerRating: 4.8,
    sales: 203,
    description:
      "Sony WH-1000XM5 em excelente estado. Melhor ANC da categoria. Acompanha estojo original, cabo USB-C e adaptador de avião. Pouco tempo de uso.",
    specs: ["ANC líder de mercado", "Até 30h de bateria", "Bluetooth 5.2 Multipoint", "LDAC Hi-Res Audio", "Microfone duplo beamforming"],
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop",
    views: 532
  },
  {
    id: 11,
    title: "Canon EOS R50 + Lente 18-45mm",
    category: "Câmeras",
    price: 3799,
    originalPrice: 5499,
    condition: "Bom",
    seller: "FotoGear",
    sellerRating: 4.6,
    sales: 28,
    description:
      "Canon EOS R50 mirrorless com lente kit 18-45mm STM. Menos de 3.000 disparos. Perfeita para iniciar em fotografia e criação de conteúdo.",
    specs: ["Sensor APS-C 24.2MP", "Processador DIGIC X", "AF Dual Pixel CMOS II", "Vídeo 4K 30fps", "Wi-Fi + Bluetooth"],
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop",
    views: 344
  },
  {
    id: 12,
    title: "Carregador Apple MagSafe 15W",
    category: "Acessórios",
    price: 199,
    originalPrice: 349,
    condition: "Novo",
    seller: "AcessoriosPro",
    sellerRating: 4.7,
    sales: 892,
    description:
      "Carregador MagSafe original Apple 15W. Lacrado, sem uso. Compatível com iPhone 12 ou superior. Certificado MFi original pela Apple.",
    specs: ["15W para iPhone 15", "Conexão USB-C", "Cabo 1 metro", "Original Apple certificado", "MFi Certificado"],
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400&auto=format&fit=crop",
    views: 2341
  }
];
