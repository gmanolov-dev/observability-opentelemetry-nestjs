import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

import { HostMetrics } from '@opentelemetry/host-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';


import 'dotenv/config';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';


// Debug what is happening behind the scene
// const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

console.log(process.env);

const traceExporter =  new OTLPTraceExporter({
  url: process.env.OTEL_TRACE_EXPORTER_URL || 'http://localhost:4317',
})


const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_LOGS_EXPORTER_URL || 'http://localhost:4317',
});
const loggerProvider = new LoggerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.APP_NAME,
  }),
});

loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));
const logger = loggerProvider.getLogger('default', '1.0.0');

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.APP_NAME,
  }),
  traceExporter,
  instrumentations: [
    new WinstonInstrumentation({
      enabled: true,
      logHook: (span, record) => { record['resource.service.name'] = process.env.APP_NAME; span.addEvent(record.message);
      logger.emit({
        severityText: record.level,
        body: record.message
      });
    }
    }),
    new GrpcInstrumentation(),
    new HttpInstrumentation(),
  ],
});

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.APP_NAME,
  }),
});
meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    //url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
    url: process.env.OTEL_METRICS_EXPORTER_URL || 'http://localhost:4317',
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 1, // an optional limit on pending requests
  }),
  exportIntervalMillis: 15000,
}))

const hostMetrics = new HostMetrics({
  meterProvider: meterProvider,
  name: 'host-metrics',
});
hostMetrics.start();

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});

otelSDK.start();