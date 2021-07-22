import { Page, TitlePropertyValue, URLPropertyValue } from '@notionhq/client/build/src/api-types';

export interface Repo {
    nameWithOwner: string;
    url: string;
    description: string;
    starredAt: string;
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
            node: Omit<Repo, 'starredAt'>;
        }>;
    };
}

export interface NotionPage extends Page {
    properties: {
        Name: TitlePropertyValue;
        Link: URLPropertyValue;
    };
}
