import { LogLevelHealthCheck } from '../lib';

class TestLogLevelHealthCheck extends LogLevelHealthCheck {
  getTimes = () => this.times;

  getLastMessage = () => this.lastMessage;
}

export default TestLogLevelHealthCheck;
