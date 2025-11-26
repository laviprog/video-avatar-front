import { useState } from 'react';
import { avatarsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface AvatarCreateModalProps {
  onClose: () => void;
}

export default function AvatarCreateModal({ onClose }: AvatarCreateModalProps) {
  const [avatarId, setAvatarId] = useState('');
  const [name, setName] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await avatarsApi.createAvatar({
        avatar_id: avatarId,
        name: name,
        voice_id: voiceId,
      });

      toast.success('Аватар был успешно создан');
      setAvatarId('');
      setName('');
      setVoiceId('');
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Ошибка создания аватра');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создание автара</DialogTitle>
          <DialogDescription>Заполните форму для создания нового аватара</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar_id">Avatar ID</Label>
            <Input
              id="avatar_id"
              type="text"
              value={avatarId}
              onChange={(e) => setAvatarId(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voice_id">Voice ID</Label>
            <Input
              id="voice_id"
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Создать аватара
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
