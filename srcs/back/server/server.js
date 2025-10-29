import Fastify from 'fastify'
import * as z from "zod";
/*
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('test.db');
db.exec(`
  CREATE TABLE t3(x, y);
  INSERT INTO t3 VALUES ('a', 4),
                        ('b', 5),
                        ('c', 3),
                        ('d', 8),
                        ('e', 1);
`);

db.aggregate('sumint', {
  start: 0,
  step: (acc, value) => acc + value,
});

db.prepare('SELECT sumint(y) as total FROM t3').get(); // { total: 21 }
*/




const fastify = Fastify({
  logger: true
})

fastify.route({
  method: 'GET',
  url: '/name',
  schema: {
    // request needs to have a querystring with a `name` parameter
    querystring: {
      type: 'object',
      properties: {
          name: { type: 'string'}
      },
      required: ['name'],
    },
    // the response needs to be an object with an `hello` property of type 'string'
    response: {
      200: {
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  },
  // this function is executed for every request before the handler is executed
  preHandler: async (request, reply) => {
    // E.g. check authentication
  },
  handler: async (request, reply) => {
    return { hello: 'world with a name' }
  }
})

const options = {}
fastify.post('/post', options, async (request, reply) => {
  return request.body
})

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

fastify.get('/path', function (request, reply) {
  reply.send({ hello: 'world with a path' })
})

fastify.get('/newpath', function (request, reply) {
  reply.send({ hello: 'from a lizzzzzard' })
})

const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        someKey: { type: 'string' },
        someOtherKey: { type: 'number' }
      }
    }
  }
}

fastify.post('/', opts, async (request, reply) => {
  return { hello: 'world' }
})

const User = z.object({
  name: z.string(),
});
 
fastify.post('/zod', async (request, reply) => {
	const data = User.parse(request.body);
  return data.name
})

// Run the server!
fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})

