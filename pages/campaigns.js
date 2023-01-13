import { useSession } from "@supabase/auth-helpers-react";
import CampaignList from "../components/CampaignList";
export default function Campaigns() {
    const session = useSession();

    return <>{!session ? <></> : <CampaignList session={session} />}</>;
}
