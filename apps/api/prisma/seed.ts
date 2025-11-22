import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const password = await bcrypt.hash('Password123!', 12);

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      username: 'john_doe',
      passwordHash: password,
      emailVerified: true,
      bio: 'Fitness enthusiast on a weight loss journey!',
      profile: {
        create: {
          currentWeight: 188.5, // 85.5 kg = 188.5 lbs
          goalWeight: 165.3, // 75.0 kg = 165.3 lbs
          height: 69, // 175 cm = 69 inches (5'9")
          activityLevel: 'moderate',
          gender: 'male',
          preferredUnits: 'imperial',
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      username: 'sarah_smith',
      passwordHash: password,
      emailVerified: true,
      bio: 'Health coach and weight loss supporter',
      profile: {
        create: {
          currentWeight: 149.9, // 68.0 kg = 149.9 lbs
          goalWeight: 136.7, // 62.0 kg = 136.7 lbs
          height: 65, // 165 cm = 65 inches (5'5")
          activityLevel: 'active',
          gender: 'female',
          preferredUnits: 'imperial',
        },
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'mike@example.com',
      username: 'mike_wilson',
      passwordHash: password,
      emailVerified: true,
      bio: 'Started my journey 3 months ago!',
      profile: {
        create: {
          currentWeight: 203.5, // 92.3 kg = 203.5 lbs
          goalWeight: 176.4, // 80.0 kg = 176.4 lbs
          height: 71, // 180 cm = 71 inches (5'11")
          activityLevel: 'light',
          gender: 'male',
          preferredUnits: 'imperial',
        },
      },
    },
  });

  console.log('✅ Created users:', user1.username, user2.username, user3.username);

  // Create weight entries
  const now = new Date();
  const weightEntries = [];

  // User 1 weight entries (trending down)
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    weightEntries.push({
      userId: user1.id,
      weight: 188.5 - (30 - i) * 0.33, // Losing ~0.33 lbs per day (0.15 kg)
      recordedAt: date,
      notes: i === 30 ? 'Starting my journey!' : i === 0 ? 'Feeling great!' : undefined,
    });
  }

  // User 2 weight entries (steady)
  for (let i = 20; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    weightEntries.push({
      userId: user2.id,
      weight: 149.9 - (20 - i) * 0.22, // Losing ~0.22 lbs per day (0.1 kg)
      recordedAt: date,
    });
  }

  await prisma.weightEntry.createMany({ data: weightEntries });
  console.log(`✅ Created ${weightEntries.length} weight entries`);

  // Create a team
  const team = await prisma.team.create({
    data: {
      name: 'Fitness Warriors',
      description: 'A supportive community for weight loss and healthy living',
      createdBy: user1.id,
      isPublic: true,
      joinCode: 'FW2024',
      members: {
        create: [
          {
            userId: user1.id,
            role: 'admin',
            startingWeight: 188.5, // 85.5 kg
            weightLossGoal: 23.1, // 10.5 kg
          },
          {
            userId: user2.id,
            role: 'moderator',
            startingWeight: 149.9, // 68.0 kg
            weightLossGoal: 13.2, // 6.0 kg
          },
          {
            userId: user3.id,
            role: 'member',
            startingWeight: 203.5, // 92.3 kg
            weightLossGoal: 27.1, // 12.3 kg
          },
        ],
      },
    },
  });

  console.log('✅ Created team:', team.name);

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      authorId: user1.id,
      teamId: team.id,
      title: 'My First Week Progress',
      content: 'Just completed my first week! Down 4.4 lbs already. Feeling motivated!',
      postType: 'milestone',
      visibility: 'team',
      likesCount: 5,
      tags: ['milestone', 'motivation'],
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: user2.id,
      title: 'Healthy Breakfast Recipe',
      content:
        'Sharing my go-to breakfast: overnight oats with berries and almond butter. Only 300 calories and keeps me full until lunch!',
      postType: 'recipe',
      visibility: 'public',
      likesCount: 12,
      tags: ['recipe', 'breakfast', 'healthy'],
    },
  });

  console.log('✅ Created posts');

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        postId: post1.id,
        authorId: user2.id,
        content: 'Great progress! Keep it up!',
      },
      {
        postId: post1.id,
        authorId: user3.id,
        content: "Inspiring! What's your secret?",
      },
      {
        postId: post2.id,
        authorId: user1.id,
        content: 'This looks delicious! Will try tomorrow.',
      },
    ],
  });

  await prisma.post.update({
    where: { id: post1.id },
    data: { commentsCount: 2 },
  });

  await prisma.post.update({
    where: { id: post2.id },
    data: { commentsCount: 1 },
  });

  console.log('✅ Created comments');

  // Create a challenge
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const challenge = await prisma.challenge.create({
    data: {
      teamId: team.id,
      name: '30-Day Weight Loss Challenge',
      description: "Let's support each other in losing weight over the next 30 days!",
      challengeType: 'weight_loss_percentage',
      startDate,
      endDate,
      targetValue: 5.0, // 5% weight loss
      rewardPoints: 100,
      createdBy: user1.id,
      participants: {
        create: [
          {
            userId: user1.id,
            startingValue: 188.5, // 85.5 kg
            currentValue: 188.5,
            targetValue: 179.0, // 81.2 kg
          },
          {
            userId: user2.id,
            startingValue: 149.9, // 68.0 kg
            currentValue: 149.9,
            targetValue: 142.4, // 64.6 kg
          },
          {
            userId: user3.id,
            startingValue: 203.5, // 92.3 kg
            currentValue: 203.5,
            targetValue: 193.3, // 87.7 kg
          },
        ],
      },
    },
  });

  console.log('✅ Created challenge:', challenge.name);

  // Create achievements
  await prisma.achievement.createMany({
    data: [
      {
        name: 'First Weigh-In',
        description: 'Recorded your first weight entry',
        points: 10,
        criteriaType: 'weight_loss',
        criteriaValue: { entries: 1 },
      },
      {
        name: '7-Day Streak',
        description: 'Logged weight for 7 consecutive days',
        points: 25,
        criteriaType: 'consistency',
        criteriaValue: { days: 7 },
      },
      {
        name: '11 lbs Lost',
        description: 'Lost 11 pounds',
        points: 50,
        criteriaType: 'weight_loss',
        criteriaValue: { amount: 11 },
      },
      {
        name: 'Team Player',
        description: 'Joined your first team',
        points: 15,
        criteriaType: 'social',
        criteriaValue: { teams: 1 },
      },
      {
        name: 'Challenge Completed',
        description: 'Completed your first challenge',
        points: 100,
        criteriaType: 'challenge_completion',
        criteriaValue: { challenges: 1 },
      },
    ],
  });

  console.log('✅ Created achievements');

  // Award some achievements
  const firstWeighIn = await prisma.achievement.findUnique({
    where: { name: 'First Weigh-In' },
  });

  const teamPlayer = await prisma.achievement.findUnique({
    where: { name: 'Team Player' },
  });

  if (firstWeighIn && teamPlayer) {
    await prisma.userAchievement.createMany({
      data: [
        { userId: user1.id, achievementId: firstWeighIn.id },
        { userId: user2.id, achievementId: firstWeighIn.id },
        { userId: user1.id, achievementId: teamPlayer.id },
        { userId: user2.id, achievementId: teamPlayer.id },
        { userId: user3.id, achievementId: teamPlayer.id },
      ],
    });

    console.log('✅ Awarded achievements to users');
  }

  // Create a conversation for the team
  const conversation = await prisma.conversation.create({
    data: {
      isGroup: true,
      teamId: team.id,
      name: 'Fitness Warriors Chat',
      participants: {
        create: [{ userId: user1.id }, { userId: user2.id }, { userId: user3.id }],
      },
    },
  });

  // Add some messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: user1.id,
        content: 'Hey team! Excited to start this journey together!',
      },
      {
        conversationId: conversation.id,
        senderId: user2.id,
        content: "Welcome everyone! Let's support each other 💪",
      },
      {
        conversationId: conversation.id,
        senderId: user3.id,
        content: 'Looking forward to making progress with you all!',
      },
    ],
  });

  console.log('✅ Created conversation and messages');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Email: john@example.com');
  console.log('   Email: sarah@example.com');
  console.log('   Email: mike@example.com');
  console.log('   Password: Password123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
