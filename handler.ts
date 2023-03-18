import * as dotenv from 'dotenv';

import { GhostPublishInfo } from './src/datamodel';
import MastodonPoster from './src/functions/post';

dotenv.config();

export async function photoToGotosocial(body: string | null) {
  const Post = await MastodonPoster.Login({
    mastodon: {
      access_token: process.env['MASTODON_ACCESS_TOKEN'] ?? '',
      api_url: process.env['MASTODON_API_URL'] ?? '',
    },
  });

  try {
    const parsedBody = JSON.parse(body ?? '') as GhostPublishInfo;
    await Post.run(parsedBody);
    return { status: 200 };
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);
    console.error(error);
    return { status: 500, body: message };
  }
}
