/* eslint-disable no-shadow */
import { IAliasOutput } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";

export interface AliasState {
    /**
     * The addres in bech 32 format.
     */
    bech32AddressDetails?: IBech32AddressDetails;

    /**
     * The storage rent balance.
     */
    storageRentBalance?: number;

    /**
     * List of foundries controlled by the alias.
     */
    foundries?: { foundryId: string }[];

    /**
     * Current page number of controlled Foundries.
     */
    foundriesPageNumber: number;

    /**
     * The Alias output.
     */
    aliasOutput?: IAliasOutput;

    /**
     * Error fetching alias output.
     */
    aliasError?: string;

    /**
     * Hex form of state metadata.
     */
    stateMetadataHex?: string;

    /**
     * Format storage rent balance in full.
     */
    isFormatStorageRentFull: boolean;
}

