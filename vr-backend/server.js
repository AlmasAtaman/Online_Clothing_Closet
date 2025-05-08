import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';

import db from './app/models/index.js';
import authRoutes from './app/routes/auth.routes.js';
import userRoutes from './app/routes/user.routes.js';
import uploadRoutes from './app/routes/upload.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// CORS
app.use(cors({ origin: "http://localhost:3000" }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie-session middleware
app.use(
  cookieSession({
    name: "Lebron", // cookie name
    keys: [process.env.COOKIE_SECRET || "dev-secret"], // secure key
    httpOnly: true
  })
);

//added code for AWS S3
app.use('/images', uploadRoutes); // So POST /images works
//make sure to only change code here


// Routes
authRoutes(app);
userRoutes(app);

// Initial role seeding
async function initial() {
  const count = await db.prisma.role.count();
  if (count === 0) {
    await db.prisma.role.createMany({
      data: [
        { name: 'user' },
        { name: 'moderator' },
        { name: 'admin' }
      ]
    });
    console.log("Seeded roles: user, moderator, admin");
  }
}

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await initial();
});
