import React, { useEffect, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { ServiceFactory } from "../../factories/serviceFactory";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";


/**
 * @param min minimum number
 * @param max maximum number
 * @returns number
 */
export const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const Cytoscape = ({ network }: { network: string }) => {
    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);
    }, []);


    const data = useMemo(() =>
        Array.from({ length: 5000 })
            .map((i, index: number) => ({
                grabbable: false,
                data: {
                    id: index,
                    label: `Node ${index}`
                },
                position: {
                    x: (index * 5),
                    y: getRandomNumber(1, 400)
                }
            })), []);

    return (
        <CytoscapeComponent
            elements={[]}
            style={{
                height: 500,
                width: 1000
            }}
            autoungrabify={false}
        />
    );
};
