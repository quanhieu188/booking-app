import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash: "not-a-real-hash", // ngày 4 sẽ làm hash thật
      name: "Demo Host",
      slug: "demo",
      timezone: "Asia/Ho_Chi_Minh",
      slotMinutes: 30,
      availabilities: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startMin: 540, // 09:00
          endMin: 1020, // 17:00
        })),
      },
    },
  });
  console.log("Seeded host:", user.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());