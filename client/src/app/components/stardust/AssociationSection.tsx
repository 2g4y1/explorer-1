/* eslint-disable @typescript-eslint/no-shadow */
import classNames from "classnames";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { DateHelper } from "../../../helpers/dateHelper";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { AssociationType } from "../../../models/api/stardust/IAssociationsResponse";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import NetworkContext from "../../context/NetworkContext";
import Pagination from "../Pagination";
import Spinner from "../Spinner";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import { ASSOCIATION_TYPE_TO_LABEL } from "./AssociatedOutputsUtils";
import "./AssociationSection.scss";

interface IAssociatedSectionProps {
    association: AssociationType;
    outputIds: string[] | undefined;
}

interface IOutputDetails {
    outputId: string;
    dateCreated: string;
    ago: string;
    amount: string;
}

const JOB_KEY = "loadAssocOutputDetails";
const PAGE_SIZE = 10;

const AssociationSection: React.FC<IAssociatedSectionProps> = ({ association, outputIds }) => {
    const mounted = useRef(false);
    const { tokenInfo, name: network } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormatBalance, setIsFormatBalance] = useState(false);
    const [jobToStatus, setJobToStatus] = useState(
        new Map<string, PromiseStatus>().set(JOB_KEY, PromiseStatus.PENDING)
    );
    const [outputDetails, setOutputDetails] = useState<IOutputDetails[]>([]);
    const [page, setPage] = useState<IOutputDetails[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        const loadedOutputDetails: IOutputDetails[] = [];
        const outputIdsToDetails: Map<string, IOutputDetails> = new Map();

        const loadOutputDetailsMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set(JOB_KEY, status));
            // This actually happends after all promises are DONE
            if (status === PromiseStatus.DONE) {
                for (const outputId of outputIds ?? []) {
                    const details = outputIdsToDetails.get(outputId);
                    if (details) {
                        const { dateCreated, ago, amount } = details;
                        loadedOutputDetails.push({ outputId, dateCreated, ago, amount });
                    }
                }

                if (mounted.current) {
                    setOutputDetails(loadedOutputDetails.reverse());
                }
            }
        });

        if (outputIds && isExpanded) {
            for (const outputId of outputIds) {
                // eslint-disable-next-line no-void
                void loadOutputDetailsMonitor.enqueue(
                    async () => tangleCacheService.outputDetails(network, outputId).then(outputDetails => {
                        if (outputDetails) {
                            const timestampBooked = outputDetails.metadata.milestoneTimestampBooked * 1000;
                            const dateCreated = DateHelper.formatShort(Number(timestampBooked));
                            const ago = moment(timestampBooked).fromNow();
                            const amount = outputDetails.output.amount;
                            outputIdsToDetails.set(outputId, { outputId, dateCreated, ago, amount });
                        }
                    })
                );
            }
        }
    }, [outputIds, isExpanded]);

    // on page change handler
    useEffect(() => {
        if (outputDetails && mounted.current) {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE;

            const slicedDetails = outputDetails.slice(from, to);
            setPage(slicedDetails);
        }
    }, [outputDetails, pageNumber]);

    const count = outputIds?.length;
    const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);

    return (
        count ?
            <div
                className="section association-section"
            >
                <div
                    className="row association-section--header middle pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className={classNames("margin-r-t", "dropdown", { opened: isExpanded })}>
                        <DropdownIcon />
                    </div>
                    <h3>{ASSOCIATION_TYPE_TO_LABEL[association]} ({count})</h3>
                    {isExpanded && isLoading && (
                        <div className="margin-l-t">
                            <Spinner />
                        </div>
                    )}
                </div>
                {!isExpanded || isLoading ? null : (
                    <React.Fragment>
                        <table className="association-section--table">
                            <thead>
                                <tr>
                                    <th>OUTPUT ID</th>
                                    <th>DATE CREATED</th>
                                    <th>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    page.map((details, idx) => {
                                        const { outputId, dateCreated, ago, amount } = details;
                                        return (
                                            <tr key={idx}>
                                                <td className="card">
                                                    <Link
                                                        to={`/${network}/output/${outputId}`}
                                                        className="margin-r-t highlight"
                                                    >
                                                        <span className="highlight">{outputId}</span>
                                                    </Link>
                                                </td>
                                                <td className="date-created">{dateCreated} ({ago})</td>
                                                <td className="amount">
                                                    <span
                                                        onClick={() => setIsFormatBalance(!isFormatBalance)}
                                                        className="pointer margin-r-5"
                                                    >
                                                        {formatAmount(Number(amount), tokenInfo, isFormatBalance)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>

                        <div className="association-section--cards">
                            {
                                page.map((details, idx) => {
                                    const { outputId, dateCreated, ago, amount } = details;
                                    const outputIdShort = `${outputId.slice(0, 11)}....${outputId.slice(-11)}`;

                                    return (
                                        <div key={idx} className="card">
                                            <div className="field">
                                                <div className="label">Output Id</div>
                                                <Link
                                                    to={`/${network}/output/${outputId}`}
                                                    className="margin-r-t value"
                                                >
                                                    <span className="highlight">{outputIdShort}</span>
                                                </Link>
                                            </div>
                                            <div className="field">
                                                <div className="label">Date Created</div>
                                                <div className="value date-created">{dateCreated} ({ago})</div>
                                            </div>
                                            <div className="field">
                                                <div className="label">Amount</div>
                                                <div className="value amount">
                                                    <span
                                                        onClick={() => setIsFormatBalance(!isFormatBalance)}
                                                        className="pointer margin-r-5"
                                                    >
                                                        {formatAmount(Number(amount), tokenInfo, isFormatBalance)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        <Pagination
                            classNames="association-section--pagination"
                            currentPage={pageNumber}
                            totalCount={outputDetails.length}
                            pageSize={PAGE_SIZE}
                            siblingsCount={1}
                            onPageChange={number => setPageNumber(number)}
                        />
                    </React.Fragment>
                )}
            </div> : null
    );
};

export default AssociationSection;

