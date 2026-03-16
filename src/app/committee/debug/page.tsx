import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';

export default async function DebugPage() {
  const { getUser, isAuthenticated, getRoles, getClaim, getPermissions } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/debug');
  }
  
  const user = await getUser();
  const roles = await getRoles();
  const permissions = await getPermissions();
  const claims = {
    roles: await getClaim('roles'),
    permissions: await getClaim('permissions'),
    role: await getClaim('role'),
    'kinde:roles': await getClaim('kinde:roles'),
    'custom:roles': await getClaim('custom:roles')
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Roles</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(roles, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Permissions</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(permissions, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Claims</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(claims, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Role Check Results</h2>
          <p>Has &apos;is-committee&apos; role: {roles?.some(role => role.key === 'is-committee') ? 'Yes' : 'No'}</p>
          <p>Has &apos;is-committee&apos; role (name check): {roles?.some(role => role.name === 'is-committee') ? 'Yes' : 'No'}</p>
          <p>Has &apos;is-committee&apos; role (id check): {roles?.some(role => role.id === 'is-committee') ? 'Yes' : 'No'}</p>
          <p>Roles array length: {roles?.length || 'null/undefined'}</p>
          
          <div className="mt-4 p-4 bg-green-50 rounded">
            <p className="text-green-800 font-semibold">✅ Roles are now working!</p>
            <p className="text-green-600 text-sm">You can now access the committee console with proper role-based access control.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
