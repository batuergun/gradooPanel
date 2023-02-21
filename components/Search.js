import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import Sidebar from '../components/Sidebar'
import Datepicker from "react-tailwindcss-datepicker";

import { Bar } from "react-chartjs-2";
let graphoptions = { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Search(session) {
    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    const [query, setQuery] = useState({ events: [], cities: [], schools: [], types: [] })
    const [schools, setSchools] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const [renderDetail, setRenderDetail] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState({
        "school": "",
        "city": "",
        "count": 0
    })
    const [graphdata, setGraphData] = useState({
        labels: [],
        datasets: [],
    })

    const [dateValue, setDateValue] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const handleValueChange = (dateValue) => {
        setDateValue({
            startDate: dateValue.startDate,
            endDate: dateValue.endDate
        })
    }

    useEffect(() => {
        getProfile();
        if (selectedSchool != []) { getSchoolDetails() }

    }, [session, selectedSchool]);

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
        }),
        menuList: (provided, state) => ({
            ...provided,
            paddingTop: 0,
            paddingBottom: 0
        })
    };

    const eventoptions = [
        { value: 'lise üniversite diğer', label: 'All' },
        { value: 'Learn How to Learn', label: 'Learn How to Learn' },
        { value: 'Gradoo x Derece Atölyesi', label: 'Gradoo x Derece Atölyesi' },
        { value: 'SS v.2', label: 'Startup School v2' },
        { value: 'LinkedIn 101', label: 'LinkedIn 101' },
        { value: 'Sürdürülebilir Gelecek', label: 'Sürdürülebilir Gelecek!' },
        { value: 'TikTok Programı', label: 'TikTok Programı' },
        { value: 'Study Abroad', label: 'Study Abroad' },
    ]

    const cityoptions = [
        { value: 'Adana', label: 'Adana' }, { value: 'Adıyaman', label: 'Adıyaman' }, { value: 'Afyon', label: 'Afyon' }, { value: 'Ağrı', label: 'Ağrı' }, { value: 'Amasya', label: 'Amasya' },
        { value: 'Ankara', label: 'Ankara' }, { value: 'Antalya', label: 'Antalya' }, { value: 'Artvin', label: 'Artvin' }, { value: 'Aydın', label: 'Aydın' }, { value: 'Balıkesir', label: 'Balıkesir' },
        { value: 'Bilecik', label: 'Bilecik' }, { value: 'Bingöl', label: 'Bingöl' }, { value: 'Bitlis', label: 'Bitlis' }, { value: 'Bolu', label: 'Bolu' }, { value: 'Burdur', label: 'Burdur' },
        { value: 'Bursa', label: 'Bursa' }, { value: 'Çanakkale', label: 'Çanakkale' }, { value: 'Çankırı', label: 'Çankırı' }, { value: 'Çorum', label: 'Çorum' }, { value: 'Denizli', label: 'Denizli' },
        { value: 'Diyarbakır', label: 'Diyarbakır' }, { value: 'Edirne', label: 'Edirne' }, { value: 'Elâzığ', label: 'Elâzığ' }, { value: 'Erzincan', label: 'Erzincan' }, { value: 'Erzurum', label: 'Erzurum' },
        { value: 'Eskişehir', label: 'Eskişehir' }, { value: 'Gaziantep', label: 'Gaziantep' }, { value: 'Giresun', label: 'Giresun' }, { value: 'Gümüşhane', label: 'Gümüşhane' }, { value: 'Hakkâri', label: 'Hakkâri' },
        { value: 'Hatay', label: 'Hatay' }, { value: 'Isparta', label: 'Isparta' }, { value: 'Mersin', label: 'Mersin' }, { value: 'İstanbul', label: 'İstanbul' }, { value: 'İzmir', label: 'İzmir' },
        { value: 'Kars', label: 'Kars' }, { value: 'Kastamonu', label: 'Kastamonu' }, { value: 'Kayseri', label: 'Kayseri' }, { value: 'Kırklareli', label: 'Kırklareli' }, { value: 'Kırşehir', label: 'Kırşehir' },
        { value: 'Kocaeli', label: 'Kocaeli' }, { value: 'Konya', label: 'Konya' }, { value: 'Kütahya', label: 'Kütahya' }, { value: 'Malatya', label: 'Malatya' }, { value: 'Manisa', label: 'Manisa' },
        { value: 'Kahramanmaraş', label: 'Kahramanmaraş' }, { value: 'Mardin', label: 'Mardin' }, { value: 'Muğla', label: 'Muğla' }, { value: 'Muş', label: 'Muş' }, { value: 'Nevşehir', label: 'Nevşehir' },
        { value: 'Niğde', label: 'Niğde' }, { value: 'Ordu', label: 'Ordu' }, { value: 'Rize', label: 'Rize' }, { value: 'Sakarya', label: 'Sakarya' }, { value: 'Samsun', label: 'Samsun' },
        { value: 'Siirt', label: 'Siirt' }, { value: 'Sinop', label: 'Sinop' }, { value: 'Sivas', label: 'Sivas' }, { value: 'Tekirdağ', label: 'Tekirdağ' }, { value: 'Tokat', label: 'Tokat' },
        { value: 'Trabzon', label: 'Trabzon' }, { value: 'Tunceli', label: 'Tunceli' }, { value: 'Şanlıurfa', label: 'Şanlıurfa' }, { value: 'Uşak', label: 'Uşak' }, { value: 'Van', label: 'Van' },
        { value: 'Yozgat', label: 'Yozgat' }, { value: 'Zonguldak', label: 'Zonguldak' }, { value: 'Aksaray', label: 'Aksaray' }, { value: 'Bayburt', label: 'Bayburt' }, { value: 'Karaman', label: 'Karaman' },
        { value: 'Kırıkkale', label: 'Kırıkkale' }, { value: 'Batman', label: 'Batman' }, { value: 'Şırnak', label: 'Şırnak' }, { value: 'Bartın', label: 'Bartın' }, { value: 'Ardahan', label: 'Ardahan' },
        { value: 'Iğdır', label: 'Iğdır' }, { value: 'Yalova', label: 'Yalova' }, { value: 'Karabük', label: 'Karabük' }, { value: 'Kilis', label: 'Kilis' }, { value: 'Osmaniye', label: 'Osmaniye' }, { value: 'Düzce', label: 'Düzce' },
    ]

    const classoptions = [
        { value: 'Hazırlık & Lise', label: 'Hazırlık (Lise)' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
        { value: 'mezun & Lise', label: 'Mezun' },
        { value: 'Hazırlık & Üniversite', label: 'Hazırlık (Üniversite)' },
        { value: '1', label: '1. sınıf' },
        { value: '2', label: '2. sınıf' },
        { value: '3', label: '3. sınıf' },
        { value: '4', label: '4. sınıf' }
    ]

    const usertypeoptions = [
        { value: 'lise', label: 'High School' },
        { value: 'üniversite', label: 'University' },
        { value: 'diğer', label: 'Other' }
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

    const classchange = async (input) => {
        let classtypes = []

        input.forEach(i => {
            classtypes.push(i.value)
        });

        setQuery(query => ({ ...query, class: classtypes }))
    }

    function wordSplit(splitinput) {
        let returnstring = '( '
        if (JSON.stringify(splitinput2).indexOf(" ") >= 0) {

            let words = JSON.stringify(splitinput2).split(" ")
            words.forEach(w => {
                returnstring = returnstring.concat(JSON.stringify(w), ' |')
            });
            returnstring = returnstring.substring(0, returnstring.length - 1, ')')

        }
        return returnstring
    }

    const search = async () => {
        //console.log(query)

        async function fullquery() {
            if (query !== null) {
                let resultList = []
                let searchstring = ""

                if (query.types != undefined) {
                    if (query.types.length != 0) {
                        searchstring = searchstring.concat("( ")
                        for (let i = 0; i < query.types.length; i++) {
                            if (i > 0 && i < query.types.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.types[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.types[i]))
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.events != undefined) {
                    if (query.events.length != 0) {
                        searchstring = searchstring.concat("(")
                        for (let i = 0; i < query.events.length; i++) {
                            if (i > 0 && i < query.events.length + 1) {
                                let splitted = ''
                                if (JSON.stringify(query.events[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.events[i]).replaceAll(' ', ' | ')
                                    searchstring = searchstring.concat(' | ', splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.events[i])) }
                            } else {
                                let splitted = ''
                                if (JSON.stringify(query.events[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.events[i]).replaceAll(' ', ' | ')
                                    searchstring = searchstring.concat(splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.events[i])) }
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.cities != undefined) {
                    if (query.cities.length != 0) {
                        searchstring = searchstring.concat("( ")
                        for (let i = 0; i < query.cities.length; i++) {
                            if (i > 0 && i < query.cities.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.cities[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.cities[i]))
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.class != undefined) {
                    if (query.class.length != 0) {
                        searchstring = searchstring.concat("( ")
                        for (let i = 0; i < query.class.length; i++) {
                            if (i > 0 && i < query.class.length + 1) {
                                searchstring = searchstring.concat(' | ', JSON.stringify(query.class[i]))
                            } else {
                                searchstring = searchstring.concat(JSON.stringify(query.class[i]))
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }

                if (query.schools != undefined) {
                    if (query.schools.length != 0) {
                        searchstring = searchstring.concat("(")
                        for (let i = 0; i < query.schools.length; i++) {
                            if (i > 0 && i < query.schools.length + 1) {
                                let splitted = ''
                                if (JSON.stringify(query.schools[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.schools[i]).replaceAll(' ', ' & ')
                                    searchstring = searchstring.concat(' & ', splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.schools[i])) }
                            } else {
                                let splitted = ''
                                if (JSON.stringify(query.schools[i]).includes(' ')) {
                                    splitted = JSON.stringify(query.schools[i]).replaceAll(' ', ' & ')
                                    searchstring = searchstring.concat(splitted)
                                } else { searchstring = searchstring.concat(JSON.stringify(query.schools[i])) }
                            }
                        }
                        searchstring = searchstring.concat(" ) & ")
                    }
                }


                const { data, error } = await supabase.rpc('renderschoollist_by_time', { input: searchstring.substring(0, searchstring.length - 3), from_input: dateValue.startDate, until_input: dateValue.endDate })
                console.log(data)

                console.log('querystring - ', searchstring.substring(0, searchstring.length - 3))
                setSearchQuery(searchstring.substring(0, searchstring.length - 3))

                if (data !== null) {
                    data.forEach(e => {
                        if (e.school !== ' ') {
                            resultList.push(e)
                        }
                    })
                    setSchools(resultList)
                }

            }
        }
        fullquery()
    }

    const setSchool = props => {
        console.log(props)
        setRenderDetail(true)
        setSelectedSchool(props)
    }

    const getSchoolDetails = async () => {
        // let schoolDetailQuery = '(' + selectedSchool.sid + ' & ' + searchQuery.substring(1)
        let { data, error } = await supabase
            .rpc('classinfo_by_school', {
                from_input: dateValue.startDate,
                schoolqueryinput: searchQuery,
                schoolname: selectedSchool.school,
                until_input: dateValue.endDate
            })

        let schoolUsertype
        if (data != null && data.length > 0) { schoolUsertype = data[0].usertype }

        let highschoollist = { 9: 0, 10: 0, 11: 0, 12: 0, 'mezun': 0, 'hazirlik': 0 }
        let universitylist = { 1: 0, 2: 0, 3: 0, 4: 0, 'hazirlik': 0 }

        if (data != null) {
            data.forEach(row => {
                if (schoolUsertype === 'Üniversite') {
                    switch (row.class) {
                        case "1. sınıf": universitylist['1'] = row.count; break;
                        case "2. sınıf": universitylist['2'] = row.count; break;
                        case "3. sınıf": universitylist['3'] = row.count; break;
                        case "4. sınıf": universitylist['4'] = row.count; break;
                        case "Hazırlık": universitylist['hazirlik'] = row.count; break;
                        default: break;
                    }
                } else if (schoolUsertype === "Lise") {
                    switch (row.class) {
                        case "9": highschoollist['9'] = row.count; break;
                        case "10": highschoollist['10'] = row.count; break;
                        case "11": highschoollist['11'] = row.count; break;
                        case "12": highschoollist['12'] = row.count; break;
                        case "Mezun": highschoollist['mezun'] = row.count; break;
                        case "Hazırlık": highschoollist['hazirlik'] = row.count; break;
                        default: break;
                    }
                }
            });
        }

        if (schoolUsertype === "Lise") {
            setGraphData({
                labels: ['9', '10', '11', '12', 'Mezun', 'Hazirlik'],
                datasets: [
                    {
                        label: 'High School',
                        data: [highschoollist['9'], highschoollist['10'], highschoollist['11'], highschoollist['12'], highschoollist['mezun'], highschoollist['hazirlik']],
                        backgroundColor: [
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(255, 159, 64, 0.2)",
                            "rgba(255, 206, 86, 0.2)",
                        ],
                        borderColor: [
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 159, 64, 1)",
                            "rgba(255, 206, 86, 1)",
                        ],
                        borderWidth: 1,
                    }
                ],
            })
        } else if (schoolUsertype === "Üniversite") {
            setGraphData({
                labels: ['1', '2', '3', '4', 'Hazirlik'],
                datasets: [
                    {
                        label: 'University',
                        data: [universitylist['1'], universitylist['2'], universitylist['3'], universitylist['4'], universitylist['hazirlik']],
                        backgroundColor: [
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(255, 159, 64, 0.2)",
                            "rgba(255, 206, 86, 0.2)",
                        ],
                        borderColor: [
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 159, 64, 1)",
                            "rgba(255, 206, 86, 1)",
                        ],
                        borderWidth: 1,
                    }
                ],
            })
        }
    }

    function renderDetails() {
        return <>
            <div className="absolute left-0 top-0 backdrop-blur-sm w-full h-full z-50 flex justify-center items-center">
                <div className="relative bg-backgroundPrimary rounded-md basis-[90%] h-[90%] p-7 border-active-menu border-2 drop-shadow-lg">
                    <h2 className="absolute top-0 right-0 mt-3 mr-5 text-primary font-black text-base hover:underline hover:cursor-pointer" onClick={() => { setRenderDetail(false) }}>X</h2>

                    <h2 className="text-inherit font-bold text-2xl">{selectedSchool.school} - {selectedSchool.city}</h2>
                    <h2 className="text-inherit font-light text-base pt-1">{selectedSchool.count} application</h2>

                    <div className="h-96 p-5 mt-12 bg-cardBackground rounded-md ">
                        <Bar options={graphoptions} data={graphdata} />
                    </div>

                </div>
            </div>
        </>
    }

    return (
        <>
            {renderDetail ? <>{renderDetails()}</> : <></>}

            <Sidebar activeMenu={'Search'} />
            <div className="container">
                <div className="header">
                    <div className="title">
                        <img src="/img/summary2.svg" />
                        <h2 className="flex items-center text-lg font-medium">Search</h2>
                    </div>
                    <div className="profile" onClick={() => router.push({ pathname: "/account" })}>
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



                <div className="px-8 text-[.5rem]">
                    <Datepicker value={dateValue} onChange={handleValueChange} showShortcuts={true} showFooter={true} inputClassName="rounded-xl text-[.5rem]" />
                </div>

                <div className="flex-col">
                    <div className="flex h-8 justify-evenly px-7 mt-4 text-sm items-center">

                        <div className="flex grow basis-14">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Event'} options={eventoptions} onChange={eventchange} />
                        </div>

                        <div className="flex grow basis-10">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'City'} options={cityoptions} onChange={citychange} />
                        </div>

                        <div className="flex grow basis-10">
                            <CreatableSelect isClearable isMulti styles={colourStyles} placeholder={'School'} onChange={schoolchange} />
                        </div>

                        <div className="flex grow basis-10">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Usertype'} options={usertypeoptions} onChange={usertypechange} />
                        </div>

                        <div className="flex grow basis-10">
                            <Select isClearable isMulti styles={colourStyles} placeholder={'Class'} options={classoptions} onChange={classchange} />
                        </div>

                        <div className="flex bg-activeMenu rounded-xl text-fontSecondary w-8 h-8 justify-center hover:cursor-pointer hover:bg-dropShadow" onClick={search}>
                            <img src="/img/query.svg" className="w-4" />
                        </div>

                    </div>

                    <div className="flex mt-2 p-8">
                        <div className="flex bg-cardBackground p-4 text-fontPrimary rounded-xl">
                            <p className="text-current font-semibold">{schools.length}</p>
                            <p className="text-current ml-1"> result(s) found.</p>
                        </div>
                    </div>

                    <div className="flex px-8">
                        <div className="p-2 bg-cardBackground w-full h-[50vh] rounded-2xl overflow-auto">
                            <div className="table w-full">

                                <div className="table-header-group">
                                    <div className="table-row">
                                        <p className="table-cell text-fontPrimary text-base">School</p>
                                        <p className="table-cell text-fontPrimary text-base text-center">Applications</p>
                                        <p className="table-cell text-fontPrimary text-base text-center">City</p>
                                    </div>
                                </div>

                                <div class="table-row-group">

                                    {schools.map(school => (
                                        <>
                                            <div className="table-row mt-1 text-fontPrimary hover:bg-dropShadow hover:text-fontSecondary hover:cursor-pointer" onClick={() => { setSchool(school) }}>
                                                <div className="table-cell text-current text-sm">{school.school}</div>
                                                <div className="table-cell text-current text-sm text-center">{school.count}</div>
                                                <div className="table-cell text-current text-sm text-center">{school.city}</div>
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
