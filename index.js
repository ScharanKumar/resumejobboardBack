const express = require("express");
const path = require("path");
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
// const port = process.env.PORT || 3003


const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json())
app.use(cors())
// app.use(cors({
//     origin:"http://localhost:3004"
// }))
const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(3030, () => {
      console.log(`Server Running at http://localhost:3030`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/jobs/get/companyapplied/:id", async (request, response) => {
  const {id}=request.params
 const query1 = `select * from student inner join applyjob on student.ids = applyjob.ids where applyjob.id like '${id}';`
  // const query = `SELECT
  //       *
  //     FROM
  //       jobsinfo
  //     where id in 
  //     (select id from applyjob where name like '${name}');`
// where name like '${name}'
  const res10 = await db.all(query1)
  response.send(res10);
})

app.post("/register/", async (request, response) => {
  const { username, password } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM register WHERE username like '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
        INSERT INTO 
          register (username,password) 
        VALUES 
          (
            '${username}', 
            '${hashedPassword}'
          )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.ok = false;
    response.send("Username already exists");
  }
})

app.get("/register/get/", async (request, response) => {
  const query = `select * from register;`
  const res13= await db.all(query)
  response.send(res13);
})

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM register WHERE username = '${username}'`;
  const dbUser1 = await db.get(selectUserQuery);
  if (dbUser1 === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser1.password);
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

app.get("/jobs/get/notappliedontime/:name", async (request, response) => {
  const {name}=request.params

  const query = `SELECT
        *
      FROM
        jobsinfo
      where (id not in 
      (select id from applyjob where name like '${name}')) and lastdatetoapply<date()
   ;`

  // const query = `select * from jobsinfo where lastdatetoapply >= date();`
  const res11 = await db.all(query)
  response.send(res11);
})

app.post("/register/admin/", async (request, response) => {
  const { username, password } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM admin WHERE username like '${username}'`;
  const dbUser2 = await db.get(selectUserQuery);
  if (dbUser2 === undefined) {
    const createUserQuery = `
        INSERT INTO 
          admin (username,password) 
        VALUES 
          (
            '${username}', 
            '${hashedPassword}'
          )`;
    const dbResponse2 = await db.run(createUserQuery);
    const newUserId = dbResponse2.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send("User already exists");
  }
})

app.get("/applyjob/get/", async (request, response) => {
  const query = `select * from applyjob;`
  const res13= await db.all(query)
  response.send(res13);
})

app.post("/login/admin", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM admin WHERE username = '${username}'`;
  const dbUser3 = await db.get(selectUserQuery);

  if (dbUser3 === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser3.password);
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

app.get("/jobs/get/", async (request, response) => {
  const query = `select * from jobsinfo;`
  const res5 = await db.all(query)
  response.send(res5);
})

app.post("/jobs/post/", async (request, response) => {
  const { id, jobrole, company, salary, jobtype,description,location,lastdatetoapply,industry } = request.body
  const query = `insert into jobsinfo(id,company,industry,jobrole,jobtype,description,location,salary,lastdatetoapply)
    values ('${id}','${company}','${industry}','${jobrole}','${jobtype}','${description}','${location}','${salary}','${lastdatetoapply}');`
  const res4 = await db.run(query)
  const newUserId = res4.lastID;
  response.send(`Created new job with ${newUserId}`);

})



app.get("/jobs/get/opentoapply/:name", async (request, response) => {
  const {name}=request.params

  const query = `SELECT
        *
      FROM
        jobsinfo
      where (id not in 
      (select id from applyjob where name like '${name}')) and lastdatetoapply>=date()
   ;`

  // const query = `select * from jobsinfo where lastdatetoapply >= date();`
  const res11 = await db.all(query)
  response.send(res11);
})

app.post("/studentapply/post/", async (request, response) => {
  const { ids,name,mobile,email } = request.body
  const query = `insert into student(ids, name, mobile, email)
    values ('${ids}','${name}','${mobile}','${email}');`
  const res4 = await db.run(query)
  const newUserId = res4.lastID;
  response.send(`Created new job with ${newUserId}`);

})

app.get("/studentapply/get/", async (request, response) => {
  const query = `select * from student;`
  const res12= await db.all(query)
  response.send(res12);
})

app.post("/applyjob/post/", async (request, response) => {
  const { ids,id,name } = request.body
  const query = `insert into applyjob(id, ids,name)
    values ('${id}','${ids}','${name}');`
  const res4 = await db.run(query)
  const newUserId = res4.lastID;
  response.send(`Created new job with ${newUserId}`);

})

app.get("/jobs/get/applied/:name", async (request, response) => {
  const {name}=request.params
  // const query = `select * from (student inner join applyjob on student.ids = applyjob.ids) inner join jobsinfo on applyjob.id = jobsinfo.id where name like '${name}';`
  const query = `SELECT
        *
      FROM
        jobsinfo
      where id in 
      (select id from applyjob where name like '${name}');`
// where name like '${name}'
  const res10 = await db.all(query)
  response.send(res10);
})

app.delete("/delete/jobs/:id",async(request,response)=>{
  const {id}=request.params
  const query=`delete from jobsinfo where id like "${id}";`
  const res6 = await db.run(query)
  response.send("Company successfully deleted");
})



app.get('/jobdes/:id', async (request, response) => {
  const {id}=request.params
  const getBooksQuery = `
    SELECT
      *
    FROM
      jobsinfo
    where id like '${id}';`;
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})
