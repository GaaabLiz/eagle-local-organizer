import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock eagleApiService before importing logService
jest.mock('../../src/services/eagleApiService', () => ({
  getPluginPath: () => '',
}));

describe('logService', () => {
  let tmpDir: string;
  let logFilePath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'log-test-'));
    logFilePath = path.join(tmpDir, 'sidecar.log');
    // Reset module to get fresh state
    jest.resetModules();
    // Override getPluginPath for this test
    jest.doMock('../../src/services/eagleApiService', () => ({
      getPluginPath: () => tmpDir,
    }));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should write info log', async () => {
    const { logInfo, getLogs } = await import('../../src/services/logService');
    logInfo('test message');
    const logs = getLogs();
    expect(logs).toContain('test message');
    expect(logs).toContain('[INFO]');
  });

  it('should write warn log', async () => {
    const { logWarn, getLogs } = await import('../../src/services/logService');
    logWarn('warning message');
    const logs = getLogs();
    expect(logs).toContain('warning message');
    expect(logs).toContain('[WARN]');
  });

  it('should write error log', async () => {
    const { logError, getLogs } = await import('../../src/services/logService');
    logError('error message', new Error('test error'));
    const logs = getLogs();
    expect(logs).toContain('error message');
    expect(logs).toContain('[ERROR]');
  });

  it('should clear logs', async () => {
    const { logInfo, clearLogs, getLogs } = await import('../../src/services/logService');
    logInfo('before clear');
    clearLogs();
    const logs = getLogs();
    expect(logs).not.toContain('before clear');
  });
});
