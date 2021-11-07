import { Octokit } from '@octokit/core';
import { QueryForStarredRepository, Repo, GithubRepositoryTopic, RepositoryTopic } from './types';

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
        const topicFirst = 50;

        while (hasNextPage || repoList.length < limit) {
            const data = await this.getStarredRepoAfterCursor(cursor, topicFirst);
            repoList.push(
                ...this.transformGithubStarResponse(data),
            );

            hasNextPage = data.starredRepositories.pageInfo.hasNextPage;
            cursor = data.starredRepositories.pageInfo.endCursor;
        }

        this.repoList = repoList;

        console.log(`Github: Get all starred repos success, count is ${this.repoList.length}`);
    }

    async getList() {
        // @ts-ignore
        const limit = +process.env.PARTIALSYNC_LIMIT || 10;
        const topicFirst = 50;

        console.log(`Github: Start to sync latest starred repos, limit is ${limit}`);

        const data = await this.getLastStarredRepo(limit, topicFirst);
        this.repoList.push(
            ...this.transformGithubStarResponse(data),
        );
    }

    private transformGithubStarResponse(data: QueryForStarredRepository): Repo[] {
        return (data.starredRepositories.edges || []).map(({ node, starredAt }) => ({
            ...node,
            starredAt,
            repositoryTopics: (node.repositoryTopics.nodes || []).map(
                (o: GithubRepositoryTopic): RepositoryTopic => ({ name: o?.topic?.name })
            ),
        }))
    }

    private async getStarredRepoAfterCursor(cursor: string, topicFirst: number) {
        const data = await this.client.graphql<{ viewer: QueryForStarredRepository }>(
            `
                query ($after: String, $topicFirst: Int) {
                    viewer {
                        starredRepositories(after: $after) {
                            pageInfo {
                                startCursor
                                endCursor
                                hasNextPage
                            }
                            edges {
                                starredAt
                                node {
                                    nameWithOwner
                                    url
                                    description
                                    primaryLanguage {
                                        name
                                    }
                                    repositoryTopics(first: $topicFirst) {
                                        nodes {
                                            topic {
                                                name
                                            }
                                        }
                                    }
                                    updatedAt
                                }
                            }
                        }
                    }
                }
            `,
            {
                after: cursor,
                topicFirst: topicFirst,
            },
        );

        return data.viewer;
    }

    private async getLastStarredRepo(last: number, topicFirst: number) {
        const data = await this.client.graphql<{ viewer: QueryForStarredRepository }>(
            `
                query ($last: Int, $topicFirst: Int) {
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
                            edges {
                                starredAt
                                node {
                                    nameWithOwner
                                    url
                                    description
                                    primaryLanguage {
                                        name
                                    }
                                    repositoryTopics(first: $topicFirst) {
                                        nodes {
                                            topic {
                                                name
                                            }
                                        }
                                    }
                                    updatedAt
                                }
                            }
                        }
                    }
                }
            `,
            {
                last: last,
                topicFirst: topicFirst,
            },
        );

        return data.viewer;
    }
}

export const github = new Github();
