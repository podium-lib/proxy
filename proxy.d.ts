import MetricsClient from '@metrics/client';
import { HttpIncoming } from '@podium/utils';

declare class PodiumProxy {
    readonly pathname: string;
    readonly prefix: string;
    readonly metrics: MetricsClient;

    constructor(options?: PodiumProxy.PodiumProxyOptions);

    register(name: string, proxyManifest: PodiumProxy.PodletManifest): void;
    /**
     * @returns `undefined` if the incoming request didn't match anything registered in the proxy. Otherwise it returns the incoming request with the `.proxy` property set to true if successfully proxied.
     */
    process<T = { [key: string]: unknown }>(
        incoming: HttpIncoming<T>,
    ): Promise<HttpIncoming<T> | undefined>;
    /**
     * @returns An array of all loaded manifests ready to be used by `.load()`
     */
    dump(): PodiumProxy.PodletManifest[];
    /**
     * Loads an Array of manifests (provided by `.dump()`) into the proxy. If any of
     * the items in the loaded Array contains a key which is already in the cache, the
     * entry in the cache will be overwritten.
     *
     * If any of the entries in the loaded Array are not compatible with the format
     * which `.dump()` exports, they will not be inserted into the cache.
     *
     * @returns An Array with the keys which were inserted into the cache.
     */
    load(manifests: PodiumProxy.PodletManifest[]): string[];
}

declare namespace PodiumProxy {
    export type PodletManifest = {
        name: string;
        version: string;
        content: string;
        fallback?: string;
        proxy?: Record<string, string>;
        assets?: {
            js?: string[];
            css?: string[];
        };
        css?: string[];
        js?: string[];
    };

    export type AbsLogger = {
        trace: LogFunction;
        debug: LogFunction;
        info: LogFunction;
        warn: LogFunction;
        error: LogFunction;
        fatal: LogFunction;
    };

    type LogFunction = (...args: any) => void;

    export type PodiumProxyOptions = {
        /**
         * @default "/"
         */
        pathname?: string;
        /**
         * @default "/podium-resource"
         */
        prefix?: string;
        /**
         * @default 20000
         */
        timeout?: number;
        /**
         * @default Infinity
         */
        maxAge?: number;
        /**
         * @default null
         */
        logger?: AbsLogger | null;
    };
}

export default PodiumProxy;
