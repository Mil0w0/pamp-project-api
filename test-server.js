import { spawn } from 'child_process';
import http from 'http';

console.log('Starting NestJS server...');

const server = spawn('npm', ['run', 'start:dev'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Test if server is running after 10 seconds
setTimeout(() => {
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/swagger-ui',
    method: 'GET'
  }, (res) => {
    console.log(`Server is running! Status: ${res.statusCode}`);
    process.exit(0);
  });
  
  req.on('error', (err) => {
    console.error(`Server test failed: ${err.message}`);
    process.exit(1);
  });
  
  req.end();
}, 10000);