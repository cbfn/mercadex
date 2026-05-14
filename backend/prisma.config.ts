import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import { PrismaNeon } from '@prisma/adapter-neon';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // url é necessária para prisma migrate
        url: env('DATABASE_URL'),
        // adapter é usado pelo PrismaClient em runtime
        adapter: () => new PrismaNeon({ connectionString: env('DATABASE_URL') }),
    },
});
