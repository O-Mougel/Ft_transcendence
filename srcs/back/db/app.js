const sqlite3 = require('sqlite3')
const dbname = 'main.db' 

let db = new sqlite3.Database(dbname, err => {
	if (err)
		throw err

	console.log('Database started on ' + dbname)
		
})

db.close(err => {
	if (err)
		throw err
	console.log('Database closed')
})
