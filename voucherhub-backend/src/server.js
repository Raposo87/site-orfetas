import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import paymentsRouter from './routes/payments.js';
import vouchersRouter from './routes/vouchers.js';
import { initDb } from './db.js';

const app = express();

// ✅ Health check vem logo aqui no topo
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// ⚠️ Esse middleware deve vir depois
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/payments/webhook')) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => data += chunk);
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

app.use('/api/payments', paymentsRouter);
app.use('/api/vouchers', vouchersRouter);

const port = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`VoucherHub backend listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to init DB', err);
    process.exit(1);
  });
