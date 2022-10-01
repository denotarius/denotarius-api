import { MetricsCollector } from '@blockfrost/blockfrost-utils';
import config from 'config';
import { FastifyInstance } from 'fastify';

async function common(fastify: FastifyInstance) {
  const metricsCollector = new MetricsCollector(10_000, {
    prefix: 'denotarius-api',
  });

  const prometheusMetricsConfig = config.has('server.prometheusMetrics')
    ? config.get<boolean>('server.prometheusMetrics')
    : false;

  fastify.route({
    url: '/',
    method: 'GET',
    handler: async (_request, reply) => {
      return reply.send('Denotarius API');
    },
  });

  fastify.route({
    url: '/status',
    method: 'GET',
    handler: async (_request, reply) => {
      return reply.send({
        healthy: true,
      });
    },
  });

  if (prometheusMetricsConfig) {
    fastify.route({
      url: '/prometheus',
      method: 'GET',
      handler: async (_request, reply) =>
        reply.header('Content-Type', 'text/plain').send(metricsCollector.toPrometheus()),
    });
  }
}

export default common;
