import {
  AbstractLogger,
  AbstractLoggerFactory,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import { LogLevelHealthCheck } from '../lib';

export class TestLoggerFactory extends AbstractLoggerFactory {
  constructor() {
    super();
  }

  getDefaultLogger = (): AbstractLogger => {
    return new DummyLogger();
  };

  getLogger = (): AbstractLogger => {
    return new DummyLogger();
  };
}

export class TestLogLevelHealthCheck extends LogLevelHealthCheck {
  getTimes = () => this.times;

  getLastMessage = () => this.lastMessage;
}
