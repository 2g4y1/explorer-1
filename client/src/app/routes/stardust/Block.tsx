/* eslint-disable @typescript-eslint/no-shadow */
import {
    MILESTONE_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE,
    TAGGED_DATA_PAYLOAD_TYPE, milestoneIdFromMilestonePayload
} from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "../../../models/tangleStatus";
import { SettingsService } from "../../../services/settingsService";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import BlockMetadataSection from "../../components/stardust/BlockMetadataSection";
import BlockPayloadSection from "../../components/stardust/BlockPayloadSection";
import BlockTangleState from "../../components/stardust/BlockTangleState";
import Switcher from "../../components/Switcher";
import NetworkContext from "../../context/NetworkContext";
import mainHeaderMessage from "./../../../assets/modals/stardust/block/main-header.json";
import { TransactionsHelper } from "./../../../helpers/stardust/transactionsHelper";
import { BlockProps } from "./BlockProps";
import { BlockData, BlockMetadata } from "./BlockState";
import "./Block.scss";

const Block: React.FC<RouteComponentProps<BlockProps>> = (
    { history, match: { params: { network, blockId } } }
) => {
    const isMounted = useRef(false);
    const { tokenInfo, bech32Hrp, protocolVersion } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [settingsService] = useState(ServiceFactory.get<SettingsService>("settings"));
    const [advancedMode, setAdvancedMode] = useState<boolean>(false);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);
    const [jobToStatus, setJobToStatus] = useState(new Map<string, PromiseStatus>());
    const [updateMetadataTimerId, setUpdateMetadataTimerId] = useState<NodeJS.Timer | undefined>();
    const [blockData, setBlockData] = useState<BlockData>({});
    const [blockMetadata, setBlockMetadata] = useState<BlockMetadata>({ blockTangleStatus: "pending" });

    useEffect(() => {
        isMounted.current = true;
        setAdvancedMode(settingsService.get().advancedMode ?? false);

        return () => {
            isMounted.current = false;
            if (updateMetadataTimerId) {
                clearTimeout(updateMetadataTimerId);
            }
        };
    }, []);

    useEffect(() => {
        if (advancedMode !== settingsService.get().advancedMode) {
            settingsService.saveSingle("advancedMode", advancedMode);
        }
    }, [advancedMode]);


    useEffect(() => {
        setBlockData({});
        setBlockMetadata({ blockTangleStatus: "pending" });
        // eslint-disable-next-line no-void
        void loadBlock(blockId);
    }, [blockId]);

    useEffect(() => {
        if (!blockData.blockError) {
            // eslint-disable-next-line no-void
            void updateBlockDetails();
        }
    }, [blockData]);

    /**
     * Load the block with the given id.
     * @param blockId The index to load.
     */
    const loadBlock = async (blockId: string): Promise<void> => {
        const blockLoadMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set("loadBlock", status));
        });

        // eslint-disable-next-line no-void
        void blockLoadMonitor.enqueue(
            async () => tangleCacheService.block(network, blockId).then(
                async response => {
                    if (response.block) {
                        let transactionId;
                        const block = response.block;
                        const { inputs, unlocks, outputs, transferTotal } =
                            await TransactionsHelper.getInputsAndOutputs(
                                block,
                                network,
                                bech32Hrp,
                                tangleCacheService
                            );

                        if (block.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                            transactionId = TransactionsHelper.computeTransactionIdFromTransactionPayload(
                                block.payload
                            );
                        }

                        if (isMounted.current) {
                            setBlockData(
                                {
                                    block,
                                    inputs,
                                    unlocks,
                                    outputs,
                                    transferTotal,
                                    transactionId
                                }
                            );
                        }
                    } else if (isMounted.current) {
                        setBlockData({ blockError: response.error ?? "Couldn't load block" });
                    }
                }
            )
        );
    };

    /**
     * Update the block details.
     */
    const updateBlockDetails = async (): Promise<void> => {
        const blockDetailsLoadMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set("loadBlockDetails", status));
        });

        // eslint-disable-next-line no-void
        void blockDetailsLoadMonitor.enqueue(
            async () => tangleCacheService.blockDetails(network, blockId).then(
                details => {
                    if (isMounted.current) {
                        setBlockMetadata({
                            metadata: details?.metadata,
                            metadataError: details?.error,
                            conflictReason: calculateConflictReason(details?.metadata),
                            blockTangleStatus: calculateStatus(details?.metadata)
                        });

                        // requeue job until block is referenced
                        if (!details?.metadata?.referencedByMilestoneIndex) {
                            setUpdateMetadataTimerId(
                                setTimeout(async () => {
                                    await updateBlockDetails();
                                }, 10000)
                            );
                        }
                    }
                }
            )
        );
    };

    const { block, blockError, transactionId, inputs, unlocks, outputs, transferTotal } = blockData;
    const { metadata, metadataError, conflictReason, blockTangleStatus } = blockMetadata;

    const isMarketed = isMarketedNetwork(network);
    const isLinksDisabled = metadata?.ledgerInclusionState === "conflicting";
    const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);
    const milestoneId = block?.payload?.type === MILESTONE_PAYLOAD_TYPE ?
        milestoneIdFromMilestonePayload(block.payload) : undefined;

    if (blockError) {
        return (
            <div className="block">
                <div className="wrapper">
                    <div className="inner">
                        <div className="block--header">
                            <div className="row middle">
                                <h1>
                                    Block
                                </h1>
                                <Modal icon="info" data={mainHeaderMessage} />
                            </div>
                        </div>
                        <NotFound
                            searchTarget="block"
                            query={blockId}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const blockContent = !block ? null : (
        <React.Fragment>
            <div className="section--header row row--tablet-responsive middle space-between">
                <div className="row middle">
                    <h2>General</h2>
                </div>
                <BlockTangleState
                    network={network}
                    status={blockTangleStatus}
                    milestoneIndex={metadata?.referencedByMilestoneIndex ?? metadata?.milestoneIndex}
                    hasConflicts={isLinksDisabled}
                    conflictReason={conflictReason}
                    onClick={metadata?.referencedByMilestoneIndex
                        ? (blockId: string) => history.push(`/${network}/block/${blockId}`)
                        : undefined}
                />
            </div>
            <div className="section--data">
                <div className="label">
                    Block ID
                </div>
                <div className="value code row middle">
                    <span className="margin-r-t">
                        {blockId}
                    </span>
                    <CopyButton copy={blockId} />
                </div>
            </div>
            {milestoneId && (
                <div className="section--data">
                    <div className="label">
                        Milestone ID
                    </div>
                    <div className="value code row middle">
                        <span className="margin-r-t">
                            {milestoneId}
                        </span>
                        <CopyButton copy={milestoneId} />
                    </div>
                </div>
            )}
            {transactionId && (
                <div className="section--data">
                    <div className="label">
                        Transaction Id
                    </div>
                    <div className="value value__secondary row middle link">
                        {isLinksDisabled ?
                            <span className="margin-r-t">
                                {transactionId}
                            </span> :
                            <Link
                                to={`/${network}/transaction/${transactionId}`}
                                className="margin-r-t"
                            >
                                {transactionId}
                            </Link>}
                        <CopyButton copy={transactionId} />
                    </div>
                </div>
            )}
            <div className="section--data">
                <div className="label">
                    Payload Type
                </div>
                <div className="value row middle">
                    {block?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                        ("Transaction")}
                    {block?.payload?.type === MILESTONE_PAYLOAD_TYPE &&
                        ("Milestone")}
                    {block?.payload?.type === TAGGED_DATA_PAYLOAD_TYPE &&
                        ("Data")}
                    {block?.payload?.type === undefined &&
                        ("No Payload")}
                </div>
            </div>
            {advancedMode && (
                <div className="section--data">
                    <div className="label">
                        Nonce
                    </div>
                    <div className="value row middle">
                        <span className="margin-r-t">{block?.nonce}</span>
                    </div>
                </div>
            )}
            {block?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                transferTotal !== undefined && (
                    <div className="section--data">
                        <div className="label">
                            Value
                        </div>
                        <div className="value row middle">
                            <span
                                onClick={() => setIsFormattedBalance(!isFormattedBalance)}
                                className="pointer margin-r-5"
                            >
                                {formatAmount(
                                    transferTotal,
                                    tokenInfo,
                                    !isFormattedBalance
                                )}
                            </span>
                            {isMarketed && (
                                <React.Fragment>
                                    <span>(</span>
                                    <FiatValue value={transferTotal} />
                                    <span>)</span>
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                )}
            <TabbedSection
                tabsEnum={{ Payload: "Payload", Metadata: "Metadata" }}
                tabOptions={{
                    Payload: {
                        disabled: !block?.payload
                    }
                }}
            >
                <BlockPayloadSection
                    network={network}
                    protocolVersion={protocolVersion}
                    block={block}
                    inputs={inputs}
                    unlocks={unlocks}
                    outputs={outputs}
                    transferTotal={transferTotal}
                    history={history}
                    advancedMode={advancedMode}
                    isLinksDisabled={isLinksDisabled}
                />
                <BlockMetadataSection
                    network={network}
                    metadata={metadata}
                    metadataError={metadataError}
                    conflictReason={conflictReason}
                    isLinksDisabled={isLinksDisabled}
                    history={history}
                />
            </TabbedSection>
        </React.Fragment >
    );

    return (
        <div className="block">
            <div className="wrapper">
                <div className="inner">
                    <div className="block--header">
                        <div className="row middle">
                            <h1>
                                Block
                            </h1>
                            <Modal icon="info" data={mainHeaderMessage} />
                            {isLoading && <Spinner />}
                        </div>
                        <Switcher
                            label="Advanced View"
                            checked={advancedMode}
                            onToggle={e => setAdvancedMode(e.target.checked)}
                        />
                    </div>
                    <div className="section">{blockContent}</div>
                </div>
            </div>
        </div >
    );
};

export default Block;

