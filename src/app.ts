import { buildServer } from "./server";

const server = buildServer();

async function main() {
  try {
    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log(`Documentation running at http://localhost:3001/documentation`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
