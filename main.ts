import * as dotenv from 'dotenv';
dotenv.config();

import { github } from './libs/github';
import { notion } from './libs/notion';
import assert from 'assert';

async function fullSync() {
    await Promise.all([github.fullSync(), notion.fullSyncIfNeeded()]);

    for (const repo of github.repoList) {
        if (!notion.hasPage(repo.nameWithOwner)) {
            await notion.insertPage(repo);
        }
    }
}

async function partialSync() {
    await Promise.all([github.getList(), notion.fullSyncIfNeeded()]);

    for (const repo of github.repoList.reverse()) {
        if (notion.hasPage(repo.nameWithOwner)) {
            console.log(`Skip saved page ${repo.nameWithOwner}`);
            continue;
        }

        await notion.insertPage(repo);
    }
}

async function fullSyncAndUpdate() {
    await Promise.all([github.fullSync(), notion.getPageList()]);
    for (const page of notion.pageList) {
    }
}

const ENVS = ['NOTION_API_KEY', 'NOTION_DATABASE_ID', 'TOKEN_OF_GITHUB'];

ENVS.forEach((env) => {
    assert(process.env[env], `${env} must be added`);
});

if (process.env.FULL_SYNC) {
    if (process.env.FULL_SYNC_UPDATE) {
        fullSyncAndUpdate();
    } else {
        fullSync();
    }
} else {
    partialSync();
}
