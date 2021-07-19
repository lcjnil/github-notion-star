import { get, save } from './cache';
import { NotionPage, Repo } from './types';

// TODO: maybe add cache storage after
class Store<T extends Record<string, any>> {
    data: T;
    namespace: string;

    constructor(namespace: string, defaultValue: T) {
        this.namespace = namespace;
        this.data = defaultValue;
        // this.data = get(namespace, defaultValue);
    }

    save() {
        // save(this.namespace, this.data);
    }
}

export const repoStore = new (class extends Store<{
    cursor: string;
    repos: Repo[];
}> {
    constructor(namespace: string) {
        super(namespace, {
            repos: [],
            cursor: '',
        });
    }

    addRepos(repos: Repo[]) {
        this.data.repos.push(...repos);
        this.save();
    }

    updateCursor(cursor: string) {
        this.data.cursor = cursor;
        this.save();
    }

    getRepos() {
        return this.data.repos;
    }
})('repo');

export const pageStore = new (class extends Store<{ cursor: string; pages: Record<string, { id: string }> }> {
    hasPage(name: string) {
        return !!this.data.pages[name];
    }

    pushPage(page: NotionPage) {
        this.data.pages[page.properties.Name.title[0].plain_text] = {
            id: page.id,
        };

        this.save();
    }

    pushPages(pages: NotionPage[], cursor?: string) {
        pages.forEach((page) => {
            this.data.pages[page.properties.Name.title[0].plain_text] = {
                id: page.id,
            };
        });

        if (cursor) {
            this.data.cursor = cursor;
        }

        this.save();
    }
})('page', { cursor: '', pages: {} });
