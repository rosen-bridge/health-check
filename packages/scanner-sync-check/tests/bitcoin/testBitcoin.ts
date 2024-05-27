import { BitcoinEsploraScannerHealthCheck } from '../../lib';
import { BitcoinRPCScannerHealthCheck } from '../../lib';

export class TestBitcoinEsploraScannerHealthCheck extends BitcoinEsploraScannerHealthCheck {
  getClient = () => this.client;
}
export class TestBitcoinRPCScannerHealthCheck extends BitcoinRPCScannerHealthCheck {
  getClient = () => this.client;
}
