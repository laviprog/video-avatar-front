import { useEffect, useState } from 'react';
import { avatarsApi } from '@/lib/api';
import type { Avatar } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Loader2, Search } from 'lucide-react';
import AvatarDetailsModal from '@/components/admin/avatar-detail-modal';
import AvatarCreateModal from '@/components/admin/create-avatar-modal';

export default function AvatarList() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isCreateAvatar, setIsCreateAvatar] = useState(false);

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    setIsLoading(true);
    try {
      const data = await avatarsApi.listAvatars();
      setAvatars(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error('Ошибка загрузки аватаров');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAvatars = avatars.filter((avatar) =>
    avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Список Аватаров</CardTitle>
          <CardDescription>Всего аватаров: {avatars.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search">Поиск по названию</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={() => setIsCreateAvatar(true)}>Создать аватара</Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAvatars.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Аватары не найдены</p>
            ) : (
              filteredAvatars.map((avatar) => (
                <Card key={avatar.avatar_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{avatar.name}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAvatar(avatar)}>
                        Подробнее
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAvatar && (
        <AvatarDetailsModal
          avatar={selectedAvatar}
          onClose={() => setSelectedAvatar(null)}
          onUpdate={() => {
            loadAvatars();
            setSelectedAvatar(null);
          }}
        />
      )}

      {isCreateAvatar && (
        <AvatarCreateModal
          onClose={() => {
            loadAvatars();
            setIsCreateAvatar(false);
          }}
        />
      )}
    </>
  );
}
