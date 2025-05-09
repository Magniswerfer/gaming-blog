# CRITICO - Danish Gaming Blog

A Fresh project for a Danish gaming blog using Sanity CMS for content
management.

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

## Image Optimization

CRITICO uses Sanity's imageUrlBuilder to optimize images. This allows for:

1. Requesting images at appropriate dimensions for each display context
2. Automatic format detection
3. Quality optimization
4. Lazy loading of images

### How to Use Optimized Images

For Sanity images, use the utility functions in `utils/sanity.ts`:

```typescript
import { getOptimizedImageUrl } from "../utils/sanity.ts";

// In your component:
<img
  src={getOptimizedImageUrl(imageObject, width, height)}
  alt="Description"
  width={width}
  height={height}
  loading="lazy"
/>;
```

Note on image quality:

- Small images (width < 300px) use higher quality (90%) to maintain clarity
- Larger images use standard quality (80%) to balance quality and performance

For IGDB game cover images, use the utility in `utils/gameUtils.ts`:

```typescript
import { getGameCoverImage } from "../utils/gameUtils.ts";

// In your component:
<img
  src={getGameCoverImage(gameJsonString, width, height)}
  alt="Game title"
  width={width}
  height={height}
  loading="lazy"
/>;
```

### Benefits

- **Performance**: Smaller image file sizes mean faster page loads
- **Bandwidth**: Reduced data usage for users
- **Appropriate sizing**: No downloading unnecessarily large images
- **Image quality**: Automatic format selection for modern formats (WebP, AVIF)
- **User experience**: Progressive loading with properly sized images

The `width` and `height` attributes in the img tags also help with layout
stability by reserving space for images before they load.
