import { NodeSDK } from "@opentelemetry/sdk-node"
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api"
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

const sdk = new NodeSDK({
  instrumentations: getNodeAutoInstrumentations({
    "@opentelemetry/instrumentation-grpc": { enabled: true },
  }),
})

sdk.start()
