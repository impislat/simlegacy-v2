/** Editorial photography for visual decoration only. Never used as user-uploaded Sim photos. */
const unsplash = (id, width, height) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=82`;
export const VISUALS = Object.freeze({
  sky: unsplash('photo-1763257708417-1bbffa6a81c2',1600,900),
  lavender: unsplash('photo-1673423050916-5a3532845548',1400,900),
  flowers: unsplash('photo-1752065134210-b4d18d9285c3',850,950),
  burano: unsplash('photo-1711247153065-e3cc0a64bdf4',850,750),
  autumn: unsplash('photo-1697836748445-b5cb113679c5',1200,800),
});
