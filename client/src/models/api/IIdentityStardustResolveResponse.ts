export interface IIdentityStardustResolveResponse {
    /**
     * The resolved DID Document.
     */
    document?: {
        doc: unknown;
        meta: {
          governorAddress: string;
          stateControllerAddress: string;
        };
      };

    /**
     * Error message if resolution failed.
     */
    error?: string;

    /**
     * Governor of Alias Output.
     */
    governorAddress?: string;

    /**
     * State controller of Alias Output.
     */
    stateControllerAddress?: string;
}
