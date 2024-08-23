const express = require('express')
const sqlite3 = require("sqlite3").verbose();
const ratelimiter = require("./ratelimit")
const textlimiter = require("./textlimit")

//server
const app = express()
app.use(ratelimiter(2000)) //limit 1 request to set second
app.use(express.json())
app.use(textlimiter(10)) //limit the text size for thread and message

//DB
const db = new sqlite3.Database('bharat.db', (err) => {
    if (err) {
        console.log('There was some error')
    }
    console.log('DB connected fine.')
})


//Creating table if they dont exist
db.run('CREATE TABLE IF NOT EXISTS Counter (id INTEGER PRIMARY KEY AUTOINCREMENT)', (err) => {
    if (err) {
        console.log('Failed to create Counter table.')
    } else {
        console.log('Counter table created.')
    }
});

db.run('CREATE TABLE IF NOT EXISTS Thread (id INTEGER PRIMARY KEY ,message TEXT NOT NULL)', (err) => {
    if (err) {
        console.log('Failed to create Thread table')
    } else {
        console.log('Thread table created.')
    }
});

db.run('CREATE TABLE IF NOT EXISTS Comment (id INTEGER PRIMARY KEY ,message TEXT NOT NULL,threadid INTEGER, FOREIGN KEY (threadid) references thread(id))', (err) => {
    if (err) {
        console.log('Failed to create comment table')
    } else {
        console.log('Comment table created.')
    }
});

//DB commands
const setid = 'INSERT into counter DEFAULT VALUES';
const geteverythread = 'SELECT * FROM thread';
const getspecificthread = 'SELECT * FROM thread where id = ?';
const getthreadwithitscomments = 'SELECT t.id AS thread_id, t.message AS thread_message, c.id AS comment_id, c.message AS comment_message FROM Thread t LEFT JOIN Comment c ON t.id = c.threadid WHERE t.id = ?'
const getallcomments = 'SELECT * FROM comment where threadid = ?';
const addthread = 'INSERT INTO thread (id, message) values (? ,?)';
const addcomment = 'INSERT INTO comment (id, message, threadid) values (?,?,?)';
const getid = 'SELECT last_insert_rowid()';


//routes

//get all threads
app.get('/thread', (req, res) => {
    db.all(geteverythread, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(200).json({ message: err })
        } else {
            return res.status(200).json(data)
        }
    })
})

//add a new thread
app.post('/thread', (req, res) => {
    db.serialize(() => {
        let id = undefined
        //set id
        db.run(setid)
        //get id
        db.get(getid, (err, data) => {
            id = data['last_insert_rowid()']
            //insert the thread with id
            db.run(addthread, [id, req.body.message], (err) => {
                if (err) {
                    return res.status(200).json({ success: false })
                } else {
                    return res.status(200).json({ success: true })
                }
            })
        })
    })
})

//get a specific thread and its comments
app.get('/thread/:id', (req, res) => {
    db.all(getthreadwithitscomments, [req.params.id], (err, data) => {
        if (err) {
            console.log(err)
            return res.status(200).json({ message: err })
        } else {
            return res.status(200).json(data)
        }
    })
})

//add a comment to specific thread
app.post('/thread/:id', (req, res) => {
    db.serialize(() => {
        let id = undefined
        //set id
        db.run(setid)
        //get id
        db.get(getid, (err, data) => {
            id = data['last_insert_rowid()']
            //insert the thread with id
            db.run(addcomment, [id, req.body.message, req.params.id], (err) => {
                if (err) {
                    return res.status(200).json({ success: false })
                } else {
                    return res.status(200).json({ success: true })
                }
            })
        })
    })
})

//start server
app.listen(3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});