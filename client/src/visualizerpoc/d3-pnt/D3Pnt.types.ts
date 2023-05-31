import React from "react";

export interface Node {
    blockId: string;
    parents: string[];
    properties: {
        tag: string;
    };
    payloadType: string;
}

export interface Link {
    sourceId: number;
    targetId: number;
}

export interface NetworkChartProps {
    nodes: Node[];
    links: Link[];
    coordinates: never;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}
