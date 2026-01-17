// Using built-in fetch in Node.js 18+
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function registerUser(email, password, displayName) {
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        displayName
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`User ${email} registered successfully`);
      // Activate the user directly in DB
      await prisma.user.update({
        where: { email },
        data: { status: 'ACTIVE' }
      });
      console.log(`User ${email} activated`);
    } else {
      console.log(`Failed to register ${email}:`, data);
    }
  } catch (error) {
    console.error(`Error registering ${email}:`, error);
  }
}

async function main() {
  // Activate existing users if they exist
  const freeUser = await prisma.user.findUnique({
    where: { email: 'free@example.com' }
  });
  if (freeUser) {
    await prisma.user.update({
      where: { email: 'free@example.com' },
      data: { status: 'ACTIVE' }
    });
    console.log('Free user activated');
  } else {
    await registerUser('free@example.com', 'password123', 'Free User');
  }

  const paidUser = await prisma.user.findUnique({
    where: { email: 'paid@example.com' }
  });
  if (paidUser) {
    await prisma.user.update({
      where: { email: 'paid@example.com' },
      data: { status: 'ACTIVE', subscriptionStatus: 'PAID' }
    });
    console.log('Paid user activated and upgraded');
  } else {
    await registerUser('paid@example.com', 'password123', 'Paid User');
    // After registration, update subscription
    await prisma.user.update({
      where: { email: 'paid@example.com' },
      data: { subscriptionStatus: 'PAID' }
    });
    console.log('Paid user subscription set');
  }

  await prisma.$disconnect();
}

main();