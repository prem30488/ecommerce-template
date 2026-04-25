require('dotenv').config();
const db = require('../models');

const sections = [
  { componentName: 'HomeVideo', displayName: 'Hero Video Banner', order: 1 },
  { componentName: 'FeatureBar', displayName: 'Feature Highlights Bar', order: 2 },
  { componentName: 'WelcomeSection', displayName: 'Welcome/Intro Section', order: 3 },
  { componentName: 'OurServices', displayName: 'Services/Categories Grid', order: 4 },
  { componentName: 'InstagramVideoCarousel', displayName: 'Instagram Reels Carousel', order: 5 },
  { componentName: 'SaleSlider', displayName: 'Current Sales Slider', order: 6 },
  { componentName: 'WeeklyHighlight', displayName: 'Weekly Highlight Product', order: 7 },
  { componentName: 'BestSellingCarousel', displayName: 'Best Sellers Carousel', order: 8 },
  { componentName: 'FeatureProductsCarousel', displayName: 'Featured Products Carousel', order: 9 },
  { componentName: 'PromoSlider', displayName: 'Promotional Banner Slider', order: 10 },
  { componentName: 'Testimonials', displayName: 'Customer Testimonials', order: 11 },
  { componentName: 'OnlineSupport', displayName: 'Online Support Info', order: 12 }
];

async function seed() {
  try {
    await db.sequelize.sync();
    for (const section of sections) {
      await db.HomeSection.findOrCreate({
        where: { componentName: section.componentName },
        defaults: section
      });
    }
    console.log('Home sections seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding home sections:', error);
    process.exit(1);
  }
}

seed();
