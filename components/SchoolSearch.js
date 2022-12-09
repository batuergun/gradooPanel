import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

import CreatableSelect from 'react-select/creatable';
import AsyncSelect from 'react-select/async';

export default function SchoolSearch(session) {
    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    const [schools, setSchools] = useState([]);
    const [search, setSearch] = useState(null);

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

    const colourStyles = {
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                backgroundColor: isFocused ? "#999999" : null,
                color: "#333333"
            };
        }
    };

    async function filteredOptions(searchvalue) {
        const { data } = await supabase.rpc('schoollistsearch', { input: searchvalue })
        console.log(data)
        return data
    }

    const handleChange = async (selectedOption) => {
        console.log("handleChange", selectedOption)

        async function schoolQuery(input) {
            if (input !== null) {
                let selectedlist = []
                let schoolList = []

                input.forEach(e => {

                    if (JSON.stringify(e.value).indexOf(" ") >= 0) {
                        let words = JSON.stringify(e.value).split(" ")
                        words.forEach(w => {
                            selectedlist.push(w)
                        });
                    } else { selectedlist.push(e.value) }
                });

                const { data } = await supabase.rpc('listsearch', { input: selectedlist })

                if (data !== null) {
                    data.forEach(e => {
                        schoolList.push(e)
                    })
                    setSchools(schoolList)
                }
            }
        }
        schoolQuery(selectedOption)
    }

    const loadoptions = (searchValue, callback) => {
        setTimeout(() => {
            console.log('loadOptions', searchValue)
            //callback(filteredOptions)
        }, 2000)
    }

    async function getlist(input) {
        let schoolList = []
        if (input !== null) {
            const { data } = await supabase.rpc('listsearch', { input: input })
            console.log('data - ', data)
            if (data !== null) {
                data.forEach(e => {
                    schoolList.push(e.name)
                })
                setSearch(schoolList)
            }
        }
        console.log('schoollist', schoolList)
    }

    // <AsyncSelect cacheOptions isMulti defaultOptions styles={colourStyles} placeholder={'Input...'} loadOptions={promiseOptions} />
    const promiseOptions = (inputValue) =>
        new Promise((resolve) => {
            setTimeout(async () => {
                resolve(await getlist(inputValue));
            }, 1000);
        });

    return (
        <>
            <div className="sidebar">
                <h1>Gradoo Panel</h1>
                <img src="/img/divider.svg" className="divider" />

                <div className="section summary" onClick={() => router.push({ pathname: "/" })} >
                    <img src="/img/summary.svg" className="icon" />
                    <h2>Summary</h2>
                </div>

                <div className="section query" onClick={() => router.push({ pathname: "/search" })} >
                    <img src="/img/query.svg" className="icon" />
                    <h2>Search</h2>
                </div>

                <div className="section query bg-active-menu" onClick={() => router.push({ pathname: "/schoolsearch" })} >
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
                    <div className="profile" onClick={() => router.push({ pathname: "/account" })} >
                        <h3 className="flex items-center text-base font-medium">{username}</h3>
                        {avatar_url ? (<img src={avatar_url} alt="Avatar" className="avatar image" />) : (<div className="avatar no-image" />)}
                    </div>
                </div>

                <div className="flex-col">
                    <div className="w-[50vw] h-10 justify-start px-4">

                        <CreatableSelect isClearable isMulti styles={colourStyles} onChange={handleChange} placeholder={'Input...'} />

                    </div>
                </div>

                <div className="flex mt-2 p-4">
                    <div className="flex bg-cardBackground p-4 text-fontPrimary rounded-xl">
                        <p className="text-current font-semibold">{schools.length}</p>
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
                                    <p className="table-cell text-fontPrimary text-base text-center">Type</p>
                                </div>
                            </div>

                            <div class="table-row-group">

                                {schools.map(school => (<>
                                    <div className="table-row mt-1 text-fontPrimary hover:bg-dropShadow hover:text-fontSecondary hover:cursor-pointer">
                                        <div className="table-cell text-current text-sm">{school.name}</div>
                                        <div className="table-cell text-current text-sm text-center">{school.city}</div>
                                        <div className="table-cell text-current text-sm text-center">{school.type}</div>
                                    </div></>))
                                }
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
