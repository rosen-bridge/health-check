import { HealthCheck } from '../src';

export class TestHealthCheck extends HealthCheck {
  getParams = () => {
    return [...this.params];
  };
}
