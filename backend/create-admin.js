const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@eventpass.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
      },
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@eventpass.com');
    console.log('Password: AdminPassword123!');
    console.log('User ID:', adminUser.id);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Admin user already exists with this email');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
