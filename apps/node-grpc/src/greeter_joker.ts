import grpc = require("@grpc/grpc-js")
import protoLoader = require("@grpc/proto-loader")
import { GreeterJokerRequest, GreeterJokerReply } from './proto/greeter_joker'
import { GreeterClient, GreeterReply, GreeterRequest } from "./proto/greeter"
import { JokerClient, JokerReply, JokerRequest } from "./proto/joker"


const GREETER_ADDRESS = process.env.GREETER_ADDRESS || 'localhost:50051'
const JOKER_ADDRESS = process.env.JOKER_ADDRESS || 'localhost:50052'

type GreeterJokerCallback = (error: Error | null, response?: GreeterJokerReply) => void

const packageDef = protoLoader.loadSync("./proto/greeter_joker.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const grpcObject = grpc.loadPackageDefinition(packageDef)
const greeterJokerPackage = (grpcObject.greeterJoker || grpcObject.GreeterJoker) as any

function greet(
  call: { request: GreeterJokerRequest },
  callback: GreeterJokerCallback
): void {
  const req = call.request
  buildMessageWithJoker(req, callback)
}

async function callGreeterService(request: GreeterJokerRequest): Promise<string> {
  try {
    const client = new GreeterClient(
      GREETER_ADDRESS,
      grpc.credentials.createInsecure()
    )

    const greeterRequest = GreeterRequest.create({
      name: request.name,
      lang: request.lang
    })

    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('😖 gRPC call timeout'))
      }, 5000)

      client.greet(greeterRequest, (error: Error | null, response: GreeterReply) => {
        clearTimeout(timeout)

        if (error) {
          reject(error)
        } else {
          resolve(response.message)
        }
      })
    })
  } catch (error) {
    console.error('❌ Error calling Greeter service:', error)
    throw error
  }
}


async function callJokerService(): Promise<string> {
  try {
    const client = new JokerClient(
      JOKER_ADDRESS,
      grpc.credentials.createInsecure()
    )

    const jokerRequest = JokerRequest.create({})

    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('😖 gRPC call timeout'))
      }, 5000)

      client.joke(jokerRequest, (error: Error | null, response: JokerReply) => {
        clearTimeout(timeout)

        if (error) {
          reject(error)
        } else {
          resolve(response.joke)
        }
      })
    })
  } catch (error) {
    console.error('❌ Error calling Joker service:', error)
    throw error
  }
}


async function buildMessageWithJoker(req: GreeterJokerRequest, callback: GreeterJokerCallback): Promise<void> {
  try {
    const message = await callGreeterService(req)
    const joke = await callJokerService()

    callback(null, { message, joke })
  } catch (error) {
    console.error('❌ Error in buildMessageWithJoker:', error)
    callback(error as Error)
  }
}

function main(): void {
  const server = new grpc.Server()

  if (!greeterJokerPackage || !greeterJokerPackage.GreeterJoker) {
    console.error("❌ Failed to load Greeter Joker service from proto")
    process.exit(1)
  }

  server.addService(greeterJokerPackage.GreeterJoker.service, { Greet: greet })

  const port = process.env.PORT || 50053
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
      console.log("🚀 gRPC greeter joker server running on", port)
    }
  )
}

main()
