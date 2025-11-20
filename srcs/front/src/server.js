// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fs = require('fs')
const path = require('node:path')

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, './'),
  prefix: '/', // optional: default '/'
})

// Declare a route
fastify.get("/", function handler (request, reply) {
	// const stream = fs.createReadStream('./src/index.html')
	// reply.type('text/html').send(stream)
  	reply.sendFile('index.html')
})


fastify.get("/modes", function handler (request, reply) {
	// const stream = fs.createReadStream('./src/index.html')
	// reply.type('text/html').send(stream)
  	reply.sendFile('index.html')
})

fastify.get("/nav", function handler (request, reply) {
	// const stream = fs.createReadStream('./src/index.html')
	// reply.type('text/html').send(stream)
  	reply.sendFile('index.html')
})

// Run the server!
fastify.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})