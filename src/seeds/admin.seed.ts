import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const adminEmail = 'admin@mail.com';

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = userRepository.create({
    name: 'System Admin',
    email: adminEmail,
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  await userRepository.save(admin);

  console.log('🚀 Admin user created');
}
