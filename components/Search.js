import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';

export default function Search(session) {
    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    const [query, setQuery] = useState({ events: [], cities: [], schools: [], types: [] })
    const [schools, setSchools] = useState([])

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
        },
        container: base => ({
            ...base,
            flex: 1,
            padding: '.5rem',
        })
    };

    const eventoptions = [
        { value: 'Learn How to Learn', label: 'Learn How to Learn' },
        { value: 'data test', label: 'data test' },
    ]

    const cityoptions = [
        { value: 'Istanbul', label: 'Istanbul' },
        { value: 'Ankara', label: 'Ankara' },
        { value: 'Izmir', label: 'Izmir' },
    ]

    const classoptions = [
        { value: 'Hazırlık (Lise)', label: 'Learn How to Learn' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
        { value: 'Hazırlık (Üniversite)', label: 'Hazırlık (Üniversite)' },
        { value: '1. sınıf', label: '1. sınıf' },
        { value: '2. sınıf', label: '2. sınıf' },
        { value: '3. sınıf', label: '3. sınıf' },
        { value: '4. sınıf', label: '4. sınıf' },
    ]

    // const usertypeoptions = [
    //     { value: 'Lise', label: 'Lise' },
    //     { value: 'Üniversite', label: 'Üniversite' },
    //     { value: 'Diğer', label: 'Diğer' },
    // ]

    const usertypeoptions = [
        { value: 'High', label: 'High School' },
        { value: 'University', label: 'University' }
    ]

    const eventchange = (input) => {
        let eventlist = []

        input.forEach(i => {
            eventlist.push(i.value)
        });

        setQuery(query => ({ ...query, events: eventlist }))
    }

    const citychange = async (input) => {
        let citylist = []

        input.forEach(i => {
            citylist.push(i.value)
        });

        setQuery(query => ({ ...query, cities: citylist }))
    }

    const schoolchange = async (input) => {
        let schoollist = []

        input.forEach(i => {
            schoollist.push(i.value)
        });

        setQuery(query => ({ ...query, schools: schoollist }))

    }

    const usertypechange = async (input) => {
        let usertypes = []

        input.forEach(i => {
            usertypes.push(i.value)
        });

        setQuery(query => ({ ...query, types: usertypes }))
    }

    const search = async () => {
        //console.log(query)

        async function fullquery() {
            if (query !== null) {
                let resultList = []
                let searchstring = ""


                if (query.events != undefined) {
                    if (query.events.length != 0) {
                        for (let i = 0; i < query.events.length; i++) {
                            if (i > 0 && i < query.events.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.events[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.events[i]))
                            }
                        }
                        searchstring = searchstring.concat(" & ")
                    }
                }

                if (query.cities != undefined) {
                    if (query.cities.length != 0) {
                        console.log(query.cities)
                        for (let i = 0; i < query.cities.length; i++) {
                            if (i > 0 && i < query.cities.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.cities[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.cities[i]))
                            }
                        }
                        searchstring = searchstring.concat(" & ")
                    }
                }

                if (query.schools != undefined) {
                    if (query.schools.length != 0) {
                        for (let i = 0; i < query.schools.length; i++) {
                            if (i > 0 && i < query.schools.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.schools[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.schools[i]))
                            }
                        }
                        searchstring = searchstring.concat(" & ")
                    }
                }

                if (query.types != undefined) {
                    if (query.types.length != 0) {
                        for (let i = 0; i < query.types.length; i++) {
                            if (i > 0 && i < query.types.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.types[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.types[i]))
                            }
                        }
                        searchstring = searchstring.concat(" & ")
                    }
                }

                console.log('searchstring', searchstring.substring(0, searchstring.length - 3))

                const { data, error } = await supabase.rpc('fullsearch', { input: searchstring.substring(0, searchstring.length - 3) })

                console.log('querystring - ', searchstring.substring(0, searchstring.length - 3))

                if (data !== null) {
                    data.forEach(e => {
                        resultList.push(e)
                    })
                    setSchools(resultList)
                }

            }
        }
        fullquery()
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
                            <>
                                <img src={avatar_url} alt="Avatar" className="avatar image" />
                            </>
                        ) : (
                            <>
                                <div className="avatar no-image" />
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-col">
                    <div className="flex w-full h-10 justify-evenly grow px-3">

                        <div className="flex grow">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Event'} options={eventoptions} onChange={eventchange} />
                        </div>

                        <div className="flex grow">
                            <CreatableSelect isClearable isMulti styles={colourStyles} placeholder={'City'} options={cityoptions} onChange={citychange} />
                        </div>

                        <div className="flex grow">
                            <CreatableSelect isClearable isMulti styles={colourStyles} placeholder={'School'} onChange={schoolchange} />
                        </div>

                        <div className="flex grow">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Usertype'} options={usertypeoptions} onChange={usertypechange} />
                        </div>

                        <div className="flex bg-activeMenu rounded-xl text-fontSecondary w-10  h-10 mt-1 justify-center hover:cursor-pointer hover:bg-dropShadow" onClick={search}>
                            <img src="/img/query.svg" className="w-4" />
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

                                    {schools.map(school => (
                                        <>
                                            <div className="table-row mt-1 text-fontPrimary hover:bg-dropShadow hover:text-fontSecondary hover:cursor-pointer">
                                                <div className="table-cell text-current text-sm">{school.name}</div>
                                                <div className="table-cell text-current text-sm text-center">{school.city}</div>
                                                <div className="table-cell text-current text-sm text-center">{school.type}</div>
                                            </div>
                                        </>
                                    ))}


                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}
