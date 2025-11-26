import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import UserList from './admin/user-list';
import AvatarList from './admin/avatar-list';

export default function AdminPanel() {
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Панель администратора
          </CardTitle>
          <CardDescription>Управление пользователями и мониторинг использования</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList
              className="grid w-full max-w-md"
              style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
            >
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="avatars">Аватары</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserList />
            </TabsContent>

            <TabsContent value="avatars">
              <AvatarList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
