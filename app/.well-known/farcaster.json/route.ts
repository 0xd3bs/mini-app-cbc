function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || "https://mini-app-cbc.vercel.app/";

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "eyJmaWQiOjgwNDM2NywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDFFQkNGODVmNEM2ZmJmNzVjOGUzMTlFNjg0NTc5Q2JEYkUwMTY4MGIifQ",
      payload: process.env.FARCASTER_PAYLOAD || "eyJkb21haW4iOiJtaW5pLWFwcC1jYmMudmVyY2VsLmFwcCJ9",
      signature: process.env.FARCASTER_SIGNATURE || "MHhiYmM5YjNlNGFlMTY2OGI5NzU0NTUzMTA5NzA1MWUyNzY1YmIxODE2MTE0ZmFjMWRkZTAxYzAzNDExNDQ0MzQyNDczZTE0MzNhMGQ5MDg4OTViY2Q3MmY5OTI3M2MxYThmMDgzNzMwYTc5ZmZkMTc4Zjk4NzJjZmJjMmNlMGVjYjFi",
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "smart-swap",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "smartswap - ml-driven",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "smartswap - ml-driven",
      screenshotUrls: process.env.NEXT_PUBLIC_APP_SCREENSHOT_URLS?.split(',') || [`${URL}/screenshot.png`],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${URL}/icon.png`,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/hero.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "defi",
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/image.png`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "ml-driven smart swapping",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "smart-swap - ml-driven smart swapping",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
      buttonTitle: "Start",
      imageUrl: `${URL}/image.png`,
    }),
  });
}
