import { React, useMemo, useState } from "react";
import { extractSets, generateCombinations, VennDiagram } from '@upsetjs/react';

export default function Intersection() {

    const elems = useMemo(
        () => [
            { name: 'A', sets: ['S1', 'S2'] },
            { name: 'B', sets: ['S1'] },
            { name: 'C', sets: ['S2'] },
            { name: 'D', sets: ['S1', 'S3'] },
        ],
        []
    );

    const sets = useMemo(() => extractSets(elems), [elems]);
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
                onHover={setSelection}
            />
        </>
    )
}

