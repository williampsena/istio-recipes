import grpc = require("@grpc/grpc-js")
import protoLoader = require("@grpc/proto-loader")
import { GreeterRequest, GreeterReply } from './proto/greeter'
import { buildMessage } from "./greeter/builder"

const packageDef = protoLoader.loadSync("./proto/greeter.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const grpcObject = grpc.loadPackageDefinition(packageDef)
const greeterPackage = (grpcObject.greeter || grpcObject.Greeter) as any

function greet(
  call: { request: GreeterRequest },
  callback: (error: Error | null, response?: GreeterReply) => void
): void {
  const req = call.request
  callback(null, { message: buildMessage(req.name, req.lang) })
}

function main(): void {
  const server = new grpc.Server()

  if (!greeterPackage || !greeterPackage.Greeter) {
    console.error("❌ Failed to load Greeter service from proto")
    process.exit(1)
  }

  server.addService(greeterPackage.Greeter.service, { Greet: greet })

  const port = process.env.PORT || 50051
  const binding = `0.0.0.0:${port}`

  const serverShutdown = () => {
    server.tryShutdown((e) => {
      if (e) console.error(`❌ Error`, e)
      process.exit(0)
    })
  }

  process.on("SIGINT", () => {
    console.log("👋😊 Received SIGINT, shutting down gracefully...")
    serverShutdown()
  })

  process.on("SIGTERM", () => {
    console.log("👋😊 Received SIGTERM, shutting down gracefully...")
    serverShutdown()
  })

  server.bindAsync(
    binding,
    grpc.ServerCredentials.createInsecure(),
    (error: Error | null, port: number) => {
      if (error) {
        console.error("❌ Failed to bind server:", error)
        return
      }
      console.log("🚀 gRPC greeter server running on", port)
    }
  )
}

main()
