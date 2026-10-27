import '../src/utils/local-env';
import 'dotenv/config';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

const port = 5433;
const user = 'fastmeals';
const database = 'fastmeals';
const password = process.env.LOCAL_PG_PASSWORD;

if (!password) {
  throw new Error('Defina LOCAL_PG_PASSWORD no arquivo backend/.env antes de iniciar o banco.');
}

const databaseDir = path.resolve(__dirname, '../.pgdata');
const cluster = new EmbeddedPostgres({
  databaseDir,
  port,
  user,
  password,
  persistent: true,
  authMethod: 'scram-sha-256',
  onLog: () => undefined,
  onError: (error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (message.trim()) console.error(message);
  },
});

async function ensureDatabase(): Promise<void> {
  const client = cluster.getPgClient('postgres');
  await client.connect();
  const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE ${client.escapeIdentifier(database)}`);
  }
  await client.end();
}

function runNpx(args: string[]): Promise<void> {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: path.resolve(__dirname, '..'), env: process.env }, (error, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (error) reject(error);
      else resolve();
    });
  });
}

async function userCount(): Promise<number> {
  const client = cluster.getPgClient(database);
  await client.connect();
  try {
    const table = await client.query("SELECT to_regclass('public.users') AS name");
    const name = table.rows[0] && 'name' in table.rows[0] ? table.rows[0].name : null;
    if (!name) return 0;
    const count = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const value = count.rows[0] && 'count' in count.rows[0] ? count.rows[0].count : 0;
    return Number(value);
  } finally {
    await client.end();
  }
}

function portIsOpen(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    const finish = (open: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
  });
}

async function main(): Promise<void> {
  if (await portIsOpen()) {
    console.info(`Postgres do projeto já está em execução em localhost:${port}, banco ${database}, usuário ${user}`);
    return;
  }
  if (!existsSync(path.join(databaseDir, 'PG_VERSION'))) {
    await cluster.initialise();
  }
  await cluster.start();
  await ensureDatabase();
  await runNpx(['prisma', 'migrate', 'deploy']);
  if ((await userCount()) === 0) {
    console.info('Carregando dados iniciais.');
    await runNpx(['tsx', 'prisma/seed.ts']);
  }
  console.info(`Postgres do projeto em localhost:${port}, banco ${database}, usuário ${user}`);
  console.info('Mantenha este terminal aberto. Fechar o processo encerra o banco.');
  await new Promise(() => undefined);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Falha ao iniciar o Postgres do projeto.';
  console.error(message);
  process.exitCode = 1;
});
