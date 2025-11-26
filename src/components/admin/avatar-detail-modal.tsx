import { useState } from 'react';
import { avatarsApi } from '@/lib/api';
import type { Avatar } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Loader2, Save } from 'lucide-react';

interface AvatarDetailsModalProps {
  avatar: Avatar;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AvatarDetailsModal({ avatar, onClose, onUpdate }: AvatarDetailsModalProps) {
  const [name, setName] = useState(avatar.name);
  const [voiceId, setVoiceId] = useState(avatar.voice_id);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await avatarsApi.updateAvatar({
        avatar_id: avatar.avatar_id,
        name: name,
        voice_id: voiceId,
      });

      toast.success('Аватар обновлен');
      onUpdate();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка обновления аватара');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await avatarsApi.deleteAvatar(avatar.avatar_id);
      toast.success('Аватар удален');
      onUpdate();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка удаления аватара');
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <Dialog open onOpenChange={() => setShowDeleteConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы действительно хотите удалить аватара <strong>{avatar.name}</strong> (
              <strong>{avatar.avatar_id}</strong>)? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование Аватара</DialogTitle>
          <DialogDescription>ID: {avatar.avatar_id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name">Name</Label>
            <Input
              id="edit_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_monthly_limit">Voice ID</Label>
            <Input
              id="edit_voice_id"
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {/*<Button*/}
          {/*  variant="destructive"*/}
          {/*  onClick={() => setShowDeleteConfirm(true)}*/}
          {/*  disabled={isLoading}*/}
          {/*>*/}
          {/*  <Trash2 className="mr-2 h-4 w-4" />*/}
          {/*  Удалить*/}
          {/*</Button>*/}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
