import dotenv from "dotenv";
dotenv.config();

const URL = "http://localhost:5050/api/expenses/get";
const TOKEN = process.env.TOKEN
console.log("TOKEN FROM ENV:", process.env.TOKEN);
const ITERATIONS = 50;

async function runLatencyTest() {
  let totalTime = 0;
  let times = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = Date.now();
    try {
      const res = await fetch(URL, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${TOKEN}`
        }
      });

      await res.json();

      const duration = Date.now() - start;
      times.push(duration);
      totalTime += duration;

      console.log(`Request ${i + 1}: ${duration} ms`);
    } catch (err) {
      console.error("Error:", err.message);
      return;
    }
  }

  console.log("\n=========================");
  console.log("Average Latency:", (totalTime / ITERATIONS).toFixed(2), "ms");
  console.log("Min Latency:", Math.min(...times), "ms");
  console.log("Max Latency:", Math.max(...times), "ms");
  console.log("=========================\n");
}

runLatencyTest();