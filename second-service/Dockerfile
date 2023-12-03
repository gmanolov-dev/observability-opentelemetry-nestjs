FROM node:18.17.0-alpine 
RUN mkdir /app
WORKDIR /app

COPY second-service srv
COPY otel-instrumentation otel-instrumentation

RUN cd /app/otel-instrumentation; npm ci; npm run build

RUN cd /app/srv; npm ci; npm run build

WORKDIR /app/srv

CMD ["npm", "run", "start:telemetry"]

