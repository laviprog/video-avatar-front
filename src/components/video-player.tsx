interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video controls className="w-full h-full" src={url}>
        Ваш браузер не поддерживает воспроизведение видео.
      </video>
    </div>
  );
}
