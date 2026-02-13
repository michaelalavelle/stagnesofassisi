type WordPressCategory = {
  slug?: string;
};

type WordPressApiPost = {
  title?: string | { rendered?: string };
  date?: string;
  excerpt?: string;
  categories?: Record<string, WordPressCategory>;
};

export type WordPressFeedItem = {
  source: "wordpress";
  title: string;
  date: Date;
  html: string;
};

const WORDPRESS_POSTS_URL =
  "https://public-api.wordpress.com/rest/v1.1/sites/stagnesofassisiofs.wordpress.com/posts/?number=50&fields=title,date,excerpt,categories";

const getPostCategorySlugs = (post: WordPressApiPost) =>
  Object.values(post.categories ?? {})
    .map((category) => (category.slug || "").toLowerCase())
    .filter(Boolean);

const getPostTitle = (post: WordPressApiPost) =>
  (typeof post.title === "string" ? post.title.trim() : post.title?.rendered?.trim()) ||
  "Announcement";

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
        html: post.excerpt || "",
      }))
      .slice(0, limit);
  } catch {
    return [];
  }
};
