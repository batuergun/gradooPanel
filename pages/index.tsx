import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Account from "../components/Account";
import Dashboard from "./dashboard";

const Home = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <>
      <div className="container">
        <div className="loginCard">
          {!session ? (
            <Auth
              view="sign_in"
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="dark"
            />
          ) : (
            <Dashboard session={session} />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
