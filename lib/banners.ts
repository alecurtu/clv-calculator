export type BannerCreative = {
  lg?: string; // 970x90
  md?: string; // 728x90
  sm?: string; // 320x50
};

export type Banner = {
  id: string;
  href: string; // clickthrough URL
  alt?: string;
  creative: BannerCreative;
};

export const BANNERS: Banner[] = [
  {
    id: 'b1',
    href: 'https://example.com/ad1',
    alt: 'Ad 1',
    creative: {
      lg: '/banners/sample-970x90-1.png',
      md: '/banners/sample-728x90-1.png',
      sm: '/banners/sample-320x50-1.png'
    }
  },
  {
    id: 'b2',
    href: 'https://example.com/ad2',
    alt: 'Ad 2',
    creative: {
      lg: '/banners/sample-970x90-2.png',
      md: '/banners/sample-728x90-2.png',
      sm: '/banners/sample-320x50-2.png'
    }
  }
];
