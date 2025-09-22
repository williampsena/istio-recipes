import grpc = require("@grpc/grpc-js")
import protoLoader = require("@grpc/proto-loader")
import { JokerRequest, JokerReply } from './proto/joker'
import { fetchJoke } from "./joker/api"

const packageDef = protoLoader.loadSync("./proto/joker.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const grpcObject = grpc.loadPackageDefinition(packageDef)
const jokerPackage = (grpcObject.joker || grpcObject.Joker) as any
type JokeCallback = (error: Error | null, response?: JokerReply) => void

function joke(
  _call: { request: JokerRequest },
  callback: JokeCallback
): void {
  getJoke(callback)
}

async function getJoke(callback: JokeCallback): Promise<void> {
  const joke = await fetchJoke()
  callback(null,  { joke: joke })
}

function main(): void {
  const server = new grpc.Server()

  if (!jokerPackage || !jokerPackage.Joker) {
    console.error("❌ Failed to load Joker service from proto")
    process.exit(1)
  }

  server.addService(jokerPackage.Joker.service, { Joke: joke })

  const port = process.env.PORT || 50052
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
      console.log("🚀 gRPC joker server running on", port)
    }
  )
}

main()
