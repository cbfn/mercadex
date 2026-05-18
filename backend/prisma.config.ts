import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // url é necessária para prisma migrate
        url: env('DATABASE_URL'),
    },
});
