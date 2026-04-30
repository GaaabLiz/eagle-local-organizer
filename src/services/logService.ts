import fs from 'fs';
import path from 'path';
import { getPluginPath } from './eagleApiService';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const MAX_LOG_SIZE = 1024 * 1024; // 1MB
const LOG_FILE_NAME = 'sidecar.log';

function getLogDir(): string {
  const pluginPath = getPluginPath();
  const base = pluginPath || path.join(
    (typeof process !== 'undefined' && process.env?.HOME) || '/tmp',
    '.eagle-local-organizer'
  );
  return path.join(base, 'data', 'logs');
}

function getLogFilePath(): string {
  return path.join(getLogDir(), LOG_FILE_NAME);
}

function ensureLogDir(): void {
  const dir = getLogDir();
  fs.mkdirSync(dir, { recursive: true });
}

function rotateIfNeeded(): void {
  const logPath = getLogFilePath();
  try {
    if (!fs.existsSync(logPath)) return;
    const stat = fs.statSync(logPath);
    if (stat.size >= MAX_LOG_SIZE) {
      const rotatedPath = logPath + '.old';
      // Remove previous rotated file if exists
      if (fs.existsSync(rotatedPath)) {
        fs.unlinkSync(rotatedPath);
      }
      fs.renameSync(logPath, rotatedPath);
    }
  } catch {
    // Silent — rotation failure is non-critical
  }
}

function writeLog(level: LogLevel, message: string): void {
  try {
    ensureLogDir();
    rotateIfNeeded();
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(getLogFilePath(), line, 'utf-8');
  } catch {
    // Silent — logging should never crash the plugin
  }
}

/**
 * Log an informational message.
 */
export function logInfo(message: string): void {
  writeLog('INFO', message);
}

/**
 * Log a warning message.
 */
export function logWarn(message: string): void {
  writeLog('WARN', message);
}

/**
 * Log an error message, optionally with the error object.
 */
export function logError(message: string, err?: unknown): void {
  const detail = err instanceof Error ? ` | ${err.message}` : '';
  writeLog('ERROR', `${message}${detail}`);
}

/**
 * Read the current log file contents for debugging.
 */
export function getLogs(): string {
  try {
    const logPath = getLogFilePath();
    if (!fs.existsSync(logPath)) return '';
    return fs.readFileSync(logPath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Clear the log file.
 */
export function clearLogs(): void {
  try {
    const logPath = getLogFilePath();
    if (fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '', 'utf-8');
    }
  } catch {
    // Silent
  }
}
