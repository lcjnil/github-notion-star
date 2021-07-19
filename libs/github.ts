import { Octokit } from '@octokit/core';
import { QueryForStarredRepository, Repo } from './types';

const client = new Octokit({
    auth: process.env.GITHUB_AUTH_TOKEN,
});

export class Github {
    private client: Octokit;

    constructor() {
        this.client = new Octokit({
            auth: process.env.TOKEN_OF_GITHUB,
        });
    }

    repoList: Repo[] = [];

    async fullSync() {
        // @ts-ignore
        const limit = +process.env.FULLSYNC_LIMIT || 2000;
        console.log(`Github: Start to get all starred repos, limit is ${limit}`);

        let cursor = '';
        let hasNextPage = true;
        const repoList = [];

        while (hasNextPage || repoList.length >= limit) {
            const data = await this.getStarredRepoAfterCursor(cursor);
            repoList.push(...data.starredRepositories.nodes);

            hasNextPage = data.starredRepositories.pageInfo.hasNextPage;
            cursor = data.starredRepositories.pageInfo.endCursor;
        }

        this.repoList = repoList;

        console.log(`Github: Get all starred repos success, count is ${this.repoList.length}`);
    }

    async getList() {
        // @ts-ignore
        const limit = +process.env.PARTIALSYNC_LIMIT || 2000;
        console.log(`Github: Start to sync latest starred repos, limit is ${limit}`);

        const data = await this.getLastStarredRepo(10);
        this.repoList.push(...data.starredRepositories.nodes);
    }

    private async getStarredRepoAfterCursor(cursor: string) {
        const data = await this.client.graphql<{ viewer: QueryForStarredRepository }>(
            `
                query ($after: String) {
                    viewer {
                        starredRepositories(after: $after) {
                            pageInfo {
                                startCursor
                                endCursor
                                hasNextPage
                            }
                            nodes {
                                nameWithOwner
                                url
                                description
                            }
                        }
                    }
                }
            `,
            {
                after: cursor,
            },
        );

        return data.viewer;
    }

    private async getLastStarredRepo(last: number) {
        const data = await this.client.graphql<{ viewer: QueryForStarredRepository }>(
            `
                query ($last: Int) {
                    viewer {
                        starredRepositories(last: $last) {
                            pageInfo {
                                startCursor
                                endCursor
                                hasNextPage
                            }
                            nodes {
                                nameWithOwner
                                url
                                description
                            }
                        }
                    }
                }
            `,
            {
                last: last,
            },
        );

        return data.viewer;
    }
}

export const github = new Github();
