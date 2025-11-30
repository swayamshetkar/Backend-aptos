require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route wiring
app.use("/api/video", require("./routes/video"));
app.use("/api/campaign", require("./routes/campaigns"));
app.use("/api/attester", require("./routes/attester"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));

// health
app.get("/", (req, res) => res.send("Backend up"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));