import { Condition } from "@prisma/client";
import "dotenv/config";
import { prisma } from "../dist/shared/db/prisma.js";

async function main() {
  // Buscar o usuário ADMIN existente
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    throw new Error("Usuário ADMIN não encontrado no banco de dados");
  }

  console.log(`✓ Usuário ADMIN encontrado: ${adminUser.email}`);

  // Produtos para inserir
  const productsToSeed = [
    {
      title: "iPhone 14 Pro 256GB",
      category: "Smartphones",
      price: "2999.00",
      condition: "EXCELENTE" as Condition,
      description:
        "iPhone 14 Pro em excelente estado. Sem arranhões visíveis, bateria com 89% de saúde. Acompanha cabo original, carregador 20W e caixa completa. Desbloqueado para todas as operadoras.",
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=400&auto=format&fit=crop",
      views: 1243,
      stock: 5,
    },
    {
      title: "MacBook Pro M2 14\" 512GB",
      category: "Notebooks",
      price: "8499.00",
      condition: "EXCELENTE" as Condition,
      description:
        "MacBook Pro M2 em perfeito estado. Bateria com apenas 95 ciclos. Acompanha carregador MagSafe original e caixa. Performance excepcional para desenvolvimento e design.",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop",
      views: 892,
      stock: 3,
    },
    {
      title: "PlayStation 5 + 2 Controles",
      category: "Games",
      price: "2799.00",
      condition: "BOM" as Condition,
      description:
        "PlayStation 5 Edition Disc em bom estado. Pequena marca na lateral, funciona perfeitamente. Acompanha 2 controles DualSense e todos os cabos. Sem jogos inclusos.",
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
      views: 2156,
      stock: 2,
    },
    {
      title: "Samsung Galaxy S23 Ultra 256GB",
      category: "Smartphones",
      price: "3299.00",
      condition: "BOM" as Condition,
      description:
        "Galaxy S23 Ultra com S Pen inclusa. Pequenos arranhões na tela (invisíveis com ela ligada). Bateria com 92% de saúde. Carregador 45W e caixa inclusos.",
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=400&auto=format&fit=crop",
      views: 987,
      stock: 4,
    },
    {
      title: "iPad Air 5ª Geração Wi-Fi 64GB",
      category: "Tablets",
      price: "2199.00",
      condition: "EXCELENTE" as Condition,
      description:
        "iPad Air 5ª geração em excelente estado, sem marcas. Chip M1 ultra-rápido. Compatível com Apple Pencil 2ª geração (não incluso). Acompanha cabo USB-C e caixa original.",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop",
      views: 543,
      stock: 3,
    },
    {
      title: "AirPods Pro 2ª Geração MagSafe",
      category: "Áudio",
      price: "1099.00",
      condition: "EXCELENTE" as Condition,
      description:
        "AirPods Pro 2ª geração com estojo MagSafe. Em perfeito estado, poucas horas de uso. Cancelamento de ruído ativo e modo transparência. Caixa original e todos os acessórios.",
      image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=400&auto=format&fit=crop",
      views: 678,
      stock: 8,
    },
    {
      title: "Nintendo Switch OLED Branco",
      category: "Games",
      price: "1599.00",
      condition: "USADO" as Condition,
      description:
        "Nintendo Switch OLED na cor branca. Marcas de uso na dock e Joy-Con. Funciona perfeitamente. Não acompanha cartuchos de jogos. Ótima opção custo-benefício.",
      image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=400&auto=format&fit=crop",
      views: 1102,
      stock: 2,
    },
    {
      title: "Dell XPS 15 i7 + RTX 3050 Ti",
      category: "Notebooks",
      price: "5499.00",
      condition: "BOM" as Condition,
      description:
        "Dell XPS 15 em bom estado. Arranhões na tampa (não visíveis aberto). Bateria substituída há 3 meses com 100% de saúde. Ideal para programação e edição de vídeo.",
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=400&auto=format&fit=crop",
      views: 421,
      stock: 2,
    },
    {
      title: "Apple Watch Series 8 GPS 45mm",
      category: "Wearables",
      price: "1799.00",
      condition: "EXCELENTE" as Condition,
      description:
        "Apple Watch Series 8 GPS 45mm em excelente estado. Pulseira original meia-noite inclusa. Bateria com 91% de saúde. Inclui carregador magnético e caixa original.",
      image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=400&auto=format&fit=crop",
      views: 765,
      stock: 4,
    },
    {
      title: "Sony WH-1000XM5 Preto",
      category: "Áudio",
      price: "1299.00",
      condition: "EXCELENTE" as Condition,
      description:
        "Sony WH-1000XM5 em excelente estado. Melhor ANC da categoria. Acompanha estojo original, cabo USB-C e adaptador de avião. Pouco tempo de uso.",
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop",
      views: 532,
      stock: 6,
    },
  ];

  // Criar produtos
  let createdCount = 0;
  for (const productData of productsToSeed) {
    // Buscar a categoria
    const category = await prisma.category.findUnique({
      where: { name: productData.category },
    });

    if (!category) {
      console.warn(`⚠ Categoria "${productData.category}" não encontrada. Pulando produto: ${productData.title}`);
      continue;
    }

    // Criar o produto
    const product = await prisma.product.create({
      data: {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        condition: productData.condition,
        images: [{ url: productData.image }],
        stock: productData.stock,
        viewsCount: productData.views,
        sellerId: adminUser.id,
        categoryId: category.id,
      },
    });

    console.log(`✓ Produto criado: ${product.title} (ID: ${product.id})`);
    createdCount++;
  }

  console.log(`\n✨ Total: ${createdCount} produtos inseridos com sucesso!`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("❌ Erro ao executar seed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
