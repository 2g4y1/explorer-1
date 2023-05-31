// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as d3 from "d3";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { getRandomNumber } from "../cytoscape/Cytoscape.component";
import { NetworkChartProps } from "./D3Pnt.types";


const initialState = {
    nodes: [],
    nodesCoordinates: {}
};

export const D3Pnt = ({ network }: { network: string }) => {
    const graphElement = useRef<HTMLCanvasElement>(null);
    const [state, setState] = useState(initialState);

    const onNewBlockData = (newBlock: IFeedBlockData) => {
        setState(prevState => {
            const newNode = {
                ...newBlock,
                x: prevState.nodes.length * 5,
                y: getRandomNumber(50, 350)
            };

            const updatedNodes = [...prevState.nodes, newNode];
            const updatedNodesCoordinates = {
                ...prevState.nodesCoordinates,
                [newNode.blockId]: {
                    x: newNode.x,
                    y: newNode.y


                }
            };

            return {
                nodes: updatedNodes,
                nodesCoordinates: updatedNodesCoordinates
            };
        });

        // // @ts-expect-error bec
        // setNodes(prevNodes =>
        //   // const newNode = {
        //   //   ...newBlock,
        //   //   x: prevNodes.length * 5,
        //   //   y: getRandomNumber(50, 350),
        //   // };
        //   [...prevNodes, newBlock]
        // );
        //
        // setNodesCoordinates(prevCoordinates => ({
        //   ...prevCoordinates,
        //   [newBlock.blockId]: {
        //     x: prevNodes.length * 5,
        //     y: getRandomNumber(50, 350)
        //   }
        // }));

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

    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

        if (feedService && graphElement.current) {
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

    const links = useMemo(() => {
        const resLinks = [];
        for (const node of state.nodes) {
            if (node.parents) {
                for (const parent of node.parents) {
                    resLinks.push({
                        sourceId: node.blockId,
                        targetId: parent
                    });
                }
            }
        }
        return resLinks;
    }, [state.nodes]);

    return (
        <NetworkChart
            nodes={state.nodes}
            links={links}
            coordinates={state.nodesCoordinates}
            canvasRef={graphElement}
        />);
};


// eslint-disable-next-line react/no-multi-comp
const NetworkChart: React.FC<NetworkChartProps> = ({
    nodes: nodesBefore,
    links,
    coordinates,
    canvasRef
}) => {
    const nodes = useMemo(() => nodesBefore.map((i, index) => ({ ...i })), [nodesBefore]);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) {
            return;
        }

        const canvas = d3.select(canvasRef.current);

        // Set the width and height of the canvas
        const width = 600;
        const height = 400;
        canvas.attr("width", width).attr("height", height);

        // Get the canvas context for drawing
        const context = canvas.node().getContext("2d");

        const bufferCanvas = document.createElement("canvas");
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
        const bufferContext = bufferCanvas.getContext("2d");


        const simulation = {
            nodes,
            links,
            tick() {
                bufferContext.clearRect(0, 0, width, height);

                for (const link of links) {
                    const {
                        sourceId,
                        targetId
                    } = link;

                    const sourceNode = coordinates[sourceId];
                    const targetNode = coordinates[targetId];

                    if (!sourceNode || !targetNode) {
                        continue;
                    }

                    bufferContext.beginPath();
                    bufferContext.moveTo(sourceNode.x, sourceNode.y);
                    bufferContext.lineTo(targetNode.x, targetNode.y);
                    bufferContext.strokeStyle = "black";
                    bufferContext.lineWidth = 1;
                    bufferContext.stroke();
                }

                for (const node of nodes) {
                    bufferContext.beginPath();
                    const nodeCoordinates = coordinates[node.blockId];
                    bufferContext.arc(nodeCoordinates.x, nodeCoordinates.y, 5, 0, 2 * Math.PI);
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

    return (
        <div>
            <canvas
                ref={canvasRef}
            />
        </div>
    );
};
