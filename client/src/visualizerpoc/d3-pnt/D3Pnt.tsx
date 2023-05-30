// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as d3 from "d3";
import React, { useState, useEffect, useRef } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";

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
  useEffect(() => {
    const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

    if (feedService &&
      graphElement.current
    ) {
      const onNewBlockData = (newBlock: IFeedBlockData) => {
        // @ts-expect-error bec
        setNodes(p => ([...p, newBlock]));
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

  return (<canvas ref={graphElement} width={600} height={400} />);
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
const NetworkChart: React.FC<NetworkChartProps> = ({ links, canvasRef }) => {
  const nodes = [
    {
      "blockId": "0x7fb00839b23a6b3d4aee12bc0a4a58a4549a20a3866d625a4fbea7684ae7b6fb",
      "parents": [
        "0x69a4c66188a38d91f9728c10204368dcbddc30f103c91316a729b4b8eb770583",
        "0x72629fc952c8749bbf6128e44d6ce5f5fa6610338643fad8a33690eb519d6e99",
        "0xc6dd6a4a8f86decc7bf9b9768458d330a3e87e4de18ac17514542262b36db8be",
        "0xcf07b443729ad62b4cf28ccd80f0379fa27d7df52b8143af404c625bd15d4b51"
      ],
      "properties": {
        "tag": "0x484f524e4554205370616d6d6572"
      },
      "payloadType": "TaggedData",
      x: 0,
      y: 0
    }
];

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const context = canvas.getContext("2d")!;

    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);

    const simulation = {
      nodes,
      links,
      tick() {
        // context.clearRect(0, 0, width, height);

        for (const link of links) {
          const { source, target } = link;
          const sourceNode = nodes[source];
          const targetNode = nodes[target];

          context.beginPath();
          // @ts-expect-error base
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          context.moveTo(sourceNode.x, sourceNode.y);
          // @ts-expect-error base
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          context.lineTo(targetNode.x, targetNode.y);
          context.strokeStyle = "black";
          context.lineWidth = 1;
          context.stroke();
        }

        for (const node of nodes) {
          context.beginPath();
          // @ts-expect-error base
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          context.arc(node.x, node.y, 10, 0, 2 * Math.PI);
          context.fillStyle = "steelblue";
          context.fill();
        }
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
