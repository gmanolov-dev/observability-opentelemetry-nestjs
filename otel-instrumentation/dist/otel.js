"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otelSDK = void 0;
const instrumentation_grpc_1 = require("@opentelemetry/instrumentation-grpc");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const process = require("process");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
const host_metrics_1 = require("@opentelemetry/host-metrics");
const exporter_metrics_otlp_grpc_1 = require("@opentelemetry/exporter-metrics-otlp-grpc");
const exporter_trace_otlp_grpc_1 = require("@opentelemetry/exporter-trace-otlp-grpc");
const sdk_logs_1 = require("@opentelemetry/sdk-logs");
require("dotenv/config");
const instrumentation_winston_1 = require("@opentelemetry/instrumentation-winston");
const exporter_logs_otlp_grpc_1 = require("@opentelemetry/exporter-logs-otlp-grpc");
// Debug what is happening behind the scene
// const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
const traceExporter = new exporter_trace_otlp_grpc_1.OTLPTraceExporter({
    url: 'http://localhost:4317',
});
const logExporter = new exporter_logs_otlp_grpc_1.OTLPLogExporter({
    url: 'http://localhost:4317',
});
const loggerProvider = new sdk_logs_1.LoggerProvider({
    resource: new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: process.env.APP_NAME,
    }),
});
loggerProvider.addLogRecordProcessor(new sdk_logs_1.BatchLogRecordProcessor(logExporter));
const logger = loggerProvider.getLogger('default', '1.0.0');
exports.otelSDK = new sdk_node_1.NodeSDK({
    resource: new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: process.env.APP_NAME,
    }),
    traceExporter,
    instrumentations: [
        new instrumentation_winston_1.WinstonInstrumentation({
            enabled: true,
            logHook: (span, record) => {
                record['resource.service.name'] = process.env.APP_NAME;
                span.addEvent(record.message);
                logger.emit({
                    severityText: record.level,
                    body: record.message
                });
            }
        }),
        new instrumentation_grpc_1.GrpcInstrumentation(),
        new instrumentation_http_1.HttpInstrumentation(),
    ],
});
const meterProvider = new sdk_metrics_1.MeterProvider({
    resource: new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: process.env.APP_NAME,
    }),
});
meterProvider.addMetricReader(new sdk_metrics_1.PeriodicExportingMetricReader({
    exporter: new exporter_metrics_otlp_grpc_1.OTLPMetricExporter({
        //url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
        url: 'http://localhost:4317',
        headers: {}, // an optional object containing custom headers to be sent with each request
        concurrencyLimit: 1, // an optional limit on pending requests
    }),
    exportIntervalMillis: 15000,
}));
const hostMetrics = new host_metrics_1.HostMetrics({
    meterProvider: meterProvider,
    name: 'host-metrics',
});
hostMetrics.start();
// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
    exports.otelSDK
        .shutdown()
        .then(() => console.log('SDK shut down successfully'), (err) => console.log('Error shutting down SDK', err))
        .finally(() => process.exit(0));
});
exports.otelSDK.start();
