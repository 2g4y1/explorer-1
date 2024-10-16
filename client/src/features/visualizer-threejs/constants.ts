import { BlockState } from "@iota/sdk-wasm-nova/web";
import { Color } from "three";
import { ThemeMode } from "./enums";

// steps
export const BLOCK_STEP_PX = 10;
export const STEP_CAMERA_SHIFT_PX = 100;

export const MAX_BLOCK_INSTANCES = 5000;

// nodes
export const NODE_SIZE_DEFAULT = 10;
export const NODE_SIZE_INCREMENT = 3;

// zoom
export const ZOOM_DEFAULT = 2;

// timers
export const TIME_DIFF_COUNTER = 250;
export const SECOND = 1000;
export const DATA_SENDER_TIME_INTERVAL = 500;
export const ANIMATION_TIME_SECONDS = 3;

// colors
export const PENDING_BLOCK_COLOR = new Color("#A6C3FC");
export const ACCEPTED_BLOCK_COLOR = new Color("#0101AB");
export const CONFIRMED_BLOCK_COLOR = new Color("#0000DB");
export const FINALIZED_BLOCK_COLOR = new Color("#0101FF");
// TODO Remove accepted state once is added to the SDK (missing)
export const BLOCK_STATE_TO_COLOR = new Map<BlockState | "accepted", Color>([
    ["pending", PENDING_BLOCK_COLOR],
    ["accepted", ACCEPTED_BLOCK_COLOR],
    ["confirmed", CONFIRMED_BLOCK_COLOR],
    ["finalized", FINALIZED_BLOCK_COLOR],
]);

// emitter
export const EMITTER_SPEED_MULTIPLIER = 80;
export const EMITTER_PADDING_RIGHT = 150;
export const VISUALIZER_SAFE_ZONE = 150;

// camera
export const CAMERA_X_AXIS_MOVEMENT = 0.005;
export const CAMERA_Y_AXIS_MOVEMENT = 0.065;
export const CAMERA_X_OFFSET = 0;
export const CAMERA_Y_OFFSET = 0.5;

export const FAR_PLANE = 15000;
export const NEAR_PLANE = 1;

export const VISUALIZER_PADDINGS = {
    paddingLeft: VISUALIZER_SAFE_ZONE,
    paddingRight: VISUALIZER_SAFE_ZONE,
    paddingBottom: VISUALIZER_SAFE_ZONE,
    paddingTop: VISUALIZER_SAFE_ZONE,
};

// time
export const MILLISECONDS_PER_SECOND = 1000;

// visualizer
export const DIRECTIONAL_LIGHT_INTENSITY = 0.45;

export const VISUALIZER_BACKGROUND: Record<ThemeMode, string> = {
    [ThemeMode.Dark]: "#000000",
    [ThemeMode.Light]: "#f2f2f2",
};

// emitter
export const EMITTER_WIDTH = 30;
export const EMITTER_HEIGHT = 250;
export const EMITTER_DEPTH = 250;

// conic emitter

export const MIN_TANGLE_RADIUS = 100;
export const MAX_TANGLE_RADIUS = 300;

export const MIN_BLOCKS_PER_SECOND = 100;
export const MAX_BLOCKS_PER_SECOND = 250;

export const MIN_BLOCK_NEAR_RADIUS = 20;

export const MAX_POINT_RETRIES = 10;
export const MAX_PREV_POINTS = 20;

export const EMITTER_X_POSITION_MULTIPLIER = 3;

export const MAX_SINUSOIDAL_AMPLITUDE = 200;
export const SINUSOIDAL_AMPLITUDE_ACCUMULATOR = 30;
export const INITIAL_SINUSOIDAL_AMPLITUDE = 80;
export const HALF_WAVE_PERIOD_SECONDS = 5;
