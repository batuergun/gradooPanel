import { useSession, useSupabaseClient, } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import SchoolSearch from "../components/SchoolSearch";
import Search from '../components/Search'

export default function SearchPage() {
    const router = useRouter();
    const session = useSession();
    const supabase = useSupabaseClient();

    return <>{!session ? <></> : <SchoolSearch session={session} />}</>;
}
