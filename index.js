import 'dotenv/config';

import DB from "./src/cores/connectDB.js";
import authDdosMidleware from './src/midlewares/antiDDosMidleware.js';
import corsMidleware from "./src/midlewares/corsMidleware.js";
import express from "express";
import router from './src/routes/index.js'

const PORT = process.env.PORT || 8080;

const app = express();

DB.connect();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(corsMidleware);

app.use(authDdosMidleware(60)) // limit 60 requests in 1 minutes
router(app);
app.listen(PORT, () => { console.log(`Web at http://localhost:${PORT}`); });