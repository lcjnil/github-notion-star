import * as dotenv from 'dotenv';
dotenv.config();

import { notion } from '../libs/notion';
import { github } from '../libs/github';
import { writeFile } from 'fs';
import path from 'path';

notion.updatePage();

async function run() {
    await github.fullSync();

    const repoData = new Uint8Array(Buffer.from(JSON.stringify(github.repoList)));
    writeFile(path.join(__dirname, './tmp/repo.json'), repoData, (err) => {
        if (err) throw err;
        console.log('github repo data saved');
    });
}
run();
