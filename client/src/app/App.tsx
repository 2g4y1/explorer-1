import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { AppRouteProps } from "./AppRouteProps";
import { buildMetaLabel, getFooterItems, getPages, getFaviconHelmet, networkContextWrapper, populateNetworkInfoNova } from "./AppUtils";
import Disclaimer from "./components/Disclaimer";
import Footer from "./components/footer/Footer";
import ShimmerFooter from "./components/footer/ShimmerFooter";
import Header from "./components/header/Header";
import buildAppRoutes from "./routes";
import { ServiceFactory } from "~factories/serviceFactory";
import { isShimmerUiTheme } from "~helpers/networkHelper";
import { scrollToTop } from "~helpers/pageUtils";
import { INetwork } from "~models/config/INetwork";
import { MAINNET } from "~models/config/networkType";
import { NOVA, STARDUST } from "~models/config/protocolVersion";
import { NetworkService } from "~services/networkService";
import { NodeInfoService as NodeInfoServiceStardust } from "~services/stardust/nodeInfoService";
import "./App.scss";

const App: React.FC<RouteComponentProps<AppRouteProps>> = ({
    history,
    match: {
        params: { network, action },
    },
}) => {
    const [networks, setNetworks] = useState<INetwork[]>([]);
    const [networksLoaded, setNetworksLoaded] = useState(false);

    useEffect(() => {
        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfigs = networkService.networks();

        setNetworks(networkConfigs);
        setNetworksLoaded(true);
    }, []);

    useEffect(() => {
        if (networksLoaded && !network) {
            network = networks.length > 0 ? networks[0].network : MAINNET;
            history.replace(`/${network}`);
        }
    }, [networksLoaded]);

    const networkConfig = networks.find((n) => n.network === network);
    const protocolVersion = networkConfig?.protocolVersion ?? STARDUST;
    const identityResolverEnabled = protocolVersion !== STARDUST && (networkConfig?.identityResolverEnabled ?? true);
    const currentNetworkName = networkConfig?.network;
    const isShimmer = isShimmerUiTheme(networkConfig?.uiTheme);
    const nodeService = ServiceFactory.get<NodeInfoServiceStardust>("node-info-stardust");
    const nodeInfo = networkConfig?.network ? nodeService.get(networkConfig?.network) : null;
    const withNetworkContext = networkContextWrapper(currentNetworkName, nodeInfo, networkConfig?.uiTheme);
    scrollToTop();

    if (networkConfig?.protocolVersion === NOVA) {
        populateNetworkInfoNova(networkConfig.network);
    }

    const body = document.querySelector("body");
    if (isShimmer) {
        body?.classList.add("shimmer");
    } else {
        body?.classList.remove("shimmer");
    }

    const routes = buildAppRoutes(networkConfig?.protocolVersion ?? "", withNetworkContext);
    const pages = getPages(networkConfig, networks);

    const metaLabel = buildMetaLabel(currentNetworkName);
    const faviconHelmet = getFaviconHelmet(isShimmer);

    return (
        <div className={classNames("app", { shimmer: isShimmer })}>
            <Helmet>
                <meta name="apple-mobile-web-app-title" content={metaLabel} />
                <meta name="application-name" content={metaLabel} />
                <meta name="description" content={`${metaLabel} for viewing transactions and data on the Tangle.`} />
                <title>{metaLabel}</title>
            </Helmet>
            {faviconHelmet}
            <Header
                rootPath={`/${networkConfig?.isEnabled ? currentNetworkName : ""}`}
                currentNetwork={networkConfig}
                networks={networks}
                action={action}
                history={history}
                protocolVersion={protocolVersion}
                pages={pages}
            />
            <div className="content">
                {networks.length > 0 ? (
                    <React.Fragment>
                        {!networkConfig && (
                            <div className="maintenance">
                                <div className="maintenance-inner">The network provided does not exist, please check the url.</div>
                            </div>
                        )}
                        {networkConfig && routes}
                    </React.Fragment>
                ) : (
                    <div className="maintenance">
                        <div className="maintenance-inner">Explorer is currently undergoing maintenance, please check back later.</div>
                    </div>
                )}
            </div>
            {isShimmer ? (
                <ShimmerFooter dynamic={getFooterItems(currentNetworkName ?? "", networks, identityResolverEnabled)} />
            ) : (
                <Footer dynamic={getFooterItems(currentNetworkName ?? "", networks, identityResolverEnabled)} />
            )}
            <Disclaimer />
        </div>
    );
};

export default App;
