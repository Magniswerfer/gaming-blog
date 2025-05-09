interface GameCardProps {
  title: string;
  image: string;
  description: string;
}

export default function GameCard({ title, image, description }: GameCardProps) {
  return (
    <div class="flex-none w-72 bg-background-light/30 overflow-hidden border border-secondary/20">
      <div class="h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          class="w-full h-full object-cover"
        />
      </div>
      <div class="p-4">
        <h3 class="font-heading font-black text-xl text-black mb-2">
          {title}
        </h3>
        <p class="text-black/90 text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
