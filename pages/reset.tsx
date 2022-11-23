import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Account from "../components/Account";

const Home = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <>
      <Auth
        view="update_password"
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
      />
    </>
  );
};

export default Home;
