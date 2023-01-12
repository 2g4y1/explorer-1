import classNames from "classnames";
import React from "react";
import Modal from "../../Modal";
import { ModalData } from "../../ModalProps";
import ChartLegend from "./ChartLegend";
import "./ChartHeader.scss";

interface ChartHeaderProps extends Partial<ModalData> {
    title?: string;
    onTimespanSelected: (value: TimespanOption) => void;
    disabled?: boolean;
    legend?: {
        labels: string[];
        colors: string[];
    };
}

export type TimespanOption = "7" | "30" | "90" | "all";

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, data, onTimespanSelected, disabled, legend }) => (
    <div className="chart-header">
        <div className="row space-between margin-b-m ">
            {title && (
                <div className="chart-header__title">
                    <h4>{title}</h4>
                    {data && (
                        <Modal icon="info" data={data} />
                    )}
                </div>
            )}

            {!disabled && (
                <div className="chart-header__select">
                    <div className="select-wrapper">
                        <select
                            defaultValue="all"
                            onChange={({ target: { value } }) => {
                                if (onTimespanSelected) {
                                    onTimespanSelected(value as TimespanOption);
                                }
                            }}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="all">All time</option>
                        </select>
                        <span className={classNames("material-icons chevron", { opened: false })}>
                            expand_more
                        </span>
                    </div>
                </div>
            )}
        </div>

        {!disabled && legend && (
            <ChartLegend
                labels={legend.labels}
                colors={legend.colors}
            />
        )}
    </div>
);

ChartHeader.defaultProps = {
    disabled: undefined,
    legend: undefined,
    title: undefined
};

export default ChartHeader;
