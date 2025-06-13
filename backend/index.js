const express = require("express");
const cors = require("cors");
const AuthRouter = require("./routes/AuthRouter");
const QueryRouter = require("./routes/QueryRouter");
const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth",AuthRouter);
app.use("/api/query",QueryRouter);



app.listen(8081, () => {
      console.log("Backend Started");
});






