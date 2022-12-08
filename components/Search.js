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

    const [eventMenu, seteventMenu] = useState(false)
    const [cityMenu, setcityMenu] = useState(false)

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


    let [events, selectedEvents] = Events([])

    function Events() {

        const eventlist = [{ "title": 'Learn How to Learn', 'selected': false }, { "title": 'data test', 'selected': true }]
        let selected = []
        let unselected = []

        eventlist.forEach(event => {
            if (event.selected) {
                selected.push(event)
            } else {
                unselected.push(event)
            }
        });

        return [unselected, selected]
    }

    let [cities, selectedCities] = Cities()

    function Cities() {

        const list = [{ "title": 'Ankara', 'selected': false }, { "title": 'Istanbul', 'selected': true }]
        let selected = []
        let unselected = []

        list.forEach(city => {
            if (city.selected) {
                selected.push(city)
            } else {
                unselected.push(city)
            }
        });

        return [unselected, selected]
    }

    return (
        <>
            <div className="sidebar">
                <h1>Gradoo Panel</h1>
                <img src="/img/divider.svg" className="divider" />

                <div className="section summary" onClick={() => router.push({ pathname: "/" })} >
                    <img src="/img/summary.svg" className="icon" />
                    <h2>Summary</h2>
                </div>

                <div className="section query bg-active-menu" onClick={() => router.push({ pathname: "/search" })} >
                    <img src="/img/query.svg" className="icon" />
                    <h2>Search</h2>
                </div>

                <div className="section query" onClick={() => router.push({ pathname: "/schoolsearch" })} >
                    <img src="/img/query.svg" className="icon" />
                    <h2>School Search</h2>
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
                        ) : (<>
                            <div className="avatar no-image" />
                        </>
                        )}
                    </div>
                </div>

                <div className="flex-col">
                    <div className="flex w-full h-10 justify-around grow px-3">

                        {!eventMenu ? (<></>) : (
                            <>
                                <div className="absolute flex flex-col bg-cardBackground text-fontPrimary rounded-xl p-1 top-[22vh] left-[20vw] z-10 min-w-[20vw] max-h-[35vh] overflow-auto">

                                    {selectedEvents.map(event =>
                                        <div className="flex text-current p-1 hover:bg-dropShadow hover:text-fontSecondary rounded-xl hover:cursor-pointer">
                                            <img className="w-3" src="/img/summary2.svg" />
                                            <a className="text-current text-sm ml-1">{event.title}</a>
                                        </div>
                                    )}
                                    {events.map(event =>
                                        <div className="flex text-current p-1 hover:bg-dropShadow hover:text-fontSecondary rounded-xl hover:cursor-pointer">
                                            <a className="text-current text-sm ml-1">{event.title}</a>
                                        </div>
                                    )}

                                </div>
                            </>
                        )}

                        {!cityMenu ? (<></>) : (
                            <>
                                <div className="absolute flex flex-col bg-cardBackground text-fontPrimary rounded-xl p-1 top-[22vh] left-[35vw] z-10 min-w-[20vw] max-h-[35vh] overflow-auto">

                                    {selectedCities.map(city =>
                                        <div className="flex text-current p-1 hover:bg-dropShadow hover:text-fontSecondary rounded-xl hover:cursor-pointer">
                                            <img className="w-3" src="/img/summary2.svg" />
                                            <a className="text-current text-sm ml-1">{city.title}</a>
                                        </div>
                                    )}
                                    {cities.map(city =>
                                        <div className="flex text-current p-1 hover:bg-dropShadow hover:text-fontSecondary rounded-xl hover:cursor-pointer">
                                            <a className="text-current text-sm ml-1">{city.title}</a>
                                        </div>
                                    )}

                                </div>
                            </>
                        )}

                        <div className="flex bg-cardBackground rounded-xl">
                            <input className="bg-transparent text-fontPrimary text-sm border-0" placeholder="Event" onClick={() => { seteventMenu(!eventMenu) }}></input>
                        </div>

                        <div className="flex bg-cardBackground rounded-xl">
                            <input className="bg-transparent text-fontPrimary text-sm border-0" placeholder="City" onClick={() => { setcityMenu(!cityMenu) }}></input>
                        </div>

                        <div className="flex bg-cardBackground rounded-xl">
                            <input className="bg-transparent text-fontPrimary text-sm border-0" placeholder="School"></input>
                        </div>

                        <div className="flex bg-cardBackground rounded-xl">
                            <input className="bg-transparent text-fontPrimary text-sm border-0" placeholder="Usertype"></input>
                        </div>

                        <div className="flex bg-cardBackground rounded-xl">
                            <input className="bg-transparent text-fontPrimary text-sm border-0" placeholder="Class"></input>
                        </div>

                        <div className="flex bg-activeMenu rounded-xl text-fontSecondary w-10 justify-center hover:cursor-pointer hover:bg-dropShadow">
                            <img src="/img/query.svg" className="w-5" />
                        </div>
                    </div>

                    <div className="flex mt-2 p-4">
                        <div className="flex bg-cardBackground p-4 text-fontPrimary rounded-xl">
                            <p className="text-current font-semibold">0</p>
                            <p className="text-current ml-1"> result(s) found.</p>
                        </div>
                    </div>

                    <div className="flex p-4">
                        <div className="p-3 bg-cardBackground w-full h-[55vh] rounded-2xl overflow-auto">
                            <div className="table w-full">

                                <div className="table-header-group">
                                    <div className="table-row">
                                        <p className="table-cell text-fontPrimary text-base">School</p>
                                        <p className="table-cell text-fontPrimary text-base text-center">City</p>
                                        <p className="table-cell text-fontPrimary text-base text-center">Applications</p>
                                    </div>
                                </div>

                                <div class="table-row-group">


                                    <div className="table-row mt-1 text-fontPrimary hover:bg-dropShadow hover:text-fontSecondary hover:cursor-pointer">
                                        <div className="table-cell text-current text-sm">School-Data</div>
                                        <div className="table-cell text-current text-sm text-center">City</div>
                                        <div className="table-cell text-current text-sm text-center">Application</div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}
