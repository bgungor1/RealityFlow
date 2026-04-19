import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONFIG } from './config/database.config.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [
    // .env dosyasını oku
    ConfigModule.forRoot({ isGlobal: true }),

    // MongoDB Atlas bağlantısı
    MongooseModule.forRootAsync(DATABASE_CONFIG),

    // Domain modülleri
    UserModule,
  ],
})
export class AppModule {}
