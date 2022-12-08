import { useSession } from "@supabase/auth-helpers-react";
import SchoolSearch from "../components/SchoolSearch";

export default function SearchPage() {
    const session = useSession();

    return <>{!session ? <></> : <SchoolSearch session={session} />}</>;
}
