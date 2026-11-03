'use client';

// Quarantined: nothing in the app imports this list. User management lives in components/settings.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";
import { switchUser, updateUser } from "@/app/actions/user";

interface UserListProps {
  users: {
    id: string;
    name: string | null;
    email: string;
  }[];
  currentUserId?: string;
}

export function UserList({ users, currentUserId }: UserListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
          {editingId === user.id ? (
            <form 
              action={async (formData) => {
                await updateUser(user.id, formData);
                setEditingId(null);
              }}
              className="flex-1 flex items-center gap-2"
            >
              <Input name="name" defaultValue={user.name || ''} placeholder="称呼" className="h-8 w-24" />
              <Input name="email" defaultValue={user.email} placeholder="邮箱" className="h-8 flex-1" />
              <Button size="icon" className="h-8 w-8" type="submit">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" type="button" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {user.name}
                    <button onClick={() => setEditingId(user.id)} className="text-muted-foreground hover:text-primary">
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <form action={switchUser.bind(null, user.id)}>
                {currentUserId === user.id ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    <Check className="h-4 w-4" /> 当前
                  </div>
                ) : (
                  <Button variant="ghost" size="sm">切换</Button>
                )}
              </form>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
