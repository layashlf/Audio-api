require('dotenv').config();
const { MeiliSearch } = require('meilisearch');
const { PrismaClient } = require('@prisma/client');

async function seedMeiliSearch() {
  const prisma = new PrismaClient();
  const client = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
  });

  try {
    //Fetch data from PostgreSQL
    const audios = await prisma.audio.findMany();
    const users = await prisma.user.findMany();

    const indexConfigs = [
      {
        uid: 'audio_files',
        data: audios,
        settings: {
          searchableAttributes: ['title'],
          rankingRules: ['words', 'typo', 'proximity', 'attribute', 'exactness'],
          displayedAttributes: ['id', 'title', 'url', 'userId'],
        },
      },
      {
        uid: 'users',
        data: users,
        settings: {
          searchableAttributes: ['email', 'displayName'],
          rankingRules: ['words', 'typo', 'proximity', 'attribute', 'exactness'],
          displayedAttributes: ['id', 'email', 'displayName'],
        },
      },
    ];

    for (const config of indexConfigs) {
      console.log(`\n Processing index: ${config.uid}`);

      //Explicitly Create Index with Primary Key
      try {
        const createJob = await client.createIndex(config.uid, { primaryKey: 'id' });
        await client.waitForTask(createJob.taskUid);
      } catch (e) {
        if (e.code === 'index_already_exists') {
          console.log(`Index already exists, skipping creation.`);
        } else {
          throw e;
        }
      }

      // Update Settings (Searchable attributes, ranking rules)
      const settingsJob = await client.index(config.uid).updateSettings(config.settings);
      await client.waitForTask(settingsJob.taskUid);
      console.log(`Settings updated for ${config.uid}`);

      // Add Documents
      if (config.data.length > 0) {
        const addDocJob = await client.index(config.uid).addDocuments(config.data);
        const result = await client.waitForTask(addDocJob.taskUid);

        if (result.status === 'failed') {
          console.error(`Task failed: ${JSON.stringify(result.error)}`);
        } else {
          console.log(`Successfully indexed ${config.data.length} ${config.uid}`);
        }
      } else {
        console.log(`No data found in Postgres for ${config.uid}.`);
      }
    }
  } catch (error) {
    console.error('Critical Seed Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n Seed Process completed ');
  }
}

seedMeiliSearch();