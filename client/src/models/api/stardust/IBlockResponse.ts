import { IBlock } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block: IBlock;
}

