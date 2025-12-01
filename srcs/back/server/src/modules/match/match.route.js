

	fastify.post(
		'/match',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("matchSchema")
			}
		}
	)
