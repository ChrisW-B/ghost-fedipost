import * as dotenv from 'dotenv';
import { createRestAPIClient, mastodon } from 'masto';

import { GhostPublishInfo } from '../datamodel';

dotenv.config();

type RequiredProps = {
  mastodon: {
    access_token: string;
    api_url: string;
  };
};
class Poster {
  mastodonClient: mastodon.rest.Client | null = null;
  static Login(props: RequiredProps): Poster {
    const instance = new Poster();

    instance.mastodonClient = createRestAPIClient({
      url: props.mastodon.api_url,
      accessToken: props.mastodon.access_token,
    });
    return instance;
  }

  private postStatus = (status: string, mediaIds: string[]) => {
    if (process.env['DEBUG']) {
      console.info('Created Post!');
      console.info(status);
      return;
    }
    return this.mastodonClient?.v1.statuses.create({ status, mediaIds, visibility: 'public' });
  };

  private uploadMedia = async (mediaUrl: string, description: string): Promise<string | null> => {
    const res = await fetch(mediaUrl, { method: 'GET' });

    if (res.ok) {
      const imageBuffer = await res.blob();
      const uploadedMedia = await this.mastodonClient?.v2.media.create({
        file: imageBuffer,
        description,
      });
      if (process.env['DEBUG']) {
        console.info('Uploaded media!');
        console.info(uploadedMedia?.id);
      }
      return uploadedMedia?.id ?? '';
    }
    if (process.env['DEBUG']) {
      console.info('Failed to fetch media');
      console.info(res.statusText);
    }
    return null;
  };

  public run = async (body: GhostPublishInfo): Promise<void> => {
    try {
      const currentPost = body?.post?.current;
      if (process.env['DEBUG']) {
        console.info('Received publish event');
        console.info({ currentPost });
      }
      if (currentPost) {
        const media = await this.uploadMedia(
          currentPost.feature_image,
          currentPost.feature_image_alt ?? '',
        );
        if (!media) {
          throw new Error('Failed to upload media');
        }
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
