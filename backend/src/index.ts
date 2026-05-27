import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import addressRoutes from './routes/address.routes';
import cardRoutes from './routes/card.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/cards', cardRoutes);


app.get('/', (req, res) => {
  res.json({ message: '¡Servidor funcionando correctamente!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;