import { React, useMemo, useState } from "react";
import { asSets, generateCombinations, VennDiagram } from '@upsetjs/react';

export default function Intersection() {

    const elems = Array(1000).fill(0).map((_, i) => ({ name: i.toString(), value: Math.random() }));

    const data = [
        { name: 'S1', elems: [100, 200] },
        { name: 'S2', elems: [200, 300, 400] },
    ];
    const sets = asSets(data);

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

