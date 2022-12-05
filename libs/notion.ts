import { Client } from '@notionhq/client';
import { NotionPage, Repo } from './types';
import { DatabasesQueryResponse } from '@notionhq/client/build/src/api-endpoints';
import { get, save } from './cache';
import { writeFile } from 'fs';
import path from 'path';

// TODO: add assertion
const databaseId = process.env.NOTION_DATABASE_ID as string;

const DESC_LENGTH = 240;

const NAMESPACE = 'notion-page';

export class Notion {
    private notion: Client;
    pages: Record<string, { id: string }> = {};
    pageList: NotionPage[] = [];

    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_API_KEY,
        });

        this.pages = get(NAMESPACE, {});

        console.log(
            `Notion: restored from cache, count is ${
                Object.keys(this.pages).length
            }`,
        );
    }

    save() {
        save(NAMESPACE, this.pages);
    }

    hasPage(name: string) {
        return !!this.pages[name];
    }

    /**
     * full-sync pages in database
     */
    async fullSyncIfNeeded() {
        if (Object.keys(this.pages).length) {
            console.log(`Notion: skipped sync due to cache`);
            return;
        }

        console.log('Notion: Start to get all pages');

        let hasNext = true;
        let cursor: string | undefined = undefined;

        while (hasNext) {
            const database: DatabasesQueryResponse =
                await this.notion.databases.query({
                    database_id: databaseId,
                    page_size: 100,
                    start_cursor: cursor,
                });

            this.addPages(database.results as NotionPage[]);
            hasNext = database.has_more;
            // @ts-ignore
            cursor = database.next_cursor;
        }

        console.log(
            `Notion: Get all pages success, count is ${
                Object.keys(this.pages).length
            }`,
        );

        this.save();
    }

    async getPageList() {
        let hasNext = true;
        let cursor: string | undefined;

        while (hasNext) {
            const res: DatabasesQueryResponse =
                await this.notion.databases.query({
                    database_id: databaseId,
                    page_size: 100,
                    start_cursor: cursor,
                });
            this.pageList = this.pageList.concat(res.results as NotionPage[]);
            hasNext = res.has_more;
            cursor = res.next_cursor || undefined;
        }

        this.addPages(this.pageList);

        console.log(
            `Notion: Get page list success, count is ${this.pageList.length}`,
        );
    }

    addPages(pages: NotionPage[]) {
        pages.forEach((page) => {
            this.pages[page.properties.Name.title[0].plain_text] = {
                id: page.id,
            };
        });

        this.save();
    }

    async insertPage(repo: Repo) {
        if (repo.description && repo.description.length >= 2000) {
            repo.description = repo.description.substring(0, 120) + '...';
        }
        const data = await this.notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            properties: {
                Name: {
                    type: 'title',
                    title: [
                        {
                            type: 'text',
                            text: {
                                content: repo.nameWithOwner,
                            },
                        },
                    ],
                },
                Type: {
                    type: 'select',
                    select: {
                        name: 'Star',
                    },
                },
                Link: {
                    type: 'url',
                    url: repo.url,
                },
                Description: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: repo.description || '',
                            },
                        },
                    ],
                },
                'Primary Language': {
                    type: 'select',
                    select: {
                        name: repo?.primaryLanguage?.name || 'null',
                    },
                },
                'Repository Topics': {
                    type: 'multi_select',
                    multi_select: repo.repositoryTopics || [],
                },
                'Starred At': {
                    type: 'date',
                    date: {
                        start: repo.starredAt,
                        end: repo.starredAt,
                    },
                },
            },
        });

        this.pages[repo.nameWithOwner] = { id: data.id };

        console.log(
            `insert page ${repo.nameWithOwner} success, page id is ${data.id}`,
        );

        this.save();
    }

    async updatePage(repo: Repo, pageId: string) {
        repo.description = repo.description
            ? repo.description.length > DESC_LENGTH
                ? repo.description.slice(0, DESC_LENGTH) + '...'
                : repo.description.slice(0, DESC_LENGTH)
            : '';
        // writeFile(
        //     path.join(__dirname, '../examples/tmp/notion-table.json'),
        //     new Uint8Array(Buffer.from(JSON.stringify(res))),
        //     (err) => {
        //         if (err) throw err;
        //         console.log('saved');
        //         console.log('Notion: Database length is ');
        //     },
        // );

        // 只更新基本信息
        const data = await this.notion.pages.update({
            archived: false,
            page_id: pageId,
            properties: {
                Name: {
                    type: 'title',
                    title: [
                        {
                            type: 'text',
                            text: {
                                content: repo.nameWithOwner,
                            },
                        },
                    ],
                },
                Type: {
                    type: 'select',
                    select: {
                        name: 'Star',
                    },
                },
                Link: {
                    type: 'url',
                    url: repo.url,
                },
                Description: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: repo.description || '',
                            },
                        },
                    ],
                },
                'Primary Language': {
                    type: 'select',
                    select: {
                        name: repo?.primaryLanguage?.name || 'null',
                    },
                },
                'Repository Topics': {
                    type: 'multi_select',
                    multi_select: repo.repositoryTopics || [],
                },
                'Starred At': {
                    type: 'date',
                    date: {
                        start: repo.starredAt,
                        end: repo.starredAt,
                    },
                },
            },
        });

        console.log('Notion: Update successfully');
    }
}

export const notion = new Notion();
