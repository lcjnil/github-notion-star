import { initAllStars } from './scripts/notion';
import { getStars } from './scripts/github';

async function main() {
    // await initAllStars();
    await getStars();
}

main();
