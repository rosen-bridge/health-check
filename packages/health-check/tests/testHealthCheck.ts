import { HealthCheck } from '../lib';

export class TestHealthCheck extends HealthCheck {
  constructor() {
    super(async () => {});
  }

  getParams = () => {
    return [...this.params];
  };
}
