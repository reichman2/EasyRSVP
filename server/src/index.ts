import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send("Hello, World!");
});

// Login and register routes
app.use('/api/auth', authRoutes);

// Event routes
app.use('/api/events', eventRoutes);



app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});