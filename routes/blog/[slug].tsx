import { client } from "../../utils/sanity.ts";
import { parseContent } from "../../utils/sanityParser.tsx";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Post {
  title: string;
  slug: { current: string };
  author?: {
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
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
  body?: any[];
}

export const handler: Handlers<Post | null> = {
  async GET(_, ctx) {
    const { slug } = ctx.params;
    try {
      const post = await client.fetch<Post>(
        `*[_type == "post" && slug.current == $slug][0]{
          title,
          slug,
          "author": author->{name, "image": image{asset->{url}}},
          "mainImage": mainImage{asset->{url}},
          "categories": categories[]->{title},
          publishedAt,
          body
        }`,
        { slug },
      );
      console.log("Fetched post:", post); // Debug log
      return ctx.render(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      return ctx.render(null);
    }
  },
};

export default function BlogPost({ data: post }: PageProps<Post | null>) {
  if (!post) {
    return (
      <Layout title="Post Not Found - The Questline">
        <div class="max-w-4xl mx-auto px-6 py-20">
          <h1 class="font-serif text-4xl text-white mb-8 text-center">
            Post Not Found
          </h1>
          <p class="text-white/90 text-center">
            Sorry, we couldn't find the post you're looking for.
          </p>
          <div class="mt-8 text-center">
            <a
              href="/blog"
              class="inline-block px-6 py-3 bg-primary-dark hover:bg-accent-gold text-white rounded-lg transition-colors"
            >
              Back to Blog
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${post.title} - The Questline`}>
      <article class="max-w-4xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div class="mb-12">
          {post.mainImage?.asset?.url && (
            <img
              src={post.mainImage.asset.url}
              alt={post.title}
              class="w-full h-[400px] object-cover rounded-xl mb-8"
            />
          )}
          <h1 class="font-serif text-5xl text-white mb-6">
            {post.title}
          </h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-white/70">
            {post.author && (
              <div class="flex items-center gap-2">
                {post.author.image?.asset?.url && (
                  <img
                    src={post.author.image.asset.url}
                    alt={post.author.name}
                    class="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <p>By {post.author.name}</p>
              </div>
            )}
            {post.publishedAt && (
              <>
                <span>•</span>
                <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
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

        {/* Post Content */}
        <div class="prose prose-invert prose-lg max-w-none">
          {post.body
            ? parseContent(post.body)
            : <p class="text-white/90">No content available.</p>}
        </div>

        {/* Back to Blog */}
        <div class="mt-12 text-center">
          <a
            href="/blog"
            class="inline-block px-6 py-3 bg-primary-dark hover:bg-accent-gold text-white rounded-lg transition-colors"
          >
            Back to Blog
          </a>
        </div>
      </article>
    </Layout>
  );
}
