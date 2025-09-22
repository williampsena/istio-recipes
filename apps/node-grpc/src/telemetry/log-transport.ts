import { TransportStreamOptions } from "winston-transport";
import { context, trace } from "@opentelemetry/api";
import * as http from "http";
import * as https from "https";
import { URL } from "url";
import TransportStream = require("winston-transport");

interface OTelLogTransportOptions extends TransportStreamOptions {
    endpoint?: string;
    serviceName?: string;
}

export default class OTelLogTransport extends TransportStream {
    private endpoint: string;
    private serviceName: string;

    constructor(opts: OTelLogTransportOptions = {}) {
        super(opts);
        this.endpoint = opts.endpoint!;
        this.serviceName = opts.serviceName || process.env.OTEL_SERVICE_NAME || "uncle-baker-system"
    }

    async log(info: any, callback: () => void) {
        setImmediate(() => this.emit("logged", info));

        const spanContext = trace.getSpan(context.active())?.spanContext();

        const body = JSON.stringify({
            resourceLogs: [
                {
                    resource: {
                        attributes: [
                            { key: "service.name", value: { stringValue: this.serviceName } },
                        ],
                    },
                    scopeLogs: [
                        {
                            scope: {
                                name: "winston",
                            },
                            logRecords: [
                                {
                                    timeUnixNano: Date.now() * 1e6,
                                    severityText: info.level.toUpperCase(),
                                    body: { stringValue: info.message },
                                    attributes: [
                                        ...(info.stack
                                            ? [
                                                {
                                                    key: "exception.stacktrace",
                                                    value: { stringValue: info.stack },
                                                },
                                            ]
                                            : []),
                                        ...Object.entries(info)
                                            .filter(([k]) => k !== "message" && k !== "level" && k !== "stack")
                                            .map(([key, value]) => ({
                                                key,
                                                value: { stringValue: String(value) },
                                            })),
                                    ],
                                    traceId: spanContext?.traceId,
                                    spanId: spanContext?.spanId,
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        try {
            const url = new URL(this.endpoint);
            const client = url.protocol === "https:" ? https : http;

            const req = client.request(
                {
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(body),
                    },
                },
                (res) => {
                    if (res.statusCode && res.statusCode >= 400) {
                        console.error(`Failed to send log: ${res.statusCode}`);
                    }
                }
            );

            req.on("error", (err) => {
                console.error("Error while trying to send log OTEL:", err.message);
            });

            req.write(body);
            req.end();
        } catch (err) {
            console.error("Unexpected error:", (err as Error).message);
        }

        callback();
    }
}