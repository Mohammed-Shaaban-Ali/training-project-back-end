import { Module, Global } from '@nestjs/common';
import { Utils } from './utils';

@Global()
@Module({
  exports: [Utils],
  providers: [Utils]
})
export class GlobalUtilitiesModule {}
