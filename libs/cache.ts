import path from 'path';
import fs from 'fs';
import write from 'write';

const CACHE_DIR = path.join(__dirname, '../.cache');

function getCacheFilePath(key: string) {
    return path.join(CACHE_DIR, `./${key}.json`);
}

export function save<T extends Record<string, any>>(key: string, data: T) {
    const dataString = JSON.stringify(data);
    write.sync(getCacheFilePath(key), dataString);
}

export function get<T extends Record<string, any>>(
    key: string,
    defaultValue: T,
): T {
    try {
        const dataString =
            fs.readFileSync(getCacheFilePath(key), 'utf-8') || '';
        return JSON.parse(dataString) as T;
    } catch (err) {
        if ((err as any).code === 'ENOENT') {
            console.log('No cache found');
            return defaultValue;
        }
        console.log('Notion: error from recover cache', err);
        return defaultValue;
    }
}
