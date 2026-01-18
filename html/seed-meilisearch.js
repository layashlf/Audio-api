const { MeiliSearch } = require('meilisearch');
const { PrismaClient } = require('@prisma/client');

async function seedMeiliSearch() {
  const prisma = new PrismaClient();
  const client = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://meilisearch:7700',
    apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
  });

  // Fetch all audios
  const audios = await prisma.audio.findMany({
    select: {
      id: true,
      title: true,
      userId: true,
      promptId: true,
    },
  });

  // Fetch all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  });

  if (audios.length > 0) {
    const audioIndex = client.index('audios');
    await audioIndex.addDocuments(audios);
    console.log(`Indexed ${audios.length} audios`);
  }

  if (users.length > 0) {
    const userIndex = client.index('users');
    await userIndex.addDocuments(users);
    console.log(`Indexed ${users.length} users`);
  }

  await prisma.$disconnect();
}

seedMeiliSearch().catch(console.error);