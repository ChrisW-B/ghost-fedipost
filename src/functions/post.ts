import { APIGatewayEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';
import Mastodon from 'mastodon';

import { GhostPublishInfo } from '../datamodel';

dotenv.config();

type RequiredProps = {
  mastodon: {
    access_token: string;
    api_url: string;
  };
};
class Poster {
  private mastodonClient: Mastodon;

  constructor(props: RequiredProps) {
    this.mastodonClient = new Mastodon(props.mastodon);
  }

  private postStatus = (status: string, media_ids: string[]) => {
    if (process.env['DEBUG']) {
      console.info('Created Post!');
      console.info(status);
      return;
    }
    return this.mastodonClient.post('/v1/statuses', { status, media_ids, visibility: 'unlisted' });
  };

  private uploadMedia = async (mediaUrl: string, description: string): Promise<string> => {
    if (process.env['DEBUG'])
      console.info(`Posting to ${process.env['MASTODON_API_URL'] ?? ''}/v2/media`);
    const uploadedMedia = await this.mastodonClient.post('/v2/media', {
      file: mediaUrl,
      description,
    });
    if (process.env['DEBUG']) {
      console.info('Uploaded media!');
      console.info(uploadedMedia.data);
    }
    return uploadedMedia.data['id'] ?? '';
  };

  public run = async (event: APIGatewayEvent): Promise<void> => {
    try {
      const body = JSON.parse(event.body ?? '') as GhostPublishInfo;
      console.log({ body: event.body });
      const currentPost = body?.post?.current;
      console.log({ currentPost });
      if (currentPost) {
        const media = await this.uploadMedia(
          currentPost.feature_image,
          currentPost.feature_image_caption,
        );
        const postText = `
New post on my photoblog!

"${currentPost.title}"

${currentPost.url}
      `;
        await this.postStatus(postText, [media]);
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export default Poster;
