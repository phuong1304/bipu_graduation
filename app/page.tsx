import { getSession } from './actions/auth';
import ParticipantLoginPage from '@/components/pages/ParticipantLoginPage';
import ParticipantExperience from '@/components/pages/ParticipantExperience';

export default async function Home() {
    const session = await getSession();

    if (session && session.role === 'user') {
        return <ParticipantExperience user={session} />;
    }

    return <ParticipantLoginPage />;
}
