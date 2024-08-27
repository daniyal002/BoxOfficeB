import express from 'express';
import { PrismaClient } from '@prisma/client';
import orderRoutes from './routes/order';
import postRoutes from './routes/post'
import departmentRoutes from './routes/department'
import roleRoutes from './routes/role'
import employeeRoutes from './routes/employee';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import statusRoutes from './routes/status';
import routeRoutes from './routes/route';
import cashRoutes from './routes/cash';
import menuRoutes from './routes/menu';
import { authMiddleware } from './authMiddleware';
import path from 'path';
import cors from 'cors'

const prisma = new PrismaClient();
const app = express();
app.use(cors({origin:"*",credentials:false,}))
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/orders', authMiddleware,orderRoutes);
app.use('/posts', authMiddleware, postRoutes);
app.use('/departments', authMiddleware, departmentRoutes);
app.use('/roles', authMiddleware, roleRoutes);
app.use('/employees', authMiddleware, employeeRoutes);
app.use('/users',authMiddleware, userRoutes);
app.use('/statuses',authMiddleware, statusRoutes);
app.use('/routes',authMiddleware, routeRoutes);
app.use('/cashes',authMiddleware, cashRoutes);
app.use('/menu',authMiddleware, menuRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



app.get('/', (req, res) => {
  res.send('Prisma and TypeScript Backend!');
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
