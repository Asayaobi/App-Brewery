import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "AsayaObi",
  port: 5432,
})
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1

async function checkUsers() {
  try{
    let result = await db.query("SELECT * FROM users")
    console.log('result checkUser',result.rows)
    return result.rows
  } catch (error) {
    console.error(error.message)
  }
}

async function checkVisited(currentUserId) {
  try {
    console.log('checkVisited UserId',currentUserId)
    const result = await db.query('SELECT country_code FROM visited_countries WHERE user_id = $1', [currentUserId])

    //create countries array of country_code
    let countries = []
      result.rows.forEach((country) => {
      countries.push(country.country_code)
    })
    console.log('countries',countries)
    return countries

  } catch (error) {
    console.error(error.message)
  }
}

async function checkColor(currentUserId) {
  try {
    const result = await db.query('SELECT color FROM users WHERE id = $1',[currentUserId]);
    console.log('color',result.rows[0].color)
    return result.rows[0].color
  } catch (error) {
    console.error(error.message)
  }
}

app.get("/", async (req, res) => {
  try {
  //get all users to display on the tabs
  const usersResult = await checkUsers()
  //get countries and color with currentUserId
  const countries = await checkVisited(currentUserId)
  const colorResult = await checkColor(currentUserId)
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: usersResult,
    color: colorResult,
  })
  } catch (error) {
    console.error(error.message)
  }
})

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  //show pages from selected tab bar
  if (req.body.add){
    res.render("new.ejs")
  }
  if (req.body.user){
    console.log('req.body.user id',req.body.user)
    // set currentUserId
    currentUserId = req.body.user
    //get query for visited countries data of that user
    res.redirect("/")
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  console.log('name',req.body.name, req.body.color)
  //post new user
  let response = await db.query(`INSERT INTO users (name, color) VALUES ($1, $2)`, [req.body.name, req.body.color])
  console.log('post new user', response)
  //if user is posted, redirect to homepage
  if (response.rowCount === 1) {
    res.redirect("/")
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
