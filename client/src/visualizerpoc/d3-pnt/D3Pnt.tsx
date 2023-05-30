// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as d3 from "d3";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { getRandomNumber } from "../cytoscape/Cytoscape.component";
interface Node {
  blockId: string;
  parents: string[];
  properties: {
    tag: string;
  };
  payloadType: string;
}


export const D3Pnt = ({ network }: {network: string}) => {
  const graphElement = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState([]);
  // const [nodesCoordinates, setNodesCoordinates] = useState({});
  useEffect(() => {
    const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

    if (feedService &&
      graphElement.current
    ) {
      const onNewBlockData = (newBlock: IFeedBlockData) => {
        // @ts-expect-error bec
        setNodes(p => {
          const index = p.length;
          return [
...p, { ...newBlock, x: (index * 5),
            y: getRandomNumber(50, 350) }
];
        });
        // setNodesCoordinates();
        // console.log("---", newBlock);
        // if (graph.current) {
        //   const now = Date.now();
        //   lastUpdateTime.current = now;
        //   console.log("---", newBlock);
        //   const blockId = newBlock.blockId;
        //   const existingNode = graph.current.getNode(blockId);
        //
        //   if (!existingNode) {
        //     graph.current.addNode(blockId, {
        //       feedItem: newBlock,
        //       added: now
        //     });
        //
        //     existingIds.current.push(blockId);
        //
        //     if (newBlock.parents) {
        //       const addedParents: string[] = [];
        //       for (let i = 0; i < newBlock.parents.length; i++) {
        //         const parentId = newBlock.parents[i];
        //         if (!addedParents.includes(parentId)) {
        //           addedParents.push(parentId);
        //           if (!graph.current.getNode(parentId)) {
        //             graph.current.addNode(parentId);
        //             existingIds.current.push(parentId);
        //           }
        //
        //           graph.current.addLink(parentId, blockId);
        //         }
        //       }
        //     }
        //
        //     setItemCount(existingIds.current.length);
        //   }
        //
        //   checkLimit();
        // }
      };

      const onMetaDataUpdated = (updatedMetadata: { [id: string]: IFeedBlockMetadata }) => {
        // lastUpdateTime.current = Date.now();
        // if (graph.current) {
        //   const highlightRegEx = highlightNodesRegEx();
        //
        //   for (const blockId in updatedMetadata) {
        //     const node = graph.current.getNode(blockId);
        //     if (node) {
        //       if (node.data) {
        //         node.data.feedItem.metadata = {
        //           ...node.data.feedItem.metadata,
        //           ...updatedMetadata[blockId]
        //         };
        //       }
        //
        //       styleNode(node, testForHighlight(highlightRegEx, node.id, node.data));
        //     }
        //   }
        // }
      };

      feedService.subscribeBlocks(onNewBlockData, onMetaDataUpdated);
    }

    return () => {
      // eslint-disable-next-line no-void
      void feedService?.unsubscribeBlocks();
    };
  }, [network, graphElement.current]);

  return (<NetworkChart nodes={nodes} links={[]} canvasRef={graphElement} />);
};

interface Node {
  blockId: string;
  parents: string[];
  properties: {
    tag: string;
  };
  payloadType: string;
}

interface Link {
  source: number;
  target: number;
}

interface NetworkChartProps {
  nodes: Node[];
  links: Link[];
  canvasRef: React.RefObject<HTMLCanvasElement> | React.MutableRefObject<HTMLCanvasElement>;
}
// eslint-disable-next-line react/no-multi-comp
const NetworkChart: React.FC<NetworkChartProps> = ({ nodes: nodesBefore, links, canvasRef }) => {
  const nodes = useMemo(() => nodesBefore.map((i, index) => ({ ...i })), [nodesBefore]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;

    const bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    const bufferContext = bufferCanvas.getContext("2d")!;

    const width = canvas.width;
    const height = canvas.height;

    const simulation = {
      nodes,
      links,
      tick() {
        bufferContext.clearRect(0, 0, width, height);

        for (const link of links) {
          const { source, target } = link;
          const sourceNode = nodes[source];
          const targetNode = nodes[target];

          bufferContext.beginPath();
          bufferContext.moveTo(sourceNode.x, sourceNode.y);
          bufferContext.lineTo(targetNode.x, targetNode.y);
          bufferContext.strokeStyle = "black";
          bufferContext.lineWidth = 1;
          bufferContext.stroke();
        }

        for (const node of nodes) {
          bufferContext.beginPath();
          bufferContext.arc(node.x, node.y, 10, 0, 2 * Math.PI);
          bufferContext.fillStyle = "steelblue";
          bufferContext.fill();
        }

        context.clearRect(0, 0, width, height);
        context.drawImage(bufferCanvas, 0, 0);
      }
    };

    const simulationTick = () => {
      simulation.tick();
    };

    const tickInterval = setInterval(simulationTick, 16);

    return () => {
      clearInterval(tickInterval);
    };
  }, [nodes, links]);

  return <canvas ref={canvasRef} width={600} height={400} />;
};
