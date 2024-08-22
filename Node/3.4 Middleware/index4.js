import express from "express";
import bodyParser from "body-parser";
import {dirname} from "path"
import {fileURLToPath} from "url"
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
let bandname = ""

function bandNameGenerator(req,res,next){
  bandname = req.body.street + req.body.pet
  next()
}
app.use(bodyParser.urlencoded({extended: true}))
app.use(bandNameGenerator)

app.get("/", (req,res) => {
  res.sendFile(__dirname + "/public/index.html")
})

app.post("/submit",(req, res)=> {
  res.send(`<h1>Your Band Name is:</h1><p>${bandname}</p>`)
})
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
