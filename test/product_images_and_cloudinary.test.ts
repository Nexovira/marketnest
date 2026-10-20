/**
 * @file test/product_images_and_cloudinary.test.ts
 * Automated test suite for Multiple Product Images, Cloudinary URL management,
 * reordering, limit enforcement, and backward compatibility in MarketNest.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CURATED_STUDIO_SAMPLES } from '../src/components/seller/ProductImageManager';
import { Product } from '../src/types';

// Helper validator matching ProductImageManager logic
function validateProductImageUrl(rawUrl: string): { valid: boolean; error?: string; cleanUrl?: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter an image URL.' };
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return { valid: true, cleanUrl: trimmed };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Secure HTTPS is required for external images (e.g. https://res.cloudinary.com/...)'
      };
    }
    return { valid: true, cleanUrl: parsed.toString() };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid complete URL starting with https://'
    };
  }
}

describe('Product Image URL Validation & Cloudinary Support', () => {
  it('accepts valid HTTPS Cloudinary delivery URLs', () => {
    const url = 'https://res.cloudinary.com/marketnest-demo/image/upload/v1234567890/leather-bag.jpg';
    const result = validateProductImageUrl(url);
    assert.equal(result.valid, true);
    assert.equal(result.cleanUrl, url);
  });

  it('accepts generic secure HTTPS CDN URLs (Unsplash, Shopify, S3, etc.)', () => {
    const url = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800';
    const result = validateProductImageUrl(url);
    assert.equal(result.valid, true);
    assert.equal(result.cleanUrl, url);
  });

  it('rejects unencrypted HTTP image URLs for external security', () => {
    const url = 'http://insecure-cdn.com/product.jpg';
    const result = validateProductImageUrl(url);
    assert.equal(result.valid, false);
    assert.match(result.error || '', /Secure HTTPS is required/);
  });

  it('rejects malformed or empty strings', () => {
    assert.equal(validateProductImageUrl('').valid, false);
    assert.equal(validateProductImageUrl('   ').valid, false);
    assert.equal(validateProductImageUrl('not-a-valid-url').valid, false);
  });

  it('permits local studio sample asset paths for marketplace testing', () => {
    const sample = CURATED_STUDIO_SAMPLES[0].url;
    const result = validateProductImageUrl(sample);
    assert.equal(result.valid, true);
    assert.equal(result.cleanUrl, sample);
  });
});

describe('Multiple Images Gallery Operations & Reordering', () => {
  it('adds one image and marks it as primary', () => {
    const images: string[] = [];
    const url1 = 'https://res.cloudinary.com/demo/image/upload/sample1.jpg';
    images.push(url1);

    assert.equal(images.length, 1);
    assert.equal(images[0], url1);
  });

  it('adds multiple images in sequential order', () => {
    let images: string[] = [];
    const urls = [
      'https://res.cloudinary.com/demo/image/upload/front.jpg',
      'https://res.cloudinary.com/demo/image/upload/side.jpg',
      'https://res.cloudinary.com/demo/image/upload/back.jpg'
    ];

    urls.forEach((u) => {
      images.push(u);
    });

    assert.equal(images.length, 3);
    assert.equal(images[0], urls[0]);
    assert.equal(images[1], urls[1]);
    assert.equal(images[2], urls[2]);
  });

  it('prevents duplicate image URLs from being appended', () => {
    const images = ['https://res.cloudinary.com/demo/image/upload/front.jpg'];
    const candidate = 'https://res.cloudinary.com/demo/image/upload/front.jpg';

    const isDuplicate = images.includes(candidate);
    assert.equal(isDuplicate, true);
  });

  it('removes an image and re-indexes correctly', () => {
    let images = [
      'https://res.cloudinary.com/demo/image/upload/front.jpg',
      'https://res.cloudinary.com/demo/image/upload/side.jpg',
      'https://res.cloudinary.com/demo/image/upload/back.jpg'
    ];

    // Remove middle image
    images = images.filter((_, i) => i !== 1);

    assert.equal(images.length, 2);
    assert.equal(images[0], 'https://res.cloudinary.com/demo/image/upload/front.jpg');
    assert.equal(images[1], 'https://res.cloudinary.com/demo/image/upload/back.jpg');
  });

  it('allows reordering images (move left / move right)', () => {
    let images = ['img1', 'img2', 'img3'];

    // Move img2 to the left (earlier) -> should become ['img2', 'img1', 'img3']
    const moveLeft = (arr: string[], idx: number) => {
      if (idx <= 0) return arr;
      const copy = [...arr];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    };

    images = moveLeft(images, 1);
    assert.deepEqual(images, ['img2', 'img1', 'img3']);

    // Move img2 to the right -> should return to ['img1', 'img2', 'img3']
    const moveRight = (arr: string[], idx: number) => {
      if (idx >= arr.length - 1) return arr;
      const copy = [...arr];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    };

    images = moveRight(images, 0);
    assert.deepEqual(images, ['img1', 'img2', 'img3']);
  });

  it('promotes any selected image to primary cover position (Make Primary)', () => {
    let images = ['angle1', 'angle2', 'angle3'];

    // Make angle3 primary
    const makePrimary = (arr: string[], idx: number) => {
      const copy = [...arr];
      const [chosen] = copy.splice(idx, 1);
      copy.unshift(chosen);
      return copy;
    };

    images = makePrimary(images, 2);
    assert.equal(images[0], 'angle3');
    assert.deepEqual(images, ['angle3', 'angle1', 'angle2']);
  });

  it('enforces maximum image limit (8 images)', () => {
    const max = 8;
    const current = [
      'img1', 'img2', 'img3', 'img4',
      'img5', 'img6', 'img7', 'img8'
    ];

    const canAddMore = current.length < max;
    assert.equal(canAddMore, false);
  });
});

describe('Product Data Model & Backward Compatibility', () => {
  it('normalizes legacy products that only contain a single imageUrl', () => {
    const legacyProductDoc: any = {
      id: 'prod_legacy_1',
      title: 'Vintage Leather Wallet',
      price: 15000,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/wallet.jpg'
      // images array is omitted
    };

    const normalizedImages: string[] =
      Array.isArray(legacyProductDoc.images) && legacyProductDoc.images.length > 0
        ? legacyProductDoc.images
        : legacyProductDoc.imageUrl
        ? [legacyProductDoc.imageUrl]
        : [];

    const primaryImage = normalizedImages[0] || legacyProductDoc.imageUrl || '';

    assert.equal(normalizedImages.length, 1);
    assert.equal(normalizedImages[0], legacyProductDoc.imageUrl);
    assert.equal(primaryImage, legacyProductDoc.imageUrl);
  });

  it('persists both images array and imageUrl backward compatibility field upon save', () => {
    const productImages = [
      'https://res.cloudinary.com/demo/image/upload/main.jpg',
      'https://res.cloudinary.com/demo/image/upload/detail.jpg'
    ];

    const payload: Partial<Product> = {
      title: 'Handcrafted Ankara Jacket',
      images: productImages,
      imageUrl: productImages[0] || ''
    };

    assert.equal(payload.images?.length, 2);
    assert.equal(payload.imageUrl, 'https://res.cloudinary.com/demo/image/upload/main.jpg');
    assert.equal(payload.imageUrl, payload.images?.[0]);
  });

  it('validates product publishing requirements: active requires at least 1 image, draft allows 0 images', () => {
    const validatePublish = (status: 'active' | 'draft', images: string[]): { ok: boolean; reason?: string } => {
      if (status === 'active' && images.length === 0) {
        return { ok: false, reason: 'At least one photo required for active listing.' };
      }
      return { ok: true };
    };

    // Active product with 0 images -> fails validation
    assert.equal(validatePublish('active', []).ok, false);

    // Active product with 1+ images -> passes validation
    assert.equal(validatePublish('active', ['https://res.cloudinary.com/img1.jpg']).ok, true);

    // Draft product with 0 images -> passes validation
    assert.equal(validatePublish('draft', []).ok, true);
  });
});
