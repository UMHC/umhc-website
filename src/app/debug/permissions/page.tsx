'use client';

import { useEffect, useState } from 'react';

interface PermissionData {
  user: any;
  roles: any;
  permissions: any;
  hasCommitteeRole: boolean;
  hasTreasurerPermission: boolean;
}

export default function DebugPermissions() {
  const [data, setData] = useState<PermissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/debug/permissions')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Permission Debug Information</h1>
      
      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data?.user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Roles</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data?.roles, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Permissions</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data?.permissions, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Permission Checks</h2>
          <div className="space-y-2">
            <div className={`p-3 rounded ${data?.hasCommitteeRole ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Has Committee Role:</strong> {data?.hasCommitteeRole ? 'Yes' : 'No'}
            </div>
            <div className={`p-3 rounded ${data?.hasTreasurerPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Has Treasurer Permission:</strong> {data?.hasTreasurerPermission ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
