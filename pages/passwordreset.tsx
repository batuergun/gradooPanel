import {
  useSession,
  useSupabaseClient,
  Session,
} from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useRouter } from "next/router";

export default function AccountPage() {
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <>
      {!session ? (
        <></>
      ) : (
        <>
          <div>
            <Auth
              view="update_password"
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="dark"
            />
            <button
              className="button block"
              onClick={() => router.push({ pathname: "/" })}
            >
              Home
            </button>
          </div>
        </>
      )}
    </>
  );
}
