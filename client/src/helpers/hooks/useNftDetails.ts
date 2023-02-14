import {
    ED25519_ADDRESS_TYPE, ALIAS_ADDRESS_TYPE, HexEncodedString, IIssuerFeature,
    IMetadataFeature, INftOutput, ISSUER_FEATURE_TYPE, METADATA_FEATURE_TYPE, NFT_ADDRESS_TYPE
} from "@iota/iota.js-stardust";
import { Converter, HexHelper } from "@iota/util.js-stardust";
import * as jsonschema from "jsonschema";
import { useEffect, useState } from "react";
import nftSchemeIRC27 from "../../assets/schemas/nft-schema-IRC27.json";
import { ServiceFactory } from "../../factories/serviceFactory";
import { INftImmutableMetadata } from "../../models/api/stardust/nft/INftImmutableMetadata";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";


/**
 * Fetch nft output details
 * @param network The Network in context
 * @param nftId The nft id
 * @returns The output responses and loading bool.
 */
export function useNftDetails(network: string, nftId?: string):
    [
        INftOutput | undefined,
        INftImmutableMetadata | undefined,
        string | undefined,
        boolean
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [nftOutput, setNftOutput] = useState<INftOutput | undefined>();
    const [nftMetadata, setNftMetadata] = useState<INftImmutableMetadata | undefined>();
    const [nftIssuerId, setNftIssuerId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (nftId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.nftDetails({
                    network,
                    nftId: HexHelper.addPrefix(nftId)
                }).then(response => {
                    if (!response?.error) {
                        const output = response.nftDetails?.output as INftOutput;

                        const metadataFeature = output.immutableFeatures?.find(
                            feature => feature.type === METADATA_FEATURE_TYPE
                        ) as IMetadataFeature;
                        const immutableMetadata = tryParseNftMetadata(metadataFeature.data);
                        const issuerFeature = output.immutableFeatures?.find(
                            feature => feature.type === ISSUER_FEATURE_TYPE
                        ) as IIssuerFeature;

                        let issuerId;
                        switch (issuerFeature.address.type) {
                            case ED25519_ADDRESS_TYPE:
                                issuerId = issuerFeature.address.pubKeyHash;
                                break;
                            case ALIAS_ADDRESS_TYPE:
                                issuerId = issuerFeature.address.aliasId;
                                break;
                            case NFT_ADDRESS_TYPE:
                                issuerId = issuerFeature.address.nftId;
                                break;
                            default:
                                break;
                        }

                        setNftOutput(output);
                        setNftMetadata(immutableMetadata);
                        setNftIssuerId(issuerId);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, nftId]);

    /**
     * Tries to parse hex data into NFT immutable metadata (tip-27).
     * @param metadataHex The encoded data.
     * @returns The parsed INftImmutableMetadata or undefined.
     */
    function tryParseNftMetadata(metadataHex: HexEncodedString): INftImmutableMetadata | undefined {
        const validator = new jsonschema.Validator();
        try {
            const json: unknown = JSON.parse(Converter.hexToUtf8(metadataHex));
            const result = validator.validate(json, nftSchemeIRC27);

            if (result.valid) {
                return json as INftImmutableMetadata;
            }
        } catch { }
    }

    return [nftOutput, nftMetadata, nftIssuerId, isLoading];
}

