/**
 * Çalıştırma: npx ts-node -r tsconfig-paths/register src/seed.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ['admin', 'agent'], default: 'agent' },
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

const seedUsers = [
  { fullName: 'Ali Yılmaz', email: 'ali@realityflow.com', role: 'agent' },
  { fullName: 'Ayşe Demir', email: 'ayse@realityflow.com', role: 'agent' },
  { fullName: 'Mehmet Kaya', email: 'mehmet@realityflow.com', role: 'agent' },
  { fullName: 'Admin User', email: 'admin@realityflow.com', role: 'admin' },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI bulunamadı! .env dosyasını kontrol et.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB bağlantısı kuruldu.');

  for (const userData of seedUsers) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      console.log(`⏭️  Zaten var: ${userData.fullName} (${userData.email})`);
    } else {
      await User.create(userData);
      console.log(`✅ Oluşturuldu: ${userData.fullName} (${userData.email})`);
    }
  }

  await mongoose.disconnect();
  console.log('🏁 Seed tamamlandı.');
}

seed().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
