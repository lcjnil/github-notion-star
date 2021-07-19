import { github } from './libs/github';
import { notion } from './libs/notion';

async function fullSync() {
    await Promise.all([github.fullSync(), notion.fullSync()]);

    for (const repo of github.repoList) {
        if (!notion.hasPage(repo.nameWithOwner)) {
            await notion.insertPage(repo);
        }
    }
}

async function partialSync() {
    await Promise.all([github.getList(), notion.fullSync()]);
    for (const repo of github.repoList) {
        if (notion.hasPage(repo.nameWithOwner)) {
            console.log(`Skip saved page ${repo.nameWithOwner}`);
            continue;
        }
        await notion.insertPage(repo);
    }
}

if (process.env.FULL_SYNC) {
    fullSync();
} else {
    partialSync();
}
