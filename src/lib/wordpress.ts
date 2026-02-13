type WordPressCategory = {
  slug?: string;
};

type WordPressApiPost = {
  title?: string | { rendered?: string };
  date?: string;
  content?: string;
  categories?: Record<string, WordPressCategory>;
};

export type WordPressFeedItem = {
  source: "wordpress";
  title: string;
  date: Date;
  html: string;
};

const WORDPRESS_POSTS_URL =
  "https://public-api.wordpress.com/rest/v1.1/sites/stagnesofassisiofs.wordpress.com/posts/?number=50&fields=title,date,content,categories";

const getPostCategorySlugs = (post: WordPressApiPost) =>
  Object.values(post.categories ?? {})
    .map((category) => (category.slug || "").toLowerCase())
    .filter(Boolean);

const getPostTitle = (post: WordPressApiPost) =>
  (typeof post.title === "string" ? post.title.trim() : post.title?.rendered?.trim()) ||
  "Announcement";

const normalizeWordPressHtml = (html: string) => {
  const withoutEmbedObjects = html.replace(/<object[\s\S]*?<\/object>/gi, "");
  return withoutEmbedObjects.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_, attrs) => {
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
        html: normalizeWordPressHtml(post.content || ""),
      }))
      .slice(0, limit);
  } catch {
    return [];
  }
};
