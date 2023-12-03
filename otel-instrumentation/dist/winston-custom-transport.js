"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonCustomTransport = void 0;
const winston_transport_1 = require("winston-transport");
class WinstonCustomTransport extends winston_transport_1.Transform {
    constructor(logger) {
        super();
        this.logger = logger;
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        this.logger.emit(info);
        // Perform the writing to the remote service
        callback();
    }
}
exports.WinstonCustomTransport = WinstonCustomTransport;
