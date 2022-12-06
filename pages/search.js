import { useSession, useSupabaseClient, } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Search from "../components/Search";

export default function SearchPage() {
    const router = useRouter();
    const session = useSession();
    const supabase = useSupabaseClient();

    return <>{!session ? <></> : <Search session={session} />}</>;
}
