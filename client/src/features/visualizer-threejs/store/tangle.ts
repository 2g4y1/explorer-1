import { Color } from "three";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ZOOM_DEFAULT, ANIMATION_TIME_SECONDS } from "../constants";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";
import { BlockId, SlotIndex } from "@iota/sdk-wasm-nova/web";

interface IPosition {
    x: number;
    y: number;
    z: number;
}

export interface IBlockInitPosition extends IPosition {
    duration: number;
}

export interface BlockState {
    id: string;
    color: Color;
}

interface Edge {
    fromBlockId: string;
    toBlockId: string;
}

interface EdgeEntry {
    fromPosition: number[];
    toPositions: [x: number, y: number, z: number][];
}

interface TangleState {
    // Queue for "add block" operation to the canvas
    blockQueue: BlockState[];
    addToBlockQueue: (newBlock: BlockState & { initPosition: IPosition; targetPosition: IPosition }) => void;
    removeFromBlockQueue: (blockIds: string[]) => void;

    edgeQueue: Edge[];
    addToEdgeQueue: (blockId: string, parents: string[]) => void;
    removeFromEdgeQueue: (edges: Edge[]) => void;

    colorQueue: Pick<BlockState, "id" | "color">[];
    addToColorQueue: (blockId: string, color: Color) => void;
    removeFromColorQueue: (blockIds: string[]) => void;

    // Map of blockId to index in Tangle 'InstancedMesh'
    blockIdToIndex: Map<string, number>;
    blockIdToEdges: Map<string, EdgeEntry>;
    blockIdToPosition: Map<string, [x: number, y: number, z: number]>;
    blockMetadata: Map<string, IFeedBlockData>;
    blockIdToAnimationPosition: Map<string, IBlockInitPosition>;

    indexToBlockId: string[];
    updateBlockIdToIndex: (blockId: string, index: number) => void;

    zoom: number;
    setZoom: (zoom: number) => void;

    bps: number;
    setBps: (bps: number) => void;

    clickedInstanceId: string | null;
    setClickedInstanceId: (instanceId: string | null) => void;

    updateBlockIdToAnimationPosition: (updatedPositions: Map<string, IBlockInitPosition>) => void;
    resetConfigState: () => void;

    // Confirmed/accepted blocks by slot
    confirmedBlocksBySlot: Map<number, string[]>;
    addToConfirmedBlocksBySlot: (blockId: BlockId, slot: SlotIndex) => void;
    removeConfirmedBlocksSlot: (slot: SlotIndex) => void;
}

const INITIAL_STATE = {
    blockQueue: [],
    edgeQueue: [],
    colorQueue: [],
    blockIdToEdges: new Map(),
    blockIdToIndex: new Map(),
    blockIdToPosition: new Map(),
    blockMetadata: new Map(),
    blockIdToAnimationPosition: new Map(),
    indexToBlockId: [],
    zoom: ZOOM_DEFAULT,
    bps: 0,
    clickedInstanceId: null,
    confirmedBlocksBySlot: new Map(),
};

export const useTangleStore = create<TangleState>()(
    devtools((set) => ({
        ...INITIAL_STATE,
        resetConfigState: () => set(INITIAL_STATE),
        updateBlockIdToAnimationPosition: (updatedPositions) => {
            set((state) => {
                updatedPositions.forEach((value, key) => {
                    state.blockIdToAnimationPosition.set(key, value);
                });

                for (const [key, value] of state.blockIdToAnimationPosition) {
                    if (value.duration > ANIMATION_TIME_SECONDS) {
                        state.blockIdToAnimationPosition.delete(key);
                    }
                }
                return {
                    blockIdToAnimationPosition: state.blockIdToAnimationPosition,
                };
            });
        },
        addToBlockQueue: (block) => {
            set((state) => {
                const { initPosition, targetPosition, ...blockRest } = block;

                state.blockIdToPosition.set(block.id, [targetPosition.x, targetPosition.y, targetPosition.z]);
                state.blockIdToAnimationPosition.set(block.id, {
                    ...initPosition,
                    duration: 0,
                });
                return {
                    ...state,
                    blockQueue: [...state.blockQueue, blockRest],
                };
            });
        },
        removeFromBlockQueue: (blockIds: string[]) => {
            if (!blockIds.length) return;
            set((state) => ({
                blockQueue: state.blockQueue.filter((b) => !blockIds.includes(b.id)),
            }));
        },
        addToEdgeQueue: (blockId: string, parents: string[]) => {
            if (parents.length > 0) {
                set((state) => {
                    const nextEdgesQueue = [...state.edgeQueue];

                    for (const parentBlockId of parents) {
                        nextEdgesQueue.push({ fromBlockId: parentBlockId, toBlockId: blockId });
                    }

                    return {
                        ...state,
                        edgeQueue: nextEdgesQueue,
                    };
                });
            }
        },
        removeFromEdgeQueue: (edgesToRemove: Edge[]) => {
            set((state) => ({
                ...state,
                edgeQueue: state.edgeQueue.filter(
                    (edge) =>
                        !edgesToRemove.some(
                            (edgeToRemove) => edgeToRemove.toBlockId === edge.toBlockId && edgeToRemove.fromBlockId === edge.fromBlockId,
                        ),
                ),
            }));
        },
        addToColorQueue: (id: string, color: Color) => {
            set((state) => ({
                ...state,
                colorQueue: [...state.colorQueue, { id, color }],
            }));
        },
        removeFromColorQueue: (blockIds) => {
            if (blockIds.length > 0) {
                set((state) => ({
                    ...state,
                    colorQueue: state.colorQueue.filter((block) => !blockIds.includes(block.id)),
                }));
            }
        },
        updateBlockIdToIndex: (blockId: string, index: number) => {
            set((state) => {
                state.blockIdToIndex.set(blockId, index);
                if (state.indexToBlockId[index]) {
                    // Clean up map from old blockIds
                    state.blockIdToIndex.delete(state.indexToBlockId[index]);
                    // Clean up old block edges
                    state.blockIdToEdges.delete(state.indexToBlockId[index]);
                    // Clean up old block position
                    state.blockIdToPosition.delete(state.indexToBlockId[index]);
                    // Clean up old block metadata
                    state.blockMetadata.delete(state.indexToBlockId[index]);
                }

                const nextIndexToBlockId = [...state.indexToBlockId];
                nextIndexToBlockId[index] = blockId;

                return {
                    ...state,
                    indexToBlockId: nextIndexToBlockId,
                };
            });
        },
        setZoom: (zoom) => {
            set((state) => ({
                ...state,
                zoom,
            }));
        },
        setBps: (bps) => {
            set((state) => ({
                ...state,
                bps,
            }));
        },
        setClickedInstanceId: (clickedInstanceId) => {
            set((state) => ({
                ...state,
                clickedInstanceId,
            }));
        },
        addToConfirmedBlocksBySlot: (blockId, slot) => {
            set((state) => {
                state.confirmedBlocksBySlot.has(slot)
                    ? state.confirmedBlocksBySlot.get(slot)?.push(blockId)
                    : state.confirmedBlocksBySlot.set(slot, [blockId]);
                return {
                    ...state,
                    confirmedBlocksBySlot: state.confirmedBlocksBySlot,
                };
            });
        },
        removeConfirmedBlocksSlot: (slot) => {
            set((state) => {
                state.confirmedBlocksBySlot.delete(slot);

                // Cleanup all slots that are lower than the current slot
                for (const existingSlot of state.confirmedBlocksBySlot.keys()) {
                    if (existingSlot < slot) {
                        state.confirmedBlocksBySlot.delete(existingSlot);
                    }
                }

                return {
                    ...state,
                    confirmedBlocksBySlot: state.confirmedBlocksBySlot,
                };
            });
        },
    })),
);
