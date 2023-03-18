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
    return this.mastodonClient?.v1.statuses.create({ status, mediaIds, visibility: 'public' });
  };

  private uploadMedia = async (mediaUrl: string, description: string): Promise<string> => {
    const res = await fetch(mediaUrl, { method: 'GET' });
    const imageBuffer = await res.arrayBuffer();

    const uploadedMedia = await this.mastodonClient?.v2.mediaAttachments.create({
      file: imageBuffer,
      description,
    });
    if (process.env['DEBUG']) {
      console.info('Uploaded media!');
      console.info(uploadedMedia?.id);
    }
    return uploadedMedia?.id ?? '';
  };

  public run = async (body: GhostPublishInfo): Promise<void> => {
    try {
      const currentPost = body?.post?.current;
      if (process.env['DEBUG']) {
        console.info('Received publish event');
        console.info({ body });
        console.info({ currentPost });
      }
      if (currentPost) {
        const media = await this.uploadMedia(
          currentPost.feature_image,
          currentPost.feature_image_alt ?? '',
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
