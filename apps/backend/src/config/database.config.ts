import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  MongooseModule,
  MongooseModuleAsyncOptions,
} from '@nestjs/mongoose';

export const DATABASE_CONFIG: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
};
