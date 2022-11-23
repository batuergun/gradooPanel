import {
  useSession,
  useSupabaseClient,
  Session,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Account from "../components/Account";

export default function AccountPage() {
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();

  return <>{!session ? <></> : <Account session={session} />}</>;
}
