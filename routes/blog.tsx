import { client } from "../utils/sanity.ts";
import Layout from "../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Post {
  title: string;
  slug: { current: string };
  author?: {
    name: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: Array<{
    title: string;
  }>;
  publishedAt?: string;
  excerpt?: string;
}

export const handler: Handlers<Post[]> = {
  async GET(_, ctx) {
    try {
      const posts = await client.fetch<Post[]>(
        `*[_type == "post"] | order(publishedAt desc) {
          title,
          slug,
          "author": author->{name},
          "mainImage": mainImage{asset->{url}},
          "categories": categories[]->{title},
          publishedAt,
          "excerpt": array::join(string::split(pt::text(body), "")[0..255], "") + "..."
        }`,
      );
      console.log("Fetched posts:", posts); // Debug log
      return ctx.render(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return ctx.render([]);
    }
  },
};

export default function Blog({ data: posts }: PageProps<Post[]>) {
  return (
    <Layout title="Blog - The Questline">
      <div class="max-w-4xl mx-auto px-6 py-20">
        <h1 class="font-serif text-5xl text-white mb-12 text-center">
          Blog Posts
        </h1>

        {posts.length === 0
          ? (
            <div class="bg-background-light/30 backdrop-blur-sm p-10 rounded-xl border border-primary-dark/20 text-center">
              <h2 class="font-serif text-3xl text-white mb-6">Coming Soon</h2>
              <p class="text-white/90 leading-relaxed mb-8">
                Our blog posts are currently under construction. We're working
                on integrating Sanity CMS to bring you thoughtful, in-depth
                articles about games and gaming culture.
              </p>
              <p class="text-white/90 leading-relaxed">
                Check back soon for our first articles, where we'll dive deep
                into the artistry and craftsmanship of video games.
              </p>
            </div>
          )
          : (
            <div class="grid gap-8">
              {posts.map((post) => (
                <a
                  key={post.slug.current}
                  href={`/blog/${post.slug.current}`}
                  class="group bg-background-light/30 backdrop-blur-sm p-8 rounded-xl border border-primary-dark/20 hover:border-accent-gold/50 transition-colors"
                >
                  <div class="flex flex-col md:flex-row gap-6">
                    {post.mainImage?.asset?.url
                      ? (
                        <img
                          src={post.mainImage.asset.url}
                          alt={post.title}
                          class="w-full md:w-48 h-48 object-cover rounded-lg"
                        />
                      )
                      : (
                        <div class="w-full md:w-48 h-48 bg-primary-dark/50 rounded-lg flex items-center justify-center">
                          <span class="text-white/50">No image</span>
                        </div>
                      )}
                    <div class="flex-1">
                      <h2 class="font-serif text-2xl text-white mb-2 group-hover:text-accent-gold transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p class="text-white/90 mb-4">{post.excerpt}</p>
                      )}
                      <div class="flex flex-wrap gap-2 items-center text-white/70 text-sm">
                        {post.author && <p>{post.author.name}</p>}
                        {post.publishedAt && (
                          <>
                            <span>•</span>
                            <p>
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </p>
                          </>
                        )}
                        {post.categories && post.categories.length > 0 && (
                          <>
                            <span>•</span>
                            <div class="flex gap-2">
                              {post.categories.map((category) => (
                                <span
                                  key={category.title}
                                  class="px-2 py-1 bg-primary-dark/50 rounded-full text-xs"
                                >
                                  {category.title}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
      </div>
    </Layout>
  );
}
