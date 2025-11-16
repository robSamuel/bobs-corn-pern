import express, {json} from 'express';
import { cornLimiter } from '../rateLimiter';

const PORT = 5000;
const app = express();

app.use(express.json());

app.post('/buy', cornLimiter, (req, res) => {
    return res
        .status(200)
        .json({
            message: "You successfully bought corn!"
        });
  }
);



app.listen(PORT, () => console.log(`Backend ready on port: ${PORT}`));