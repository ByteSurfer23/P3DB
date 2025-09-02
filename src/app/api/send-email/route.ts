import { NextResponse } from "next/server";
import Redis from "ioredis";

export async function POST(req: Request) {
  let redis: Redis | undefined;
  try {
    const body = await req.json();
    console.log(body);

    // 1. Establish a connection to the Redis server
    const connectionUrl = process.env.NEXT_REDIS_URL;
    if (!connectionUrl) {
      throw new Error("NEXT_REDIS_URL environment variable is not set.");
    }

    redis = new Redis(connectionUrl);
    
    // 2. Define the queue name
    const queueName = 'email_queue';

    // 3. Publish the message to the Redis list (acting as a queue)
    const result = await redis.rpush(queueName, JSON.stringify(body));
    
    console.log(`Message added to Redis queue. List length: ${result}`);
    
    // 4. Return an immediate success response
    return NextResponse.json({ success: true, message: "Mail request queued successfully" });

  } catch (error) {
    console.error("Error queueing email request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    // 5. Ensure the Redis connection is closed
    if (redis) {
      // Use `quit()` to gracefully close the connection
      await redis.quit();
    }
  }
}
