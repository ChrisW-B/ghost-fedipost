import { APIGatewayEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';

import MastodonPoster from './src/functions/post';

dotenv.config();

export async function photoToGotosocial(event: APIGatewayEvent) {
  const Post = await MastodonPoster.Login({
    mastodon: {
      access_token: process.env['MASTODON_ACCESS_TOKEN'] ?? '',
      api_url: process.env['MASTODON_API_URL'] ?? '',
    },
  });

  try {
    await Post.run(event);
    return { status: 200 };
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);
    return { status: 500, body: message };
  }
}
