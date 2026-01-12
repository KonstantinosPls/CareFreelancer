// Seed script to populate database with test data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Gig = require('./models/Gig');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

/**
 * Copy sample images to uploads folder
 * This ensures teammates have the same demo images when they run the seed
 */
const setupSampleImages = () => {
    const sampleDir = path.join(__dirname, 'public', 'sample-images');
    const uploadsDir = path.join(__dirname, 'public', 'uploads');

    // Create upload directories if they don't exist
    const dirs = [
        path.join(uploadsDir, 'profiles'),
        path.join(uploadsDir, 'gigs')
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });

    // Copy sample profile images
    const profileSampleDir = path.join(sampleDir, 'profiles');
    const profileUploadDir = path.join(uploadsDir, 'profiles');

    if (fs.existsSync(profileSampleDir)) {
        const profileImages = fs.readdirSync(profileSampleDir);
        profileImages.forEach(img => {
            const src = path.join(profileSampleDir, img);
            const dest = path.join(profileUploadDir, img);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                console.log(`Copied profile image: ${img}`);
            }
        });
    }

    // Copy sample gig images
    const gigSampleDir = path.join(sampleDir, 'gigs');
    const gigUploadDir = path.join(uploadsDir, 'gigs');

    if (fs.existsSync(gigSampleDir)) {
        const gigImages = fs.readdirSync(gigSampleDir);
        gigImages.forEach(img => {
            const src = path.join(gigSampleDir, img);
            const dest = path.join(gigUploadDir, img);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                console.log(`Copied gig image: ${img}`);
            }
        });
    }
};

/**
 * Check if a sample image exists, return path or placeholder
 */
const getImagePath = (type, filename) => {
    const localPath = `/uploads/${type}/${filename}`;
    const fullPath = path.join(__dirname, 'public', localPath);

    if (fs.existsSync(fullPath)) {
        return localPath;
    }

    // Return placeholder image URLs if local images don't exist
    // These are free placeholder services that work without setup
    if (type === 'profiles') {
        return `https://ui-avatars.com/api/?name=${filename.replace('.jpg', '')}&background=0d6efd&color=fff&size=200`;
    } else {
        // Placeholder for gig images
        return `https://picsum.photos/seed/${filename}/600/400`;
    }
};

const seedDatabase = async () => {
    try {
        // Setup sample images first
        console.log('Setting up sample images...');
        setupSampleImages();

        // Clear existing data
        console.log('\nClearing existing data...');
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
                skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
                profileImage: getImagePath('profiles', 'john.jpg'),
                isEmailVerified: true
            },
            {
                username: 'jane_designer',
                email: 'jane@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Creative graphic designer specializing in branding',
                skills: ['Photoshop', 'Illustrator', 'Figma'],
                profileImage: getImagePath('profiles', 'jane.jpg'),
                isEmailVerified: true
            },
            {
                username: 'mike_writer',
                email: 'mike@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Professional content writer and translator',
                skills: ['Content Writing', 'SEO', 'Translation'],
                profileImage: getImagePath('profiles', 'mike.jpg'),
                isEmailVerified: true
            },
            {
                username: 'sarah_marketer',
                email: 'sarah@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Digital marketing expert with proven ROI',
                skills: ['SEO', 'Social Media', 'Google Ads'],
                profileImage: getImagePath('profiles', 'sarah.jpg'),
                isEmailVerified: true
            },
            {
                username: 'tom_client',
                email: 'tom@example.com',
                password: hashedPassword,
                role: 'client',
                bio: 'Looking for quality freelancers',
                profileImage: getImagePath('profiles', 'tom.jpg'),
                isEmailVerified: true
            }
        ]);

        console.log(`Created ${users.length} users`);

        // Create gigs with sample images
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
                images: [getImagePath('gigs', 'react-website.jpg')],
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
                images: [getImagePath('gigs', 'logo-design.jpg')],
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
                images: [getImagePath('gigs', 'ecommerce.jpg')],
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
                images: [getImagePath('gigs', 'blog-writing.jpg')],
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
                images: [getImagePath('gigs', 'social-media.jpg')],
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
                images: [getImagePath('gigs', 'ui-ux.jpg')],
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
                images: [getImagePath('gigs', 'api-dev.jpg')],
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
                images: [getImagePath('gigs', 'translation.jpg')],
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
                images: [getImagePath('gigs', 'google-ads.jpg')],
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
                images: [getImagePath('gigs', 'landing-page.jpg')],
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
                images: [getImagePath('gigs', 'print-design.jpg')],
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
                images: [getImagePath('gigs', 'tech-docs.jpg')],
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
                images: [getImagePath('gigs', 'seo.jpg')],
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
                images: [getImagePath('gigs', 'portfolio.jpg')],
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
                images: [getImagePath('gigs', 'animation.jpg')],
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
        console.log('\n📸 Note: Images are using placeholder URLs.');
        console.log('   To use custom images, add them to:');
        console.log('   - public/sample-images/profiles/ (for profile photos)');
        console.log('   - public/sample-images/gigs/ (for gig images)');
        console.log('   Then re-run: node seed.js\n');
        console.log('Test accounts (password: password123):');
        console.log('- john@example.com (freelancer)');
        console.log('- jane@example.com (freelancer)');
        console.log('- mike@example.com (freelancer)');
        console.log('- sarah@example.com (freelancer)');
        console.log('- tom@example.com (client)');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
