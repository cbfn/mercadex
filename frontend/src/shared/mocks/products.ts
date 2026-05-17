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
  },
  {
    id: 13,
    title: "Samsung Galaxy A54 5G 128GB",
    category: "Smartphones",
    price: 1199,
    originalPrice: 1799,
    condition: "Bom",
    seller: "SamsungPro RJ",
    sellerRating: 4.7,
    sales: 314,
    description:
      "Galaxy A54 5G em bom estado. Pequenos arranhões na traseira, tela sem marcas. Bateria com 88% de saúde. Acompanha carregador 25W e caixa original. Desbloqueado.",
    specs: ["Tela Super AMOLED 6.4\"", "Exynos 1380 5G", "Câmera 50MP OIS", "128GB + slot microSD", "IP67 resistente à água"],
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop",
    views: 876
  },
  {
    id: 14,
    title: "Motorola Edge 40 Pro 256GB",
    category: "Smartphones",
    price: 2199,
    originalPrice: 3499,
    condition: "Excelente",
    seller: "TechStore SP",
    sellerRating: 4.8,
    sales: 128,
    description:
      "Motorola Edge 40 Pro em excelente estado. Sem marcas visíveis. Bateria com 94% de saúde. Carregamento turbo 125W incluso. Desbloqueado para todas as operadoras.",
    specs: ["Tela pOLED 165Hz 6.67\"", "Snapdragon 8 Gen 2", "Câmera 50MP Gimbal OIS", "256GB UFS 4.0", "IP68 certificado"],
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop",
    views: 654
  },
  {
    id: 15,
    title: "Lenovo ThinkPad X1 Carbon i7 16GB",
    category: "Notebooks",
    price: 6299,
    originalPrice: 9999,
    condition: "Excelente",
    seller: "NotebookPro",
    sellerRating: 4.4,
    sales: 19,
    description:
      "ThinkPad X1 Carbon Gen 10 em excelente estado. Leve e ultrafino, ideal para executivos e viajantes. Bateria com 90% de saúde. Acompanha carregador USB-C 65W.",
    specs: ["Intel Core i7-1265U", "16GB LPDDR5", "SSD 512GB NVMe", "Tela IPS 14\" 2.8K", "Peso 1.12kg"],
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400&auto=format&fit=crop",
    views: 389
  },
  {
    id: 16,
    title: "ASUS ROG Zephyrus G14 RTX 4060",
    category: "Notebooks",
    price: 7499,
    originalPrice: 11499,
    condition: "Bom",
    seller: "GamerStore",
    sellerRating: 4.6,
    sales: 41,
    description:
      "ROG Zephyrus G14 em bom estado. Pequenas marcas no palmrest. Pasta térmica renovada há 2 meses. Desempenho excepcional em jogos e renderização 3D.",
    specs: ["AMD Ryzen 9 7940HS", "RTX 4060 8GB", "16GB DDR5 5600MHz", "SSD 1TB NVMe", "Tela QHD 165Hz 14\""],
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=400&auto=format&fit=crop",
    views: 712
  },
  {
    id: 17,
    title: "Xbox Series X 1TB",
    category: "Games",
    price: 2499,
    originalPrice: 3799,
    condition: "Excelente",
    seller: "GamerStore",
    sellerRating: 4.6,
    sales: 93,
    description:
      "Xbox Series X em excelente estado. Sem marcas visíveis. Acompanha 1 controle sem fio e todos os cabos originais. Game Pass Ultimate não incluso.",
    specs: ["CPU AMD Zen 2 8-core 3.8GHz", "GPU 12 TFLOPS RDNA 2", "16GB GDDR6", "SSD NVMe 1TB", "4K 120fps / 8K suporte"],
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=400&auto=format&fit=crop",
    views: 1834
  },
  {
    id: 18,
    title: "Nintendo Switch Lite Amarelo",
    category: "Games",
    price: 899,
    originalPrice: 1499,
    condition: "Usado",
    seller: "NintendoFan",
    sellerRating: 4.3,
    sales: 67,
    description:
      "Nintendo Switch Lite amarelo com marcas de uso normais. Tela sem arranhões. Bateria dura em média 5 horas. Não acompanha jogos. Ótimo para jogar em qualquer lugar.",
    specs: ["Tela LCD 5.5\"", "32GB armazenamento", "Autonomia 3-7h", "Controles integrados", "Slot microSD"],
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=400&auto=format&fit=crop",
    views: 923
  },
  {
    id: 19,
    title: "Samsung Galaxy Tab S9 Wi-Fi 128GB",
    category: "Tablets",
    price: 3199,
    originalPrice: 4799,
    condition: "Excelente",
    seller: "MobileDeals",
    sellerRating: 4.5,
    sales: 52,
    description:
      "Galaxy Tab S9 em excelente estado. S Pen inclusa. Tela Dynamic AMOLED sem marcas. Bateria com 96% de saúde. Caixa e carregador 45W originais inclusos.",
    specs: ["Snapdragon 8 Gen 2", "Tela Dynamic AMOLED 11\"", "128GB + microSD", "S Pen inclusa", "IP68 certificado"],
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=400&auto=format&fit=crop",
    views: 487
  },
  {
    id: 20,
    title: "Xiaomi Pad 6 Wi-Fi 256GB",
    category: "Tablets",
    price: 1699,
    originalPrice: 2499,
    condition: "Bom",
    seller: "MobileDeals",
    sellerRating: 4.5,
    sales: 38,
    description:
      "Xiaomi Pad 6 em bom estado. Pequenas marcas na traseira. Tela sem arranhões. Ótimo para consumo de mídia e produtividade. Carregador 33W incluso.",
    specs: ["Snapdragon 870", "Tela IPS 144Hz 11\"", "256GB UFS 3.1", "8840mAh bateria", "MIUI Pad 14"],
    image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?q=80&w=400&auto=format&fit=crop",
    views: 312
  },
  {
    id: 21,
    title: "JBL Charge 5 Caixa Bluetooth",
    category: "Áudio",
    price: 699,
    originalPrice: 1099,
    condition: "Excelente",
    seller: "AudioWorld",
    sellerRating: 4.8,
    sales: 176,
    description:
      "JBL Charge 5 em excelente estado. Som potente com graves profundos. Resistente à água IP67. Bateria com 93% de saúde, dura até 20 horas. Caixa original inclusa.",
    specs: ["40W RMS", "IP67 resistente à água", "Até 20h de bateria", "Bluetooth 5.1", "Powerbank integrado"],
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400&auto=format&fit=crop",
    views: 445
  },
  {
    id: 22,
    title: "Bose QuietComfort 45 Branco",
    category: "Áudio",
    price: 1499,
    originalPrice: 2499,
    condition: "Bom",
    seller: "AudioWorld",
    sellerRating: 4.8,
    sales: 89,
    description:
      "Bose QC45 em bom estado. Pequenas marcas nas hastes. ANC de referência para viagens. Bateria com 87% de saúde. Estojo original e cabo USB-C inclusos.",
    specs: ["ANC adaptativo", "Até 24h de bateria", "Bluetooth 5.1 Multipoint", "Modo Aware", "Dobrável para viagem"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
    views: 367
  },
  {
    id: 23,
    title: "Sony Alpha ZV-E10 + Lente 16-50mm",
    category: "Câmeras",
    price: 2899,
    originalPrice: 4299,
    condition: "Excelente",
    seller: "FotoGear",
    sellerRating: 4.6,
    sales: 34,
    description:
      "Sony ZV-E10 mirrorless ideal para criadores de conteúdo. Menos de 2.000 disparos. Microfone direcional integrado. Tela articulada para vlogging. Caixa e carregador inclusos.",
    specs: ["Sensor APS-C 24.2MP", "Vídeo 4K 30fps", "AF em tempo real", "Tela LCD articulada", "Microfone direcional 3 cápsulas"],
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400&auto=format&fit=crop",
    views: 521
  },
  {
    id: 24,
    title: "GoPro Hero 12 Black",
    category: "Câmeras",
    price: 1799,
    originalPrice: 2799,
    condition: "Excelente",
    seller: "FotoGear",
    sellerRating: 4.6,
    sales: 61,
    description:
      "GoPro Hero 12 Black em excelente estado. Poucas horas de uso. Acompanha 2 baterias, carregador duplo e case de proteção. Perfeita para esportes e aventuras.",
    specs: ["Vídeo 5.3K 60fps", "Foto 27MP", "HyperSmooth 6.0", "Resistente à água 10m", "Tela frontal e traseira"],
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop",
    views: 698
  },
  {
    id: 25,
    title: "Garmin Forerunner 255 GPS",
    category: "Wearables",
    price: 1399,
    originalPrice: 2199,
    condition: "Excelente",
    seller: "WatchStore",
    sellerRating: 4.9,
    sales: 47,
    description:
      "Garmin Forerunner 255 em excelente estado. Ideal para corredores e triatletas. GPS multibanda preciso. Bateria com 95% de saúde, dura até 14 dias. Carregador incluso.",
    specs: ["GPS multibanda", "Até 14 dias de bateria", "Monitor cardíaco 24/7", "VO2 Max e Training Load", "Pagamentos Garmin Pay"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
    views: 334
  },
  {
    id: 26,
    title: "Xiaomi Mi Band 8 Pro",
    category: "Wearables",
    price: 349,
    originalPrice: 599,
    condition: "Novo",
    seller: "AcessoriosPro",
    sellerRating: 4.7,
    sales: 412,
    description:
      "Xiaomi Mi Band 8 Pro lacrada, sem uso. Tela AMOLED grande e brilhante. Monitoramento completo de saúde e esportes. Melhor custo-benefício em wearables.",
    specs: ["Tela AMOLED 1.74\"", "GPS integrado", "Até 14 dias de bateria", "150+ modos esportivos", "SpO2 e frequência cardíaca"],
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=400&auto=format&fit=crop",
    views: 1567
  },
  {
    id: 27,
    title: "Hub USB-C 7 em 1 Baseus",
    category: "Acessórios",
    price: 149,
    originalPrice: 249,
    condition: "Novo",
    seller: "AcessoriosPro",
    sellerRating: 4.7,
    sales: 634,
    description:
      "Hub USB-C 7 em 1 Baseus lacrado. Compatível com MacBook, iPad Pro e notebooks USB-C. Expande conectividade com múltiplas portas de alta velocidade.",
    specs: ["HDMI 4K 60Hz", "2x USB-A 3.0", "USB-C PD 100W", "Leitor SD/microSD", "Ethernet Gigabit"],
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=400&auto=format&fit=crop",
    views: 1893
  },
  {
    id: 28,
    title: "Suporte Articulado para Monitor 27\"",
    category: "Acessórios",
    price: 189,
    originalPrice: 329,
    condition: "Bom",
    seller: "AcessoriosPro",
    sellerRating: 4.7,
    sales: 157,
    description:
      "Suporte articulado para monitor de até 27\" e 8kg. Pequenas marcas de uso. Ajuste de altura, inclinação e rotação. Passagem de cabos integrada. Fixação por garra ou furo.",
    specs: ["Suporta até 27\" / 8kg", "VESA 75x75 e 100x100", "Rotação 360°", "Inclinação ±45°", "Passagem de cabos"],
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop",
    views: 743
  },
  {
    id: 29,
    title: "Teclado Mecânico Keychron K2 Pro",
    category: "Acessórios",
    price: 499,
    originalPrice: 799,
    condition: "Excelente",
    seller: "AcessoriosPro",
    sellerRating: 4.7,
    sales: 213,
    description:
      "Keychron K2 Pro em excelente estado. Teclado mecânico compacto 75% com switches Gateron Red. Compatível com Mac e Windows. Bluetooth 5.1 e cabo USB-C. Poucas semanas de uso.",
    specs: ["Layout 75% compacto", "Switches Gateron Red", "Bluetooth 5.1 + USB-C", "Retroiluminação RGB", "Compatível Mac/Windows"],
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop",
    views: 1124
  },
  {
    id: 30,
    title: "Nikon Z30 + Lente 16-50mm DX",
    category: "Câmeras",
    price: 3299,
    originalPrice: 4999,
    condition: "Excelente",
    seller: "FotoGear",
    sellerRating: 4.6,
    sales: 22,
    description:
      "Nikon Z30 mirrorless compacta ideal para vlogging e streaming. Menos de 1.500 disparos. Tela articulada touchscreen. Sem espelho, leve e discreta. Caixa e carregador inclusos.",
    specs: ["Sensor APS-C 20.9MP", "Vídeo 4K UHD 30fps", "AF por detecção de fase", "Tela articulada touchscreen", "Wi-Fi + Bluetooth"],
    image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?q=80&w=400&auto=format&fit=crop",
    views: 418
  },
  {
    id: 31,
    title: "Microsoft Surface Pro 9 i5 8GB",
    category: "Tablets",
    price: 4299,
    originalPrice: 6499,
    condition: "Excelente",
    seller: "MobileDeals",
    sellerRating: 4.5,
    sales: 29,
    description:
      "Surface Pro 9 em excelente estado. Tablet e notebook em um só. Teclado Type Cover não incluso. Caneta Surface Slim Pen 2 inclusa. Bateria com 93% de saúde.",
    specs: ["Intel Core i5-1235U", "8GB LPDDR5", "SSD 256GB", "Tela PixelSense 13\" 120Hz", "Windows 11 Pro"],
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=400&auto=format&fit=crop",
    views: 561
  },
  {
    id: 32,
    title: "Samsung Galaxy Watch 6 Classic 47mm",
    category: "Wearables",
    price: 1599,
    originalPrice: 2499,
    condition: "Excelente",
    seller: "WatchStore",
    sellerRating: 4.9,
    sales: 74,
    description:
      "Galaxy Watch 6 Classic 47mm em excelente estado. Bisel giratório físico icônico. Monitoramento avançado de saúde e sono. Bateria com 92% de saúde. Carregador e caixa inclusos.",
    specs: ["Bisel giratório físico", "Tela Super AMOLED 1.5\"", "GPS + BeiDou + Glonass", "Sensor BioActive 3 em 1", "Wear OS + One UI Watch 5"],
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop",
    views: 829
  },
  {
    id: 33,
    title: "Logitech G502 HERO",
    category: "Acessórios",
    price: 499,
    originalPrice: 699,
    condition: "Excelente",
    seller: "Logitech Store",
    sellerRating: 4.9,
    sales: 128,
    description:
      "Mouse gamer Logitech G502 HERO com sensor HERO 25K e personalização de peso. Botões programáveis e iluminação RGB para longas sessões de jogo.",
    specs: [
      "Sensor HERO 25K",
      "11 botões programáveis",
      "Peso ajustável",
      "Iluminação RGB",
      "Designed for FPS e MMO"
    ],
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop",
    views: 612
  },
  {
    id: 34,
    title: "Razer DeathAdder V2",
    category: "Acessórios",
    price: 349,
    originalPrice: 499,
    condition: "Excelente",
    seller: "Razer Brasil",
    sellerRating: 4.8,
    sales: 204,
    description:
      "Mouse Razer DeathAdder V2 com design ergonômico e switches ópticos rápidos. Ideal para jogos e produtividade com precisão de até 20.000 DPI.",
    specs: [
      "Sensor Focus+ 20K DPI",
      "Switches ópticos Razer",
      "6 botões programáveis",
      "Chassi leve",
      "Ergonomia para mão direita"
    ],
    image: "https://images.unsplash.com/photo-1554876194-024e06bbc3cf?auto=format&fit=crop&fm=jpg&q=60&w=3000",
    views: 847
  },
  {
    id: 35,
    title: "Microsoft Surface Precision Mouse",
    category: "Acessórios",
    price: 429,
    originalPrice: 649,
    condition: "Bom",
    seller: "Microsoft Store",
    sellerRating: 4.7,
    sales: 76,
    description:
      "Mouse Microsoft Surface Precision com rolamento suave e múltiplos dispositivos Bluetooth. Excelente para trabalho híbrido e controle preciso em planilhas.",
    specs: [
      "Conexão Bluetooth / USB",
      "4 botões programáveis",
      "Até 3 dispositivos pareados",
      "Rastreamento preciso",
      "Design ergonômico premium"
    ],
    image: "https://images.unsplash.com/photo-1527430253228-e93688616381?q=80&w=400&auto=format&fit=crop",
    views: 412
  }
];
