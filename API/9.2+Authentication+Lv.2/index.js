import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import bcrypt from "bcrypt"

const app = express();
const port = 3000;
//set saltRounds for bcrypt
const saltRounds = 10

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "123456",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ])
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.")
    } else {
      //hash the password for storing in the database
      bcrypt.hash(password, saltRounds, async (err, hashPassword) => {
        if (err){
          console.log(err)
        } else {
          const result = await db.query(
          "INSERT INTO users (email, password) VALUES ($1, $2)",
          [email, hashPassword]
      )
      console.log(result);
      res.render("secrets.ejs");
        }
      })
    }
  } catch (err) {
    console.log(err)
  }
})

app.post("/login", async (req, res) => {
  const email = req.body.username
  const inputPassword = req.body.password

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ])
    if (result.rows.length > 0) {
      const user = result.rows[0]
      const storedPassword = user.password
      //use bcrypt compare method to see if the result is true or false
      bcrypt.compare(inputPassword, storedPassword, (err, result) => {
        if (err){
          console.log(err)
        }else{
          //if result is true = password is correct
          console.log(result)
          if(result){
            res.render('secrets.ejs')
          } else {
            res.send('password is not correct.')
          }
        }
      })
    } else {
      res.send("User not found")
    }
  } catch (err) {
    console.log(err)
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
