'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api';
import type { User } from '@/types/api';
import { toast } from 'react-toastify';
import Header from '@/components/header';
import VideoCreation from '@/components/video-creation';
import VideoList from '@/components/video-list';
import AdminPanel from '@/components/admin-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadUser().catch((error) => {
      console.error(error);
      toast.error('Ошибка загрузки данных пользователя');
      router.push('/login');
    });
  }, [refreshKey]);

  const loadUser = async () => {
    try {
      const userData = await usersApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка загрузки данных пользователя');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onRefresh={loadUser} />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={user.role === 'admin' ? 'admin' : 'create'} className="w-full">
          <TabsList
            className="grid w-full max-w-md mx-auto"
            style={{
              gridTemplateColumns: user.role === 'admin' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            }}
          >
            {user.role === 'admin' && <TabsTrigger value="admin">Админ панель</TabsTrigger>}
            <TabsTrigger value="create">Создать видео</TabsTrigger>
            <TabsTrigger value="videos">Мои видео</TabsTrigger>
          </TabsList>

          {user.role === 'admin' && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}

          <TabsContent value="create">
            <VideoCreation onVideoCreated={handleVideoCreated} />
          </TabsContent>

          <TabsContent value="videos">
            <VideoList key={refreshKey} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
