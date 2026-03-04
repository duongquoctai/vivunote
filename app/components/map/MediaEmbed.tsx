"use client";

import { Icon } from "@iconify/react";

interface MediaEmbedProps {
  url: string;
}

const TikTokEmbed = ({ id }: { id: string }) => (
  <div className="relative aspect-9/16 w-full mx-auto overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
    <iframe
      src={`https://www.tiktok.com/embed/${id}`}
      className="w-full h-full border-none"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
    />
  </div>
);

const YouTubeEmbed = ({ id }: { id: string }) => (
  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
    <iframe
      src={`https://www.youtube.com/embed/${id}?autoplay=0&rel=0`}
      className="w-full h-full border-none"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  </div>
);

const InstagramEmbed = ({ id }: { id: string }) => (
  <div className="relative aspect-9/16 w-full mx-auto overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
    <iframe
      src={`https://www.instagram.com/reels/${id}/embed`}
      className="w-full h-full border-none"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
    />
  </div>
);

const MediaEmbed = ({ url }: MediaEmbedProps) => {
  if (!url) return null;

  // TikTok Extraction
  const extractTikTokId = (url: string) => {
    const match = url.match(/(?:video\/|v\/|embed\/v2\/)(\d+)/);
    return match ? match[1] : null;
  };

  // YouTube Extraction
  const extractYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Instagram Extraction
  const extractInstagramId = (url: string) => {
    const match = url.match(/(?:reels?|p|tv)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const tiktokId = extractTikTokId(url);
  const youtubeId = extractYouTubeId(url);
  const instagramId = extractInstagramId(url);

  if (tiktokId) return <TikTokEmbed id={tiktokId} />;
  if (youtubeId) return <YouTubeEmbed id={youtubeId} />;
  if (instagramId) return <InstagramEmbed id={instagramId} />;

  return (
    <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-500">
      <Icon icon="mdi:link-variant" className="w-4 h-4" />
      <span className="truncate">{url}</span>
    </div>
  );
};

export default MediaEmbed;
