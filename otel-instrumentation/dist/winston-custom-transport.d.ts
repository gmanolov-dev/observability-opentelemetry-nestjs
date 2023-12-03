/// <reference types="node" />
import { Transform } from "winston-transport";
import type * as logsAPI from '@opentelemetry/api-logs';
export declare class WinstonCustomTransport extends Transform {
    private readonly logger;
    constructor(logger: logsAPI.Logger);
    log(info: any, callback: any): void;
}
