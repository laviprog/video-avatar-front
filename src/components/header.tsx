import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { User } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, RefreshCw, Video } from 'lucide-react';
import { toast } from 'react-toastify';

interface HeaderProps {
  user: User;
  onRefresh: () => void;
}

export default function Header({ user, onRefresh }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    authApi.logout();
    toast.info('Вы вышли из системы');
    router.push('/login');
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}м ${secs}с`;
  };

  const getUsagePercentage = (): number => {
    if (!user.monthly_limit || !user.monthly_usage) return 0;
    return Math.min((user.monthly_usage / user.monthly_limit) * 100, 100);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video Avatar</h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user.role !== 'admin' && (
              <Card className="px-4 py-2">
                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-600">Использовано</p>
                  <p className="text-sm font-semibold">
                    {formatTime(user.monthly_usage)} / {formatTime(user.monthly_limit)}
                  </p>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${getUsagePercentage()}%` }}
                    />
                  </div>
                </div>
              </Card>
            )}

            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
