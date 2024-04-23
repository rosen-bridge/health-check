import { BitcoinEsploraScannerHealthCheck } from '../../lib';

export class TestBitcoinEsploraScannerHealthCheck extends BitcoinEsploraScannerHealthCheck {
  getClient = () => this.client;
}
