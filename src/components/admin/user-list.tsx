import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import type { User } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { Calendar, Loader2, Search } from 'lucide-react';
import UserDetailsModal from './user-detail-modal';
import UserCreateModal from '@/components/admin/create-user-modal';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isCreateUser, setIsCreateUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (date?: string) => {
    setIsLoading(true);
    try {
      const data = await usersApi.listUsers(date);
      setUsers(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedDate(value);

    if (value) {
      // Convert YYYY-MM to MM.YYYY
      const [year, month] = value.split('-');
      loadUsers(`${month}.${year}`);
    } else {
      loadUsers();
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}м ${secs}с`;
  };

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
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>Всего пользователей: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search">Поиск по email</Label>
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
              <div className="space-y-2">
                <Label htmlFor="date">Месяц для статистики</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="date"
                    type="month"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={() => setIsCreateUser(true)}>Создать пользователя</Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Пользователи не найдены</p>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{user.email}</p>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          </Badge>
                          {!user.is_active && <Badge variant="destructive">Неактивен</Badge>}
                        </div>
                        {user.role !== 'admin' && (
                          <div className="text-sm text-gray-600">
                            Использовано: {formatTime(user.monthly_usage)} /{' '}
                            {formatTime(user.monthly_limit)}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
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

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={() => {
            loadUsers(selectedDate ? selectedDate.split('-').reverse().join('.') : undefined);
            setSelectedUser(null);
          }}
        />
      )}

      {isCreateUser && (
        <UserCreateModal
          onClose={() => {
            loadUsers(undefined);
            setIsCreateUser(false);
          }}
        />
      )}
    </>
  );
}
