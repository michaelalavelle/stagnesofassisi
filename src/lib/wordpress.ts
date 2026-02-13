type WordPressCategory = {
  slug?: string;
};

type WordPressApiPost = {
  title?: string | { rendered?: string };
  date?: string;
  content?: string;
  categories?: Record<string, WordPressCategory>;
  attachments?: Record<
    string,
    {
      URL?: string;
      extension?: string;
      filesize?: number | string;
    }
  >;
};

export type WordPressFeedItem = {
  source: "wordpress";
  title: string;
  date: Date;
  html: string;
};

const WORDPRESS_POSTS_URL =
  "https://public-api.wordpress.com/rest/v1.1/sites/stagnesofassisiofs.wordpress.com/posts/?number=50&fields=title,date,content,categories,attachments";

const getPostCategorySlugs = (post: WordPressApiPost) =>
  Object.values(post.categories ?? {})
    .map((category) => (category.slug || "").toLowerCase())
    .filter(Boolean);

const getPostTitle = (post: WordPressApiPost) =>
  (typeof post.title === "string" ? post.title.trim() : post.title?.rendered?.trim()) ||
  "Announcement";

const formatBytes = (value?: number | string) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
};

const getFileExtension = (url: string, fallback?: string) => {
  if (fallback) {
    return fallback.toUpperCase();
  }
  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
};

const normalizeWordPressHtml = (html: string, post: WordPressApiPost) => {
  const withoutEmbedObjects = html.replace(/<object[\s\S]*?<\/object>/gi, "");
  const attachments = Object.values(post.attachments ?? {});

  const withCleanFileBlocks = withoutEmbedObjects.replace(
    /<div[^>]*class=["'][^"']*wp-block-file[^"']*["'][^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/div>/gi,
    (_full, href: string, labelHtml: string) => {
      const matchingAttachment = attachments.find((item) => item.URL === href);
      const extension = getFileExtension(href, matchingAttachment?.extension);
      const size = formatBytes(matchingAttachment?.filesize);
      const descriptor = size ? ` (${extension}, ${size})` : ` (${extension})`;
      return `<p><a href="${href}" target="_blank" rel="noreferrer">${labelHtml}${descriptor}</a></p>`;
    }
  );

  return withCleanFileBlocks.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_, attrs) => {
    let nextAttrs = attrs;
    if (!/\btarget=/i.test(nextAttrs)) {
      nextAttrs += ' target="_blank"';
    }
    if (!/\brel=/i.test(nextAttrs)) {
      nextAttrs += ' rel="noreferrer"';
    }
    return `<a ${nextAttrs}>`;
  });
};

export const fetchWordPressPostsByCategory = async (
  categorySlug: string,
  limit: number
): Promise<WordPressFeedItem[]> => {
  try {
    const response = await fetch(WORDPRESS_POSTS_URL);
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const posts: WordPressApiPost[] = Array.isArray(payload?.posts) ? payload.posts : [];
    const normalizedCategory = categorySlug.toLowerCase();

    return posts
      .filter((post) => getPostCategorySlugs(post).includes(normalizedCategory))
      .map((post) => ({
        source: "wordpress" as const,
        title: getPostTitle(post),
        date: new Date(post.date ?? Date.now()),
        html: normalizeWordPressHtml(post.content || "", post),
      }))
      .slice(0, limit);
  } catch {
    return [];
  }
};
