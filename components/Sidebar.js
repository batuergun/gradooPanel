import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Sidebar(options) {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const Summary = ({ children }) => {
        return (
            <div className={`${options.activeMenu == 'Summary' ? 'bg-active-menu' : ''}`}>
                {children}
            </div>
        );
    };

    const Search = ({ children }) => {
        return (
            <div className={`${options.activeMenu == 'Search' ? 'bg-active-menu' : ''}`}>
                {children}
            </div>
        );
    };

    const Campaigns = ({ children }) => {
        return (
            <div className={`${options.activeMenu == 'Campaigns' ? 'bg-active-menu' : ''}`}>
                {children}
            </div>
        );
    };


    return (
        <>
            <div className="sidebar">
                <h1>Gradoo Panel</h1>
                <img src="/img/divider.svg" className="divider" />

                <Summary>
                    <div className="section summary" onClick={() => router.push({ pathname: "/" })} >
                        <img src="/img/summary.svg" className="icon" />
                        <h2>Summary</h2>
                    </div>
                </Summary>

                <Search>
                    <div className="section query" onClick={() => router.push({ pathname: "/search" })} >
                        <img src="/img/query.svg" className="icon" />
                        <h2>Search</h2>
                    </div>
                </Search>

                <Campaigns>
                    <div className="section campaigns" onClick={() => router.push({ pathname: "/campaigns" })}>
                        <img src="/img/summary.svg" className="icon" />
                        <h2>Campaigns</h2>
                    </div>
                </Campaigns>

                <div
                    className="section settings"
                    onClick={() => supabase.auth.signOut()}
                >
                    <img src="/img/db.svg" className="icon" />
                    <h2>Log Out</h2>
                </div>
            </div>
        </>
    )
}