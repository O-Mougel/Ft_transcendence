// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fs = require('fs')
const path = require('node:path')

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'src'),
  prefix: '/', // optional: default '/'
})

// Declare a route
fastify.get('/', function handler (request, reply) {
	// const stream = fs.createReadStream('./src/index.html')
	// reply.type('text/html').send(stream)
  	reply.sendFile('index.html')
})

// Declare a route
fastify.get('/selectModes.html', function handler (request, reply) {
	// const stream = fs.createReadStream('./src/index.html')
	// reply.type('text/html').send(stream)
  	reply.sendFile('selectModes.html')
})


// Run the server!
fastify.listen({ port: 3001 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})