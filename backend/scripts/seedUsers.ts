import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../src/models/User';

const MONGODB_URI = 'mongodb+srv://galamkhoahoc4_db_user:96AQeXy2xKdFkjs5@glkh.8zl4kbz.mongodb.net/?appName=GLKH';

const users = [
  { email: 'guest@goodviet.glkh.vn', password: 'Guest2026#', fullName: 'Guest Account', role: 'user', accountType: 'temporary' },
  { email: 'admin@goodviet.glkh.vn', password: 'Admin2026#', fullName: 'Admin', role: 'admin', accountType: 'standard' },
  { email: 'dpquy@glkh.vn', password: 'Dpquy2005#', fullName: 'Dpquy', role: 'user', accountType: 'standard' },
  { email: 'tkduy@glkh.vn', password: 'Tkduy2005#', fullName: 'Tkduy', role: 'user', accountType: 'standard' },
  { email: 'pdxthien@glkh.vn', password: 'Pdxthien2005#', fullName: 'Pdxthien', role: 'user', accountType: 'standard' },
  { email: 'bqnhai@glkh.vn', password: 'Bqnhai2005#', fullName: 'Bqnhai', role: 'user', accountType: 'standard' },
  { email: 'dkbang@glkh.vn', password: 'Dkbang2005#', fullName: 'Dkbang', role: 'user', accountType: 'standard' },
  { email: 'tnanh@glkh.vn', password: 'Tnanh2005#', fullName: 'Tnanh', role: 'user', accountType: 'standard' },
  { email: 'ndacuong@goodviet.glkh.vn', password: 'Ndacuong2026#', fullName: 'Ndacuong', role: 'user', accountType: 'standard' },
  { email: 'npbnghi@goodviet.glkh.vn', password: 'Npbnghi2026#', fullName: 'Npbnghi', role: 'user', accountType: 'standard' },
  { email: 'ttanh@goodviet.glkh.vn', password: 'Ttanh2026#', fullName: 'Ttanh', role: 'user', accountType: 'standard' },
  { email: 'ltathu@goodviet.glkh.vn', password: 'Ltathu2026#', fullName: 'Ltathu', role: 'user', accountType: 'standard' },
  { email: 'lhphuc@goodviet.glkh.vn', password: 'Lhphuc2026#', fullName: 'Lhphuc', role: 'user', accountType: 'standard' },
  { email: 'tkduy@goodviet.glkh.vn', password: 'Tkduy2026#', fullName: 'Tkduy', role: 'user', accountType: 'standard' },
  { email: 'dpquy@goodviet.glkh.vn', password: 'Dpquy2026#', fullName: 'Dpquy', role: 'user', accountType: 'standard' },
  { email: 'innostar@goodviet.glkh.vn', password: 'Innostar2026#', fullName: 'Innostar', role: 'user', accountType: 'temporary' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'goodviet' });
    console.log('Connected to MongoDB (goodviet)');

    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.findOneAndUpdate(
        { email: u.email },
        { 
          email: u.email,
          passwordHash,
          fullName: u.fullName,
          role: u.role,
          accountType: u.accountType,
          isActive: true,
          verifiedEmail: true
        },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`Upserted user: ${u.email}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
