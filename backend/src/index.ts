import   express  from 'express'
import dotenv from "dotenv";
import { Request , Response } from 'express'
import { applyDatabaseIndexes } from "./config/indexingfordb";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import boardRoutes from "./routes/board.routes";
import projectRoutes from "./routes/project.routes";
import cors from "cors";
dotenv.config();

const app = express()
const PORT = 3000

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite
      "http://localhost:3000", // React CRA
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // important if using cookies later
  })
);

app.use(express.json());


const startServer = async () => {
  await connectDB();          // 1️⃣ Connect DB
  await applyDatabaseIndexes(); // 2️⃣ Apply indexes
  
  app.use("/health", (req : Request,res:Response)=> {
    return res.status(200).json({status:"Health" , timestamp:Date.now()})
   })
  app.use("/auth",authRoutes);
  app.use("/projects",projectRoutes);
  app.use("/board",boardRoutes);




  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();