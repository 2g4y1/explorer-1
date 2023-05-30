import React, { useEffect, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { ServiceFactory } from "../../factories/serviceFactory";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";


/**
 * @param min minimum number
 * @param max maximum number
 * @returns number
 */
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const Cytoscape = ({ network }: {network: string}) => {
  useEffect(() => {
    return;
    const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);
  }, []);


  const data = useMemo(() => Array.from({ length: 5000 })
    .map((i, index: number) => ({ grabbable: false,
      data: {
        id: index,
        label: `Node ${index}`
      },
      position: {
        x: (index * 5),
        y: getRandomNumber(1, 400)
      } })), []);

  return (<CytoscapeComponent
      style={{
      height: 500,
      width: 1000
    }}
    // @ts-expect-error because
      elements={[
    ...data
    // { data: { id: "two", label: "Node 2" }, position: { x: 150, y: 300 } },
    // { data: { source: "one", target: "two", label: "Edge from Node1 to Node2" } }
  ]}
      autoungrabify={false}
          />);
};
