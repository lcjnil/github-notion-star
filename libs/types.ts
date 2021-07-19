import { Page, TitlePropertyValue, URLPropertyValue } from '@notionhq/client/build/src/api-types';

export interface Repo {
    nameWithOwner: string;
    url: string;
    description: string;
}

export interface QueryForStarredRepository {
    starredRepositories: {
        pageInfo: {
            startCursor: string;
            endCursor: string;
            hasNextPage: boolean;
        };
        nodes: Repo[];
    };
}

export interface NotionPage extends Page {
    properties: {
        Name: TitlePropertyValue;
        Url: URLPropertyValue;
    };
}
