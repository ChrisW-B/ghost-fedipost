export type GhostPublishInfo = {
  post: {
    current: {
      id: string;
      uuid: string;
      title: string;
      slug: string;
      html: string | null;
      comment_id: string;
      feature_image: string;
      featured: false;
      status: string;
      visibility: string;
      created_at: string;
      updated_at: string;
      published_at: string;
      custom_excerpt: string | null;
      codeinjection_head: string | null;
      codeinjection_foot: string | null;
      custom_template: string | null;
      canonical_url: string | null;
      count: {
        clicks: number;
        positive_feedback: number;
        negative_feedback: number;
      };
      primary_tag: string | null;
      email_segment: string;
      url: string;
      excerpt: string | null;
      og_image: string | null;
      og_title: string | null;
      og_description: string | null;
      twitter_image: string | null;
      twitter_title: string | null;
      twitter_description: string | null;
      meta_title: string | null;
      meta_description: string | null;
      email_subject: string | null;
      frontmatter: string | null;
      feature_image_alt: string | null;
      feature_image_caption: string;
      email_only: false;
    };
    previous: {
      status: string;
      updated_at: string;
      published_at: string | null;
    };
  };
};
