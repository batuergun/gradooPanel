import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Sidebar() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    return (
        <div className="sidebar">
            <h1>Gradoo Panel</h1>
            <img src="/img/divider.svg" className="divider" />
            <div
                className="section summary bg-active-menu"
                onClick={() => router.push({ pathname: "/" })}
            >
                <img src="/img/summary.svg" className="icon" />
                <h2>Summary</h2>
            </div>
            <div
                className="section query"
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
    )
}