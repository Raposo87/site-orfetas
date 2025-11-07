import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import paymentsRouter from './routes/payments.js';
import vouchersRouter from './routes/vouchers.js';
import { initDb } from './db.js';

const app = express();

// We need the raw body for Stripe webhook signature verification
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/payments/webhook')) {
    // Capture raw body
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/payments', paymentsRouter);
app.use('/api/vouchers', vouchersRouter);

const port = process.env.PORT || 3000;

initDb().then(() => {
  app.listen(port, () => {
    console.log(`VoucherHub backend listening on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to init DB', err);
  process.exit(1);
});
