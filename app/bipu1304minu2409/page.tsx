import { getSession } from '../actions/auth';
import AdminLoginPage from '@/components/pages/AdminLoginPage';
import AdminPage from '@/components/pages/AdminPage';

export default async function AdminRoute() {
    const session = await getSession();

    if (session && session.role === 'admin') {
        return <AdminPage />;
    }

    return <AdminLoginPage />;
}
