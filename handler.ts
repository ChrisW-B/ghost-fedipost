import { APIGatewayEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';

import MastodonPoster from './src/functions/post';

dotenv.config();

export async function photoToGotosocial(event: APIGatewayEvent): Promise<void> {
  const Post = await MastodonPoster.Login({
    mastodon: {
      access_token: process.env['MASTODON_ACCESS_TOKEN'] ?? '',
      api_url: process.env['MASTODON_API_URL'] ?? '',
    },
  });

  return await Post.run(event);
}
