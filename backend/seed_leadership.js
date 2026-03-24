const db = require('./models');

const seedLeadership = async () => {
  try {
    await db.LeadershipTeam.sync();
    const count = await db.LeadershipTeam.count();
    
    if (count === 0) {
      const defaultLeaders = [
        { name: 'Jaymin Patel', designation: 'Partner', image: '/images/leadership/jaymin_patel.png', order: 1 },
        { name: 'Nikul Sisodiya', designation: 'Partner', image: '/images/leadership/nikul_sisodiya.png', order: 2 },
        { name: 'Parth Trivedi', designation: 'CEO', image: '/images/leadership/parth_trivedi.png', order: 3 },
        { name: 'Miraj Trivedi', designation: 'VP', image: '/images/leadership/miraj_trivedi.png', order: 4 },
        { name: 'Jay Patel', designation: 'VP', image: '/images/leadership/jay_patel.png', order: 5 }
      ];
      
      for (const leader of defaultLeaders) {
        await db.LeadershipTeam.create(leader);
      }
      console.log('Seeded Leadership Team successfully.');
    } else {
      console.log('Leadership Team already seeded.');
    }
  } catch (error) {
    console.error('Error seeding leadership team:', error);
  } finally {
    process.exit(0);
  }
};

seedLeadership();
