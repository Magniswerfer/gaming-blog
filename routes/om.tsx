import Layout from "../components/Layout.tsx";

export default function About() {
  return (
    <Layout title="About - The Questline">
      <div class="max-w-4xl mx-auto px-6 py-20">
        <h1 class="font-serif text-5xl text-black mb-12 text-center">
          About The Questline
        </h1>

        <div class="space-y-16">
          <section class="bg-background-light/30 backdrop-blur-sm p-10 rounded-xl border border-secondary/20">
            <h2 class="font-serif text-3xl text-black mb-6">Our Story</h2>
            <p class="text-black/90 leading-relaxed mb-6">
              The Questline offers holistic, thoughtful, and detailed critiques
              of video games, focusing on narrative structures, player
              experiences, game mechanics, aesthetics, and how these elements
              interweave to create compelling gaming journeys.
            </p>
            <p class="text-black/90 leading-relaxed">
              Our name reflects our commitment to exploring the paths and
              choices that make gaming experiences unique, much like following a
              questline in your favorite RPG.
            </p>
          </section>

          <section class="bg-background-light/30 backdrop-blur-sm p-10 rounded-xl border border-secondary/20">
            <h2 class="font-serif text-3xl text-black mb-6">Our Mission</h2>
            <p class="text-black/90 leading-relaxed mb-6">
              We believe in thoughtful, nuanced discussions about games that go
              beyond surface-level reviews. Our critiques explore how narrative,
              mechanics, and aesthetics work together to create meaningful
              player experiences.
            </p>
            <p class="text-black/90 leading-relaxed">
              Through our writing, we aim to provide insights that are both
              accessible and intellectually engaging, helping readers appreciate
              the artistry and craftsmanship behind great games.
            </p>
          </section>

          <section class="bg-background-light/30 backdrop-blur-sm p-10 rounded-xl border border-secondary/20">
            <h2 class="font-serif text-3xl text-black mb-6">Our Approach</h2>
            <p class="text-black/90 leading-relaxed">
              Each critique is crafted with care, examining games through
              multiple lenses: narrative depth, mechanical innovation, aesthetic
              choices, and player agency. We believe that understanding these
              elements helps us appreciate games as both art and interactive
              experiences.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
