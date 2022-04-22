import { IMessage, IMessageMetadata, IUTXOInput, OutputTypes } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import { MessageTangleStatus } from "../../../models/messageTangleStatus";

export interface MessageState {
    /**
     * The message id that was the parameter.
     */
    paramMessageId?: string;

    /**
     * The actual message Id in the case of an included message.
     */
    actualMessageId?: string;

    /**
     * Message.
     */
    message?: IMessage;

    /**
     * Metadata.
     */
    metadata?: IMessageMetadata;

    /**
     * The metadata failed.
     */
    metadataError?: string;

    /**
     * Reason for the conflict.
     */
    conflictReason?: string;

    /**
     * Are we busy loading the children.
     */
    childrenBusy: boolean;

    /**
     * The children ids.
     */
    childrenIds?: string[];

    /**
     * The state of the message on the tangle.
     */
    messageTangleStatus: MessageTangleStatus;

    /**
     * Display advanced mode.
     */
    advancedMode: boolean;

    /**
     * The unlock addresses for the transactions.
     */
    inputs?: (IUTXOInput & {
        outputHash: string;
        isGenesis: boolean;
        transactionUrl: string;
        transactionAddress: IBech32AddressDetails;
        signature: string;
        publicKey: string;
        amount: number;
    })[];

    /**
     * The outputs.
     */
    outputs?: {
        index: number;
        type: number;
        id?: string;
        output: OutputTypes;
        amount: number;
    }[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal?: number;

    /**
     * The unlock addresses for the transactions.
     */
    unlockAddresses?: IBech32AddressDetails[];
}
