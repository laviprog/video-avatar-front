import { useEffect, useState } from 'react';
import { videosApi } from '@/lib/api';
import type { VideoDetail } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { Calendar, Clock, DownloadIcon, Loader2, Video } from 'lucide-react';
import VideoPlayer from './video-player';
import { Button } from '@/components/ui/button';

export default function VideoList() {
  const [videos, setVideos] = useState<VideoDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoDetail | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await videosApi.listVideos();
      // Sort by completed_at desc
      const sorted = data.sort((a, b) => {
        if (!a.completed_at) return 1;
        if (!b.completed_at) return -1;
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
      });
      setVideos(sorted);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error('Ошибка загрузки видео');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: VideoDetail['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      IN_PROGRESS: 'default',
      COMPLETED: 'secondary',
      FAILED: 'destructive',
      CANCELED: 'outline',
    };

    const labels: Record<string, string> = {
      IN_PROGRESS: 'В процессе',
      COMPLETED: 'Готово',
      FAILED: 'Ошибка',
      CANCELED: 'Отменено',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          На текущитй момент созданных видео нет
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {selectedVideo && selectedVideo.s3_url && (
        <Card className="mb-6">
          <CardHeader className="relative">
            <CardTitle>{selectedVideo.title}</CardTitle>
            <CardDescription>
              {getStatusBadge(selectedVideo.status)}
              {selectedVideo.completed_at && (
                <span className="ml-2 text-sm">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {formatDate(selectedVideo.completed_at)}
                </span>
              )}
            </CardDescription>
            <div className="absolute top-0 right-6">
              <a href={selectedVideo.s3_url} download>
                <Button>
                  <DownloadIcon />
                  Скачать
                </Button>
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <VideoPlayer url={selectedVideo.s3_url} />
            {selectedVideo.text && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{selectedVideo.text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-1">
        {videos.map((video) => (
          <Card
            key={video.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedVideo?.id === video.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedVideo(video)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{video.title}</CardTitle>
                {getStatusBadge(video.status)}
              </div>
              {video.completed_at && (
                <CardDescription className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(video.completed_at)}
                  </span>
                  {video.duration_seconds !== null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(video.duration_seconds)}
                    </span>
                  )}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {video.status === 'IN_PROGRESS' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Создается...
                </div>
              )}
              {video.status === 'FAILED' && video.error_message && (
                <p className="text-sm text-red-600">{video.error_message}</p>
              )}
              {video.text && video.status === 'COMPLETED' && (
                <p className="text-sm text-gray-600 line-clamp-2">{video.text}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
