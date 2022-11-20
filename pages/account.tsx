import { useSession, useSupabaseClient, Session } from "@supabase/auth-helpers-react";
import Account from "../components/Account";

export default function AccountPage() {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <>
      <Account session={session} />
    </>
  );
}
