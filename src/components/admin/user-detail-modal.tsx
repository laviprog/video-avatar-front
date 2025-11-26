import { useState } from 'react';
import { usersApi } from '@/lib/api';
import type { Role, User } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-toastify';
import { Loader2, Save } from 'lucide-react';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserDetailsModal({ user, onClose, onUpdate }: UserDetailsModalProps) {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<Role>(user.role);
  const [monthlyLimit, setMonthlyLimit] = useState(
    user.monthly_limit ? Math.floor(user.monthly_limit / 60).toString() : ''
  );
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(user.is_active);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}м ${secs}с`;
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await usersApi.updateUser({
        id: user.id,
        email: email !== user.email ? email : null,
        role: role !== user.role ? role : null,
        monthly_limit: monthlyLimit ? parseInt(monthlyLimit) : null,
        password: password || null,
        is_active: isActive !== user.is_active ? isActive : null,
      });

      toast.success('Пользователь обновлен');
      onUpdate();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка обновления пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await usersApi.deleteUser(user.id);
      toast.success('Пользователь удален');
      onUpdate();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка удаления пользователя');
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
              Вы действительно хотите удалить пользователя <strong>{user.email}</strong>? Это
              действие нельзя отменить.
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
          <DialogTitle>Редактирование пользователя</DialogTitle>
          <DialogDescription>ID: {user.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {user.role !== 'admin' && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Статистика использования</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Использовано</p>
                  <p className="text-lg font-semibold">{formatTime(user.monthly_usage)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Лимит</p>
                  <p className="text-lg font-semibold">{formatTime(user.monthly_limit)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
            <Input
              id="edit_password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_role">Роль</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)} disabled={isLoading}>
              <SelectTrigger id="edit_role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Пользователь</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_monthly_limit">Месячный лимит (минуты)</Label>
            <Input
              id="edit_monthly_limit"
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              disabled={isLoading}
              min="0"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="edit_is_active">Активный аккаунт</Label>
              <p className="text-sm text-gray-500">
                Неактивные пользователи не могут войти в систему
              </p>
            </div>
            <Switch
              id="edit_is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
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
