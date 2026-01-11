// Seed script to populate database with test data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Gig = require('./models/Gig');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const seedDatabase = async () => {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Gig.deleteMany({});
        await Order.deleteMany({});

        // Create users
        console.log('Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.insertMany([
            {
                username: 'john_dev',
                email: 'john@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Full-stack web developer with 5 years of experience',
                skills: ['JavaScript', 'Node.js', 'React', 'MongoDB']
            },
            {
                username: 'jane_designer',
                email: 'jane@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Creative graphic designer specializing in branding',
                skills: ['Photoshop', 'Illustrator', 'Figma']
            },
            {
                username: 'mike_writer',
                email: 'mike@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Professional content writer and translator',
                skills: ['Content Writing', 'SEO', 'Translation']
            },
            {
                username: 'sarah_marketer',
                email: 'sarah@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Digital marketing expert with proven ROI',
                skills: ['SEO', 'Social Media', 'Google Ads']
            },
            {
                username: 'tom_client',
                email: 'tom@example.com',
                password: hashedPassword,
                role: 'client',
                bio: 'Looking for quality freelancers'
            }
        ]);

        console.log(`Created ${users.length} users`);

        // Create gigs
        console.log('Creating gigs...');
        const gigs = await Gig.insertMany([
            {
                title: 'I will create a professional React website',
                description: 'I will develop a modern, responsive website using React.js, Node.js, and MongoDB. The website will be fully responsive, SEO-friendly, and optimized for performance.',
                category: 'Web Development',
                price: 250,
                deliveryTime: 7,
                freelancerId: users[0]._id,
                tags: ['React', 'Node.js', 'JavaScript'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will design your company logo and branding',
                description: 'Professional logo design service with unlimited revisions until you are 100% satisfied. I will create a unique, memorable logo that represents your brand perfectly.',
                category: 'Graphic Design',
                price: 150,
                deliveryTime: 5,
                freelancerId: users[1]._id,
                tags: ['Logo Design', 'Branding'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will build a full-stack e-commerce website',
                description: 'Complete e-commerce solution with shopping cart, payment integration, user authentication, and admin panel. Built with modern technologies for scalability.',
                category: 'Web Development',
                price: 500,
                deliveryTime: 14,
                freelancerId: users[0]._id,
                tags: ['Node.js', 'React', 'HTML/CSS'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will write SEO-optimized blog posts',
                description: 'High-quality, engaging blog content optimized for search engines. Every article is researched, well-structured, and tailored to your target audience.',
                category: 'Writing & Translation',
                price: 80,
                deliveryTime: 3,
                freelancerId: users[2]._id,
                tags: ['SEO', 'Content Writing'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will manage your social media accounts',
                description: 'Complete social media management including content creation, posting schedule, engagement, and monthly analytics reports. Grow your online presence!',
                category: 'Digital Marketing',
                price: 300,
                deliveryTime: 30,
                freelancerId: users[3]._id,
                tags: ['Social Media', 'Content Creation'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will create stunning UI/UX designs',
                description: 'Modern, user-friendly UI/UX designs for web and mobile applications. Includes wireframes, mockups, and interactive prototypes.',
                category: 'Graphic Design',
                price: 200,
                deliveryTime: 7,
                freelancerId: users[1]._id,
                tags: ['UI Design', 'UX Design', 'Figma'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will develop a REST API with Node.js',
                description: 'Build a robust, scalable REST API using Node.js, Express, and MongoDB. Includes authentication, error handling, and documentation.',
                category: 'Web Development',
                price: 180,
                deliveryTime: 5,
                freelancerId: users[0]._id,
                tags: ['Node.js', 'JavaScript', 'API'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will translate your content to 5 languages',
                description: 'Professional translation services for English, Spanish, French, German, and Italian. Native speaker quality with cultural adaptation.',
                category: 'Writing & Translation',
                price: 120,
                deliveryTime: 4,
                freelancerId: users[2]._id,
                tags: ['Translation', 'Languages'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will run Google Ads campaigns for your business',
                description: 'Expert Google Ads campaign management to maximize your ROI. Includes keyword research, ad creation, and monthly optimization.',
                category: 'Digital Marketing',
                price: 400,
                deliveryTime: 30,
                freelancerId: users[3]._id,
                tags: ['Google Ads', 'PPC', 'Marketing'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will create responsive landing pages',
                description: 'High-converting landing pages built with HTML, CSS, and JavaScript. Mobile-friendly, fast-loading, and optimized for conversions.',
                category: 'Web Development',
                price: 150,
                deliveryTime: 4,
                freelancerId: users[0]._id,
                tags: ['HTML/CSS', 'JavaScript', 'Landing Page'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will design business cards and flyers',
                description: 'Professional print-ready designs for business cards, flyers, and brochures. Multiple concepts provided with unlimited revisions.',
                category: 'Graphic Design',
                price: 100,
                deliveryTime: 3,
                freelancerId: users[1]._id,
                tags: ['Print Design', 'Business Cards'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will write technical documentation',
                description: 'Clear, comprehensive technical documentation for software products. Includes API docs, user guides, and installation instructions.',
                category: 'Writing & Translation',
                price: 200,
                deliveryTime: 7,
                freelancerId: users[2]._id,
                tags: ['Technical Writing', 'Documentation'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will optimize your website for SEO',
                description: 'Complete SEO optimization including on-page SEO, technical SEO, keyword research, and competitor analysis. Improve your search rankings!',
                category: 'Digital Marketing',
                price: 350,
                deliveryTime: 10,
                freelancerId: users[3]._id,
                tags: ['SEO', 'Website Optimization'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will build a mobile-responsive portfolio website',
                description: 'Showcase your work with a stunning portfolio website. Includes gallery, contact form, and blog section. Fully responsive and SEO-optimized.',
                category: 'Web Development',
                price: 220,
                deliveryTime: 6,
                freelancerId: users[0]._id,
                tags: ['HTML/CSS', 'JavaScript', 'Portfolio'],
                images: [],
                status: 'active'
            },
            {
                title: 'I will create animated explainer videos',
                description: 'Engaging 2D animated explainer videos for your business. Includes script writing, voiceover, and background music.',
                category: 'Video & Animation',
                price: 450,
                deliveryTime: 10,
                freelancerId: users[1]._id,
                tags: ['Animation', 'Video Production'],
                images: [],
                status: 'active'
            }
        ]);

        console.log(`Created ${gigs.length} gigs`);

        // Create some sample orders
        console.log('Creating orders...');
        const orders = await Order.insertMany([
            {
                gigId: gigs[0]._id,
                clientId: users[4]._id,
                freelancerId: users[0]._id,
                status: 'in-progress',
                totalPrice: gigs[0].price,
                requirements: 'Need a website for my startup. Looking for modern design with user authentication.',
                deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                orderDate: new Date()
            },
            {
                gigId: gigs[1]._id,
                clientId: users[4]._id,
                freelancerId: users[1]._id,
                status: 'completed',
                totalPrice: gigs[1].price,
                requirements: 'Logo for a tech startup. Prefer modern, minimalist style.',
                deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log(`Created ${orders.length} orders`);

        console.log('\n✅ Database seeded successfully!');
        console.log(`\nTest accounts (password: password123):`);
        console.log('- john_dev@example.com (freelancer)');
        console.log('- jane_designer@example.com (freelancer)');
        console.log('- mike_writer@example.com (freelancer)');
        console.log('- sarah_marketer@example.com (freelancer)');
        console.log('- tom_client@example.com (client)');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
