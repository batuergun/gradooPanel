import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Query(session) {
    const supabase = useSupabaseClient;
    const user = useUser();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState < Profiles["username"] > (null);
    const [avatar_url, setAvatarUrl] = useState < Profiles["avatar_url"] > (null);

    const router = useRouter();

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
            }
        } catch (error) {
            alert("Error loading user data!");
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <></>
    );
}
