import { Condition, Prisma } from '@prisma/client';
import "dotenv/config";
import { prisma } from '../src/shared/db/prisma';
import { PRODUCTS } from '../../frontend/src/shared/mocks/products.ts';

const STOCK_DEFAULT = 10;

const conditionMap: Record<string, Condition> = {
  Novo: Condition.NOVO,
  Excelente: Condition.EXCELENTE,
  Bom: Condition.BOM,
  Usado: Condition.USADO,
};

function mapCondition(value: string): Condition {
  const mapped = conditionMap[value];
  if (!mapped) {
    throw new Error(`Condição inválida no mock: ${value}`);
  }

  return mapped;
}

async function main() {
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    throw new Error('Usuário ADMIN não encontrado no banco de dados');
  }

  const categoryNames = [...new Set(PRODUCTS.map((product) => product.category))];
  const categories = await prisma.category.findMany({
    where: {
      name: {
        in: categoryNames,
      },
    },
  });

  const categoryByName = new Map(categories.map((category) => [category.name, category]));
  const missingCategories = categoryNames.filter((name) => !categoryByName.has(name));

  if (missingCategories.length > 0) {
    throw new Error(`Categorias ausentes no banco: ${missingCategories.join(', ')}`);
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const product of PRODUCTS) {
    const category = categoryByName.get(product.category);

    if (!category) {
      throw new Error(`Categoria não encontrada: ${product.category}`);
    }

    const data = {
      title: product.title,
      description: product.description,
      price: new Prisma.Decimal(product.price),
      condition: mapCondition(product.condition),
      images: [{ url: product.image }],
      stock: STOCK_DEFAULT,
      viewsCount: product.views,
      sellerId: adminUser.id,
      categoryId: category.id,
    };

    const existing = await prisma.product.findFirst({
      where: {
        title: product.title,
        sellerId: adminUser.id,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data,
      });
      updatedCount++;
      console.log(`↻ Produto atualizado: ${product.title}`);
      continue;
    }

    await prisma.product.create({ data });
    createdCount++;
    console.log(`✓ Produto criado: ${product.title}`);
  }

  console.log(
    `\n✨ Importação concluída. Criados: ${createdCount}, atualizados: ${updatedCount}, total processado: ${PRODUCTS.length}`,
  );
}

main()
  .catch(async (error) => {
    console.error('❌ Erro ao importar produtos:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
