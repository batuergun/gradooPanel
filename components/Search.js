import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Search(session) {
    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    useEffect(() => {
        getProfile();
    }, [session]);

    async function getProfile() {
        try {
          setLoading(true);
          if (!user) throw new Error("No user");
    
          let { data, error, status } = await supabase
            .from("profiles")
            .select(`username, avatar_url`)
            .eq("id", user.id)
            .single();
    
          if (error && status !== 406) {
            throw error;
          }
    
          if (data) {
            setUsername(data.username);
            setAvatarUrl(data.avatar_url);
            downloadImage(data.avatar_url);
          }
        } catch (error) {
          alert("Error loading user data!");
          console.log(error);
        } finally {
          setLoading(false);
        }
      }

    async function downloadImage(path) {
        try {
          const { data, error } = await supabase.storage
            .from("avatars")
            .download(path);
          if (error) {
            throw error;
          }
          const url = URL.createObjectURL(data);
          setAvatarUrl(url);
        } catch (error) {
          console.log("Error downloading image: ", error);
        }
      }

    return (
        <>
            <div className="sidebar">
                <h1>Gradoo Panel</h1>
                <img src="/img/divider.svg" className="divider" />
                <div
                    className="section summary"
                    onClick={() => router.push({ pathname: "/" })}
                >
                    <img src="/img/summary.svg" className="icon" />
                    <h2>Summary</h2>
                </div>
                <div
                    className="section query bg-active-menu"
                    onClick={() => router.push({ pathname: "/search" })}
                >
                    <img src="/img/query.svg" className="icon" />
                    <h2>Search</h2>
                </div>

                <div className="section campaigns" campaign-button>
                    <img src="/img/summary.svg" className="icon" />
                    <h2>Campaigns</h2>
                </div>

                <div className="campaignlist visible" campaign-list>
                    <div
                        className="campaignelement"
                        onClick={() => router.push({ pathname: "/project/1" })}
                    >
                        Gradoo x Derece Atölyesi
                    </div>
                    <div
                        className="campaignelement"
                        onClick={() => router.push({ pathname: "/project/2" })}
                    >
                        Learn How to Learn: English
                    </div>
                </div>

                <div
                    className="section settings"
                    onClick={() => supabase.auth.signOut()}
                >
                    <img src="/img/db.svg" className="icon" />
                    <h2>Log Out</h2>
                </div>
            </div>

            <div className="container">
                <div className="header">
                    <div className="title">
                        <img src="/img/summary2.svg" />
                        <h2 className="flex items-center text-lg font-medium">Search</h2>
                    </div>
                    <div
                        className="profile"
                        onClick={() => router.push({ pathname: "/account" })}
                    >
                        <h3 className="flex items-center text-base font-medium">{username}</h3>
                        {avatar_url ? (
                            <img src={avatar_url} alt="Avatar" className="avatar image" />
                        ) : (
                            <div className="avatar no-image" />
                        )}
                    </div>
                </div>

                <div className="viewport">

                </div>
            </div>
        </>
    );
}
