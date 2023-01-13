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
            <div className="fixed top-0 left-0 flex flex-col bg-backgroundSecondary h-screen w-[20vw]">
                <h1 className="m-0 pt-[3vh] pl-[1vw] text-xl font-black cursor-pointer">Gradoo Panel</h1>
                <img src="/img/divider.svg" className="w-[5vw] pl-[1vw] mt-2 font-bold" />

                <Summary>
                    <div className="flex items-start px-[1.2vw] py-[1vw] hover:bg-[#394b54] cursor-pointer" onClick={() => router.push({ pathname: "/" })} >
                        <img src="/img/summary.svg" className="w-[1.5vw] mr-[1vw]" />
                        <h2 className="align-middle m-o text-base font-bold">Summary</h2>
                    </div>
                </Summary>

                <Search>
                    <div className="flex items-start px-[1.2vw] py-[1vw] hover:bg-[#394b54] cursor-pointer" onClick={() => router.push({ pathname: "/search" })} >
                        <img src="/img/query.svg" className="w-[1.5vw] mr-[1vw]" />
                        <h2 className="align-middle m-o text-base font-bold">Search</h2>
                    </div>
                </Search>

                <Campaigns>
                    <div className="flex items-start px-[1.2vw] py-[1vw] hover:bg-[#394b54] cursor-pointer" onClick={() => router.push({ pathname: "/campaigns" })}>
                        <img src="/img/summary.svg" className="w-[1.5vw] mr-[1vw]" />
                        <h2 className="align-middle m-o text-base font-bold">Campaigns</h2>
                    </div>
                </Campaigns>

                <div
                    className="flex items-start px-[1.2vw] py-[1vw] mt-auto hover:bg-[#394b54] cursor-pointer"
                    onClick={() => supabase.auth.signOut()}
                >
                    <img src="/img/db.svg" className="w-[1.5vw] mr-[1vw]" />
                    <h2 className="align-middle m-o text-base font-bold">Log Out</h2>
                </div>
            </div>
            <div className="basis-[20%]"></div>
        </>
    )
}