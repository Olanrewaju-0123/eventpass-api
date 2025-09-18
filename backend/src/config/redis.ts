import { createClient } from "redis"
import { config } from "./env"

const redisClient = createClient({
  url: config.REDIS_URL,
  password: config.REDIS_PASSWORD,
})

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err)
})

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis")
})

redisClient.on("disconnect", () => {
  console.log("❌ Disconnected from Redis")
})

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error("Failed to connect to Redis:", error)
  }
}

// Initialize Redis connection
connectRedis()

export { redisClient }
export default redisClient
