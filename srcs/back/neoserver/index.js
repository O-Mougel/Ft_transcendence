import Fastify from 'fastify';

const fastify = Fastify();

const PORT = 3000;

fastify.get('/', function (request, reply) {
  reply.send("ma reponse")
})

fastify.get('/about', function (request, reply) {
  reply.type("html")
  reply.send(index.html)
})

fastify.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log('My app is running on port ${PORT}')
});
