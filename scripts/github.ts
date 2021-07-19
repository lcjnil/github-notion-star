import { Octokit } from '@octokit/core';

const client = new Octokit({
    auth: process.env.GITHUB_AUTH_TOKEN,
});

export async function getStars() {
    const data = await client.graphql(`{
         viewer {
            login
         }
    }`);

    console.error(data);
}
