'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DebugPage() {
  const { data: session, isPending } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const user = await res.json();
          setUserData(user);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isPending) {
      fetchUserData();
    }
  }, [isPending]);

  if (isPending || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Session Data:</h2>
        <pre className="bg-white p-3 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">User from /api/user:</h2>
        <pre className="bg-white p-3 rounded overflow-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>

      {userData && (
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <p><strong>Role value:</strong> <code>{userData.role}</code></p>
          <p><strong>Role type:</strong> <code>{typeof userData.role}</code></p>
          <p><strong>Role is null:</strong> {userData.role === null ? 'YES' : 'NO'}</p>
          <p><strong>Role is undefined:</strong> {userData.role === undefined ? 'YES' : 'NO'}</p>
        </div>
      )}
    </div>
  );
}
