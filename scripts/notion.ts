import { Client } from '@notionhq/client';

// TODO: add assertion

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID as string;

export async function initAllStars() {
    const database = await notion.databases.query({
        database_id: databaseId,
    });

    const pages = database.results;

    console.log(database);

    console.log(JSON.stringify(pages, null, 2));
}
