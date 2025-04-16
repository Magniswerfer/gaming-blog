import { client } from "../utils/sanity.ts";
import Layout from "../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import FeaturedGameNews from "../islands/FeaturedGameNews.tsx";

interface Post {
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  publishedAt?: string;
}

export const handler: Handlers<{ latestPosts: Post[] }> = {
  async GET(_, ctx) {
    try {
      const latestPosts = await client.fetch<Post[]>(
        `*[_type == "post"] | order(publishedAt desc)[0...3] {
          title,
          slug,
          "mainImage": mainImage{asset->{url}},
          publishedAt
        }`,
      );
      return ctx.render({ latestPosts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return ctx.render({ latestPosts: [] });
    }
  },
};

export default function Home({ data }: PageProps<{ latestPosts: Post[] }>) {
  const { latestPosts } = data;

  return (
    <Layout>
      {/* Hero Section */}
      <section class="bg-background-light/10 py-20 md:py-32">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h1 class="font-serif text-5xl md:text-7xl text-white mb-6">
            The Questline
          </h1>
          <p class="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Providing holistic, thoughtful critiques of video games, exploring
            narrative structures, player experiences, and game mechanics.
          </p>
          <a
            href="/blog"
            class="inline-block px-8 py-4 bg-primary-dark hover:bg-accent-gold text-white rounded-lg transition-colors"
          >
            Read Our Latest Posts
          </a>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section class="py-20 bg-background-dark">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="font-serif text-4xl text-white mb-12 text-center">
            Latest Articles
          </h2>

          {latestPosts.length > 0
            ? (
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestPosts.map((post) => (
                  <a
                    key={post.slug.current}
                    href={`/blog/${post.slug.current}`}
                    class="bg-background-light/30 backdrop-blur-sm rounded-xl overflow-hidden border border-primary-dark/20 hover:border-accent-gold/50 transition-colors group"
                  >
                    <div class="h-48 overflow-hidden">
                      {post.mainImage?.asset?.url
                        ? (
                          <img
                            src={post.mainImage.asset.url}
                            alt={post.title}
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )
                        : (
                          <div class="w-full h-full bg-primary-dark/50 flex items-center justify-center">
                            <span class="text-white/50">No image</span>
                          </div>
                        )}
                    </div>
                    <div class="p-6">
                      <h3 class="font-serif text-xl text-white mb-2 group-hover:text-accent-gold transition-colors">
                        {post.title}
                      </h3>
                      {post.publishedAt && (
                        <p class="text-white/70 text-sm">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )
            : (
              <div class="bg-background-light/20 p-8 rounded-xl text-center">
                <p class="text-white/90">
                  New articles coming soon! Our team is working on creating
                  insightful content about gaming experiences.
                </p>
              </div>
            )}

          <div class="mt-12 text-center">
            <a
              href="/blog"
              class="inline-block px-6 py-3 border border-white/30 hover:border-accent-gold hover:bg-accent-gold/10 text-white rounded-lg transition-colors"
            >
              View All Articles
            </a>
          </div>
        </div>
      </section>

      {/* Gaming News Section */}
      <section class="py-20 bg-background-light/5">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="font-serif text-4xl text-white mb-6 text-center">
            Gaming News
          </h2>
          <p class="text-white/90 text-center max-w-2xl mx-auto mb-12">
            Stay updated with the latest gaming industry news
          </p>

          <FeaturedGameNews />
        </div>
      </section>

      {/* Our Approach Section */}
      <section class="py-20">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="font-serif text-4xl text-white mb-12 text-center">
            Our Approach
          </h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-background-light/30 backdrop-blur-sm p-6 rounded-xl border border-primary-dark/20">
              <h3 class="font-serif text-2xl text-white mb-4">
                Narrative Focus
              </h3>
              <p class="text-white/90">
                We believe in examining how games tell stories and create
                meaningful player experiences through their narrative
                structures.
              </p>
            </div>
            <div class="bg-background-light/30 backdrop-blur-sm p-6 rounded-xl border border-primary-dark/20">
              <h3 class="font-serif text-2xl text-white mb-4">
                Game Mechanics
              </h3>
              <p class="text-white/90">
                We analyze gameplay systems and mechanics, exploring how they
                contribute to the overall experience and player agency.
              </p>
            </div>
            <div class="bg-background-light/30 backdrop-blur-sm p-6 rounded-xl border border-primary-dark/20">
              <h3 class="font-serif text-2xl text-white mb-4">
                Aesthetic Analysis
              </h3>
              <p class="text-white/90">
                We appreciate the visual design, sound, music, and overall
                aesthetic elements that create immersive gaming worlds.
              </p>
            </div>
          </div>
          <div class="mt-12 text-center">
            <a
              href="/about"
              class="inline-block px-6 py-3 bg-primary-dark hover:bg-accent-gold text-white rounded-lg transition-colors"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
