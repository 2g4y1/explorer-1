/* eslint-disable no-void */
import React, { useEffect, useState } from "react";
import { useAddressHistory } from "../../../../helpers/hooks/useAddressHistory";
import DownloadModal from "../DownloadModal";
import TransactionCard from "./TransactionCard";
import TransactionRow from "./TransactionRow";
import "./TransactionHistory.scss";

interface TransactionHistoryProps {
    network: string;
    address?: string;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = (
    { network, address, setLoading, setDisabled }
) => {
    const [historyView, outputDetailsMap, loadMore, isLoading, hasMore] = useAddressHistory(
        network,
        address,
        setDisabled
    );
    const [isFormattedAmounts, setIsFormattedAmounts] = useState(true);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    let isDarkBackgroundRow = false;

    return (historyView.length > 0 && address ? (
        <div className="section transaction-history--section">
            <div className="section--header row end">
                <DownloadModal network={network} address={address} />
            </div>
            <table className="transaction-history--table">
                <thead>
                    <tr>
                        <th>Transaction Id</th>
                        <th>Output Id</th>
                        <th>Date</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {historyView.length > 0 && (
                        historyView.map((historyItem, idx) => {
                            const outputDetails = outputDetailsMap[historyItem.outputId];
                            if (!outputDetails) {
                                return null;
                            }
                            const transactionId = historyItem.isSpent ?
                                outputDetails.metadata.transactionIdSpent :
                                outputDetails.metadata.transactionId;

                            if (!transactionId) {
                                return null;
                            }

                            // rotate row background colour for different transaction ids
                            if (idx > 0) {
                                const previousItemDetails = outputDetailsMap[historyView[idx - 1].outputId];
                                const previousSpent = historyView[idx - 1].isSpent;
                                if (previousItemDetails) {
                                    const previousTransactionId = previousSpent ?
                                        previousItemDetails.metadata.transactionIdSpent :
                                        previousItemDetails.metadata.transactionId;

                                    if (transactionId !== previousTransactionId) {
                                        isDarkBackgroundRow = !isDarkBackgroundRow;
                                    }
                                }
                            }

                            return (
                                <React.Fragment key={idx}>
                                    <TransactionRow
                                        outputId={historyItem.outputId}
                                        transactionId={transactionId}
                                        date={historyItem.milestoneTimestamp}
                                        value={Number(outputDetails.output.amount)}
                                        isSpent={historyItem.isSpent}
                                        isFormattedAmounts={isFormattedAmounts}
                                        setIsFormattedAmounts={setIsFormattedAmounts}
                                        darkBackgroundRow={isDarkBackgroundRow}
                                    />
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Only visible in mobile -- Card transactions*/}
            <div className="transaction-history--cards">
                {historyView.length > 0 && (
                    historyView.map((historyItem, idx) => {
                        const outputDetails = outputDetailsMap[historyItem.outputId];
                        if (!outputDetails) {
                            return null;
                        }
                        const transactionId = historyItem.isSpent ?
                            outputDetails.metadata.transactionIdSpent :
                            outputDetails.metadata.transactionId;

                        if (!transactionId) {
                            return null;
                        }

                        return (
                            <React.Fragment key={idx}>
                                <TransactionCard
                                    outputId={historyItem.outputId}
                                    transactionId={transactionId}
                                    date={historyItem.milestoneTimestamp}
                                    value={Number(outputDetails.output.amount)}
                                    isSpent={historyItem.isSpent}
                                    isFormattedAmounts={isFormattedAmounts}
                                    setIsFormattedAmounts={setIsFormattedAmounts}
                                />
                            </React.Fragment>
                        );
                    })
                )}
            </div>
            {hasMore && historyView.length > 0 && (
                <div className="card load-more--button" onClick={loadMore}>
                    <button type="button">Load more...</button>
                </div>
            )}
        </div>) : null
    );
};

TransactionHistory.defaultProps = {
    address: undefined,
    setDisabled: undefined
};

export default TransactionHistory;

