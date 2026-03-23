import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { Rule } from '../models/Rule.js';
import { Flow } from '../models/Flow.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([User.deleteMany({}), Workspace.deleteMany({}), Rule.deleteMany({}), Flow.deleteMany({})]);

  const passwordHash = await bcrypt.hash('Password123!', Number(process.env.BCRYPT_ROUNDS || 10));

  const user = await User.create({
    name: 'Demo Owner',
    email: 'owner@chatnest.app',
    passwordHash,
    role: 'user',
    plan: 'pro',
    messageCreditsRemaining: 10000
  });

  const workspace = await Workspace.create({
    ownerId: user._id,
    name: 'Acme Wellness',
    whatsappProvider: 'mock',
    phoneNumber: '+15550001111'
  });

  await Rule.create({
    workspaceId: workspace._id,
    triggerType: 'keyword',
    triggerValue: 'menu',
    responseType: 'text',
    responseText: 'Reply 1 for Services, 2 for Pricing, 3 for Booking.',
    isActive: true
  });

  await Flow.create({
    workspaceId: workspace._id,
    name: 'Default Bot',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        type: 'menu',
        prompt: 'Welcome to Acme Wellness. Reply 1 Services, 2 Pricing, 3 Appointment',
        options: [
          { key: '1', label: 'Services', nextId: 'services' },
          { key: '2', label: 'Pricing', nextId: 'pricing' },
          { key: '3', label: 'Appointment', nextId: 'appointment' }
        ]
      },
      { id: 'services', type: 'message', prompt: 'We offer skincare, massage, and wellness plans.', config: { nextId: 'end' } },
      { id: 'pricing', type: 'message', prompt: 'Our starter package begins at $49.', config: { nextId: 'end' } },
      { id: 'appointment', type: 'appointment', prompt: 'Share your appointment date/time in ISO format.' },
      { id: 'end', type: 'end', prompt: 'Thanks for contacting us.' }
    ],
    isActive: true
  });

  console.log('Seed complete');
  console.log('Login:', user.email, '/ Password123!');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
