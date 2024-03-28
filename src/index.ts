import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import {LiteLLM_SpendLogs, LiteLLM_IncrementSpend, LiteLLM_IncrementObject} from './_types'

const app = new Hono()
const prisma = new PrismaClient()
// In-memory storage for logs
const spend_logs: LiteLLM_SpendLogs[] = [];
const key_logs: LiteLLM_IncrementObject[] = [];
const user_logs: LiteLLM_IncrementObject[] = [];
const transaction_logs: LiteLLM_IncrementObject[] = [];


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Simple in-memory batch. In production, consider a more robust solution.
const BATCH_SIZE = 10; // Adjust based on your preferred batch size
const FLUSH_INTERVAL = 5000; // Time in ms to wait before flushing the batch

// Function to handle log insertion into the database
const flushLogsToDb = async () => {
  if (logBatch.length > 0) {
    await prisma.liteLLM_SpendLogs.createMany({
      data: logBatch,
    });
    console.log(`Flushed ${logBatch.length} logs to the DB.`);
    logBatch = []; // Reset the batch
  }
};

// // Periodically flush the log batch to the database
setInterval(flushLogsToDb, FLUSH_INTERVAL);

// Route to receive log messages
app.post('/spend/update', async (c) => {
  const incomingLogs = await c.req.json<LiteLLM_IncrementSpend>();
  
  logStorage.push(...incomingLogs);

  console.log(`Received and stored ${incomingLogs.length} logs. Total logs in memory: ${logStorage.length}`);
  
  return c.json({ message: `Successfully stored ${incomingLogs.length} logs` });
});



const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
