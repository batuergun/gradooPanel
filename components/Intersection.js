import { React, useMemo, useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js'
import { asSets, generateCombinations, VennDiagram } from '@upsetjs/react';

export default function Intersection() {

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const [dataset, defineDataset] = useState([])

    useEffect(() => {
        let colorPalette = ['#73bbeb', '#ffc680']

        async function getEventData() {
            let events = []
            const { data } = await supabase.rpc('eventinfo')
            data.forEach(event => {
                let pointer = 0
                let eventsample = []
                if (events.at(-1) != undefined) { pointer = events.at(-1).elems.length + 1 }
                for (let i = 0; i < event.count; i++) { eventsample.push(i + pointer) }
                events.push({ name: event.name, elems: eventsample, color: colorPalette[data.indexOf(event)] })
            });

            const appendIntersection = async () => {
                const { data } = await supabase.rpc('intersection', { input: 'Learn & How & to & Learn', input2: 'gradoo & derece & atolyesi' })
                if (data != undefined) {
                    let pointer = events[0].elems.length + events[1].elems.length
                    events.forEach(event => {
                        event.elems.splice(0, data * 2)
                        for (let i = 0; i < data; i++) {
                            event.elems.push(i + pointer)
                        }
                    });
                }
            }
            await appendIntersection()

            defineDataset(events)
        }
        getEventData()
    }, [])

    const sets = asSets(dataset);

    const combinations = useMemo(() => generateCombinations(sets), [sets]);
    const [selection, setSelection] = useState(null);

    return (
        <>
            <VennDiagram
                sets={sets}
                combinations={combinations}
                width={480}
                height={300}
                selection={selection}
            //onHover={setSelection}
            />
        </>
    )
}

