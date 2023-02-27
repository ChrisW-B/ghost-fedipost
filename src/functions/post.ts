import { APIGatewayEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';
import { login, mastodon } from 'masto';

import { GhostPublishInfo } from '../datamodel';

dotenv.config();

type RequiredProps = {
  mastodon: {
    access_token: string;
    api_url: string;
  };
};
class Poster {
  mastodonClient: mastodon.Client | null = null;
  static async Login(props: RequiredProps): Promise<Poster> {
    const instance = new Poster();

    instance.mastodonClient = await login({
      url: props.mastodon.api_url,
      accessToken: props.mastodon.access_token,
      disableVersionCheck: true,
    });
    return instance;
  }

  private postStatus = (status: string, mediaIds: string[]) => {
    if (process.env['DEBUG']) {
      console.info('Created Post!');
      console.info(status);
      return;
    }
    return this.mastodonClient?.v1.statuses.create({ status, mediaIds, visibility: 'unlisted' });
  };

  private uploadMedia = async (mediaUrl: string, description: string): Promise<string> => {
    if (process.env['DEBUG'])
      console.info(`Posting to ${process.env['MASTODON_API_URL'] ?? ''}/v2/media`);
    const uploadedMedia = await this.mastodonClient?.v2.mediaAttachments.create({
      file: mediaUrl,
      description,
    });
    if (process.env['DEBUG']) {
      console.info('Uploaded media!');
      console.info(uploadedMedia?.id);
    }
    return uploadedMedia?.id ?? '';
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
