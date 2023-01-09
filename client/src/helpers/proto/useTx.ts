import { ITransactionResponse } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = ITransactionResponse | null | undefined;

// eslint-disable-next-line jsdoc/require-returns
/**
 *
 * @param network
 * @param txId
 */
export function useTx(network: string, txId: string): [Result, boolean] {
    const [tx, setTx] = useState<ITransactionResponse | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const fetchedTx = await apiClient.transaction({ network, txId });
                if (fetchedTx.error || fetchedTx.tx === undefined) {
                    throw new Error(fetchedTx.error);
                }
                setTx(fetchedTx.tx);
            } catch {
                setTx(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [txId]);

    return [tx, isLoading];
}
