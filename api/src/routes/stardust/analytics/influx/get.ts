import { ServiceFactory } from "../../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../../models/api/stardust/INetworkBoundGetRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import {
    IAddressesWithBalanceDailyInflux, IAliasActivityDailyInflux, IAvgAddressesPerMilestoneDailyInflux,
    IBlocksDailyInflux, ILedgerSizeDailyInflux, INftActivityDailyInflux, IOutputsDailyInflux,
    IStorageDepositDailyInflux, ITokensHeldPerOutputDailyInflux, ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux, ITransactionsDailyInflux, IUnclaimedGenesisOutputsDailyInflux,
    IUnclaimedTokensDailyInflux, IUnlockConditionsPerTypeDailyInflux
} from "../../../../models/influx/influxData";
import { NetworkService } from "../../../../services/networkService";
import { InfluxDBService } from "../../../../services/stardust/influx/influxDbService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * The response with the current cached analytic data.
 */
export interface IDailyAnalyticsResponse {
    error?: string;
    blocksDaily?: IBlocksDailyInflux[];
    transactionsDaily?: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily?: IAddressesWithBalanceDailyInflux[];
    avgAddressesPerMilestoneDaily?: IAvgAddressesPerMilestoneDailyInflux[];
    tokensTransferredDaily?: ITokensTransferredDailyInflux[];
    aliasActivityDaily?: IAliasActivityDailyInflux[];
    unlockConditionsPerTypeDaily?: IUnlockConditionsPerTypeDailyInflux[];
    nftActivityDaily?: INftActivityDailyInflux[];
    tokensHeldWithUnlockConditionDaily?: ITokensHeldWithUnlockConditionDailyInflux[];
    unclaimedTokensDaily?: IUnclaimedTokensDailyInflux[];
    unclaimedGenesisOutputsDaily?: IUnclaimedGenesisOutputsDailyInflux[];
    ledgerSizeDaily?: ILedgerSizeDailyInflux[];
    storageDepositDaily?: IStorageDepositDailyInflux[];
}

/**
 * Get influx cached analytic stats for the requested network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: INetworkBoundGetRequest
): Promise<IDailyAnalyticsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const influxService = ServiceFactory.get<InfluxDBService>(`influxdb-${request.network}`);

    return influxService ? {
        blocksDaily: influxService.blocksDaily,
        transactionsDaily: influxService.transactionsDaily,
        outputsDaily: influxService.outputsDaily,
        tokensHeldDaily: influxService.tokensHeldDaily,
        addressesWithBalanceDaily: influxService.addressesWithBalanceDaily,
        avgAddressesPerMilestoneDaily: influxService.avgAddressesPerMilestoneDaily,
        tokensTransferredDaily: influxService.tokensTransferredDaily,
        aliasActivityDaily: influxService.aliasActivityDaily,
        unlockConditionsPerTypeDaily: influxService.unlockConditionsPerTypeDaily,
        nftActivityDaily: influxService.nftActivityDaily,
        tokensHeldWithUnlockConditionDaily: influxService.tokensHeldWithUnlockConditionDaily,
        unclaimedTokensDaily: influxService.unclaimedTokensDaily,
        unclaimedGenesisOutputsDaily: influxService.unclaimedGenesisOutputsDaily,
        ledgerSizeDaily: influxService.ledgerSizeDaily,
        storageDepositDaily: influxService.storageDepositDaily
    } : {
        error: "Influx service not found for this network."
    };
}

