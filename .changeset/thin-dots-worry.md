---
'@rosen-bridge/scanner-sync-check': major
---

Network height is now obtained through a function provided to subclasses of AbstractScannerSyncHealthCheckParam. The only exception to this approach is the CardanoOgmiosScannerHealthCheck class, which handles it differently.
