import { useEffect, useState } from 'react';
import { avatarsApi, videosApi } from '@/lib/api';
import type { Avatar, VideoDetail } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';
import { Loader2, Video as VideoIcon } from 'lucide-react';
import VideoPlayer from './video-player';

interface VideoCreationProps {
  onVideoCreated: () => void;
}

export default function VideoCreation({ onVideoCreated }: VideoCreationProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);
  const [creatingVideo, setCreatingVideo] = useState<VideoDetail | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAvatars();
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const loadAvatars = async () => {
    try {
      const data = await avatarsApi.listAvatars();
      setAvatars(data);
      if (data.length > 0) {
        setSelectedAvatarId(data[0].avatar_id);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error('Ошибка загрузки аватаров');
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  const startPolling = (videoId: string) => {
    const interval = setInterval(async () => {
      try {
        const video = await videosApi.getVideo(videoId);
        setCreatingVideo(video);

        if (video.status === 'COMPLETED') {
          clearInterval(interval);
          setPollingInterval(null);
          toast.success('Видео готово!');
          onVideoCreated();
        } else if (video.status === 'FAILED' || video.status === 'CANCELED') {
          clearInterval(interval);
          setPollingInterval(null);
          toast.error(video.error_message || 'Ошибка создания видео');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error);
        clearInterval(interval);
        setPollingInterval(null);
        toast.error('Ошибка проверки статуса видео');
      }
    }, 5000);

    setPollingInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !text.trim() || !selectedAvatarId) {
      toast.warning('Заполните все поля');
      return;
    }

    setIsLoading(true);

    try {
      const video = await videosApi.createVideo({
        title: title.trim(),
        avatar_id: selectedAvatarId,
        text: text.trim(),
      });

      setCreatingVideo(video);
      toast.success('Видео создается...');
      startPolling(video.id);

      setTitle('');
      setText('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Ошибка создания видео');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setCreatingVideo(null);
  };

  if (isLoadingAvatars) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {creatingVideo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Создание видео: {creatingVideo.title}</CardTitle>
            <CardDescription>
              Статус: <span className="font-semibold">{creatingVideo.status}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {creatingVideo.status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-gray-700">Видео создается, пожалуйста подождите...</p>
              </div>
            )}
            {creatingVideo.status === 'COMPLETED' && creatingVideo.s3_url && (
              <div className="space-y-4">
                <VideoPlayer url={creatingVideo.s3_url} />
                <Button onClick={handleClosePreview} variant="outline" className="w-full">
                  Закрыть
                </Button>
              </div>
            )}
            {(creatingVideo.status === 'FAILED' || creatingVideo.status === 'CANCELED') && (
              <div className="space-y-4">
                <p className="text-red-600">
                  {creatingVideo.error_message || 'Ошибка создания видео'}
                </p>
                <Button onClick={handleClosePreview} variant="outline" className="w-full">
                  Закрыть
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-6 w-6" />
            Создать новое видео
          </CardTitle>
          <CardDescription>Выберите аватара и введите текст для создания видео</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название видео</Label>
              <Input
                id="title"
                placeholder="Мое первое видео"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Выберите аватара</Label>
              <Select
                value={selectedAvatarId}
                onValueChange={setSelectedAvatarId}
                disabled={isLoading || avatars.length === 0}
              >
                <SelectTrigger id="avatar">
                  <SelectValue placeholder="Выберите аватара" />
                </SelectTrigger>
                <SelectContent>
                  {avatars.map((avatar) => (
                    <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                      {avatar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Текст для озвучивания</Label>
              <Textarea
                id="text"
                placeholder="Введите текст, который будет произносить аватар..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                required
                rows={6}
              />
              <p className="text-sm text-gray-500">Количество символов: {text.length}</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || avatars.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать видео
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
