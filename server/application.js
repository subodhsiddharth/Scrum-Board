const express = require('express');
const cors = require('cors');
const scrumBoardRoutes = require('./routes/scrumBoard');
const userRoutes = require('./routes/user');
const PORT = process.env.PORT || 8000 ;
const app = express();

const corsOptions = {
    origin: true,
    credentials: true,
  };
app.use(cors(corsOptions));
app.use(express.json());
app.use(userRoutes);
app.use(scrumBoardRoutes);

app.listen(PORT, () => {console.log(`Server listening on port ${PORT}`) })

app.get('/', (req, res) => res.status(200).json({"Status" : 'Home is working fine'}))




