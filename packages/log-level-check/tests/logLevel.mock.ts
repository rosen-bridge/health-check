import { LogLevelHealthCheck } from '../lib';

export class TestLogLevelHealthCheck extends LogLevelHealthCheck {
  getTimes = () => this.times;

  getLastMessage = () => this.lastMessage;
}
