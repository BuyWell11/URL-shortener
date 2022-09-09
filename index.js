const express = require('express')
var shortID = require('short-id-gen')
const Pool = require('pg').Pool
let is_db = false
let urls_map = new Map()
let sql;
const app = express()
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 8080
let default_url = 'http://localhost:8080/'

if (process.argv[2] == '-d') {
  is_db = true;
  sql = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'node_test',
    user: 'postgres',
    password: 'password here',
  })
  sql.connect();
}

function getKey(map, value) {
  const arr = [...map].find((pair) => pair[1] == value);
  return arr ? arr[0] : false;
}

app.get('/:url', async (req, res) => {
  let temp_url;

  if (is_db) {
    temp_url = await get_from_bd(req);
  }
  else {
    temp_url = get_from_local(req);
  }

  res.send(temp_url);
})

app.post('/', async (req, res) => {
  let temp_url;

  if (is_db) {
    temp_url = await post_in_bd(req);
  }
  else {
    temp_url = post_in_local(req);
  }

  res.send(temp_url)
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

function post_in_local(req) {
  let check = getKey(urls_map, req.body.url)
  if (check) {
    return check
  }
  let temp_url = default_url + shortID.generate()
  urls_map.set(temp_url, req.body.url)
  return temp_url
}

function get_from_local(req) {
  return urls_map.get(default_url + req.params.url)
}

async function post_in_bd(req) {
  let check = await is_in_bd(req)
  if (check) {
    return check;
  }
  let temp_url = default_url + shortID.generate()
  await sql.query(`INSERT INTO urls (url, short_url) values ($1, $2)`, [req.body.url, temp_url]);
  return temp_url;
}

async function get_from_bd(req) {
  let str = default_url + req.params.url;
  const url = await sql.query(`SELECT url, short_url FROM urls WHERE short_url = $1`, [str]);
  return url.rows[0].url;
}

async function is_in_bd(req) {
  const url = await sql.query(`SELECT url, short_url FROM urls WHERE url = $1`, [req.body.url]);
  if (url.rows.length == 0) {
    return false;
  }
  return url.rows[0].short_url;
}