import { createApp } from "./app";
import { dbReady } from "./database/connection";
import { initializeDatabase } from "./database/schema";

const PORT = 3001;

const startServer = async () => {
  try {
    await dbReady;
    console.log("Connected to in-memory SQLite database");

    await initializeDatabase();
    console.log("Database schema initialized and sample data seeded");

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
