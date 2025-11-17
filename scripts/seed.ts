import mongoose from 'mongoose';
import { User } from '../lib/db/models/User';
import { Activity } from '../lib/db/models/Activity';
import { Option } from '../lib/db/models/Option';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@127.0.0.1:27017/voting_sa';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Activity.deleteMany({});
    await Option.deleteMany({});
    console.log('Cleared successfully');

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      student_id: '108000000',
      remark: 'admin',
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('Admin user created:', admin.student_id);

    // Create sample users
    console.log('Creating sample users...');
    const sampleUsers = await User.insertMany([
      { student_id: '108000001', created_at: new Date(), updated_at: new Date() },
      { student_id: '108000002', created_at: new Date(), updated_at: new Date() },
      { student_id: '108000003', created_at: new Date(), updated_at: new Date() },
    ]);
    console.log('Sample users created:', sampleUsers.length);

    // Create sample activity
    console.log('Creating sample activity...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const activity = await Activity.create({
      name: '第 30 屆學生會正副會長選舉',
      type: 'candidate',
      rule: 'choose_all',
      open_from: now,
      open_to: nextWeek,
      users: [],
      options: [],
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('Activity created:', activity.name);

    // Create sample candidates
    console.log('Creating sample candidates...');
    const candidates = [
      {
        activity_id: activity._id,
        type: 'candidate',
        candidate: {
          name: '王小明',
          department: '人文社會學院學士班 20 級',
          college: '人文社會學院',
          avatar_url: 'https://i.imgur.com/placeholder1.jpg',
          personal_experiences: [
            '國立清華大學105學年度下學期-書卷獎',
            '學生會第29屆秘書部部員',
          ],
          political_opinions: [
            '1. 履行會長之職責',
            '2. 持續關注學生感興趣的校內議題',
            '3. 促進學生與學校之間的溝通',
          ],
        },
        vice1: {
          name: '陳小明',
          department: '科技管理學院學士班 22 級',
          college: '科技管理學院',
          avatar_url: 'https://i.imgur.com/placeholder2.jpg',
          personal_experiences: [
            '國立清華大學轉學生聯誼會-活動組長',
          ],
        },
        vice2: {
          name: '劉曉明',
          department: '教育與學習科技學系 24 級',
          college: '教育學院',
          avatar_url: 'https://i.imgur.com/placeholder3.jpg',
          personal_experiences: [
            '國立清華大學學生會第29屆秘書部-部員',
          ],
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        activity_id: activity._id,
        type: 'candidate',
        candidate: {
          name: '李大華',
          department: '電機工程學系 21 級',
          college: '電機資訊學院',
          avatar_url: 'https://i.imgur.com/placeholder4.jpg',
          personal_experiences: [
            '學生議會第29屆議員',
            '資訊系學會會長',
          ],
          political_opinions: [
            '1. 強化學生權益保障',
            '2. 推動校園數位化',
            '3. 建立透明的學生自治制度',
          ],
        },
        vice1: {
          name: '張美麗',
          department: '資訊工程學系 23 級',
          college: '電機資訊學院',
          avatar_url: 'https://i.imgur.com/placeholder5.jpg',
          personal_experiences: [
            '程式設計社社長',
          ],
        },
        vice2: {
          name: '林志明',
          department: '工業工程與工程管理學系 22 級',
          college: '工學院',
          avatar_url: 'https://i.imgur.com/placeholder6.jpg',
          personal_experiences: [
            '學生會第29屆活動部副部長',
          ],
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const options = await Option.insertMany(candidates);
    console.log('Candidates created:', options.length);

    // Update activity with option IDs
    await Activity.findByIdAndUpdate(activity._id, {
      $set: { options: options.map(o => o._id) },
    });
    console.log('Activity updated with option IDs');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('- Admin: 108000000');
    console.log('- Users: 108000001, 108000002, 108000003');
    console.log('\nYou can login with mock OAuth using any of these student IDs.');
    console.log('Example: http://localhost:3000/api/auth/mock-login?student_id=108000000');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

seed();
