require('dotenv').config();
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
    try {
      const audioIndex = client.index('audios');
      const task = await audioIndex.addDocuments(audios);
      await client.waitForTask(task.taskUid);
      console.log(`Indexed ${audios.length} audios`);
    } catch (error) {
      console.error('Error indexing audios:', error.message);
    }
  }

  if (users.length > 0) {
    try {
      const userIndex = client.index('users');
      const task = await userIndex.addDocuments(users);
      await client.waitForTask(task.taskUid);
      console.log(`Indexed ${users.length} users`);
    } catch (error) {
      console.error('Error indexing users:', error.message);
    }
  }

  await prisma.$disconnect();
}

seedMeiliSearch().catch(console.error);