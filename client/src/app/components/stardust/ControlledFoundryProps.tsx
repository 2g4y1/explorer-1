export interface ControlledFoundryProps {
    /**
     * Foundry Id.
     */
    foundryId: string;

    /**
     * Network
     */
    network: string;

    /**
     * True if the asset is rendered like a table
     */
    tableFormat?: boolean;
}
