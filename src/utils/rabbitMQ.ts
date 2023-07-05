import { connect } from 'amqplib';

const amqp_url = process.env.RABBITMQ_URL;

export async function sendRabbit(message: string) {
  const conn = await connect(amqp_url, 'heartbeat=60');
  const ch = await conn.createChannel();
  const exch = 'send_rabbit';
  const queue = 'subscribers';
  const rkey = 'route';
  await ch
    .assertExchange(exch, 'direct', { durable: true })
    .catch(console.error);
  await ch.assertQueue(queue, { durable: true });
  await ch.bindQueue(queue, exch, rkey);
  await ch.publish(exch, rkey, Buffer.from(message));
  setTimeout(function () {
    ch.close();
    conn.close();
  }, 500);
}
