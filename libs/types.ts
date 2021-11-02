import { Page, TitlePropertyValue, URLPropertyValue, SelectOptionWithName } from '@notionhq/client/build/src/api-types';


export interface repositoryTopic extends SelectOptionWithName {
    name: string;
}

export interface githubRepositoryTopic  {
    topic: repositoryTopic;
}
export interface GithubRepositoryTopicConnection  {
    nodes: githubRepositoryTopic[];
}

export interface Language {
    name: string;
}

export interface Repo {
    nameWithOwner: string;
    url: string;
    description: string;
    starredAt: string;
    primaryLanguage: Language;
    repositoryTopics: repositoryTopic[];
    updatedAt: string;
}

export interface GithubStarRepoNode {
    nameWithOwner: string;
    url: string;
    description: string;
    primaryLanguage: Language;
    repositoryTopics: GithubRepositoryTopicConnection;
    updatedAt: string;
}

export interface QueryForStarredRepository {
    starredRepositories: {
        pageInfo: {
            startCursor: string;
            endCursor: string;
            hasNextPage: boolean;
        };
        edges: Array<{
            starredAt: string;
            node: GithubStarRepoNode;
        }>;
    };
}

export interface NotionPage extends Page {
    properties: {
        Name: TitlePropertyValue;
        Link: URLPropertyValue;
    };
}
