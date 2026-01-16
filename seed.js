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
 * Setup upload directories
 */
const setupDirectories = () => {
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
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
};

/**
 * Get placeholder image for gig
 */
const getGigImage = (gigNumber) => {
    return `https://picsum.photos/seed/gig${gigNumber}/600/400`;
};

/**
 * Get profile image placeholder
 */
const getProfileImage = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d6efd&color=fff&size=200`;
};

const seedDatabase = async () => {
    try {
        // Setup directories
        console.log('Setting up directories...');
        setupDirectories();

        // Clear existing data
        console.log('\nClearing existing data...');
        await User.deleteMany({});
        await Gig.deleteMany({});
        await Order.deleteMany({});

        // Create users - 8 freelancers + 2 clients
        console.log('Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.insertMany([
            // Web Developers
            {
                username: 'alex_webdev',
                email: 'alex@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Senior full-stack developer with 7 years experience in React, Node.js and cloud technologies.',
                skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
                profileImage: getProfileImage('Alex Turner'),
                isEmailVerified: true
            },
            {
                username: 'emma_frontend',
                email: 'emma@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Frontend specialist creating beautiful, accessible user interfaces.',
                skills: ['HTML/CSS', 'JavaScript', 'React', 'Vue.js', 'Tailwind'],
                profileImage: getProfileImage('Emma Wilson'),
                isEmailVerified: true
            },
            // Graphic Designers
            {
                username: 'sophia_design',
                email: 'sophia@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Creative designer with a passion for branding and visual identity.',
                skills: ['Photoshop', 'Illustrator', 'Figma', 'Brand Design'],
                profileImage: getProfileImage('Sophia Martinez'),
                isEmailVerified: true
            },
            {
                username: 'james_creative',
                email: 'james@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Award-winning graphic designer specializing in UI/UX and print media.',
                skills: ['UI Design', 'Print Design', 'Adobe Creative Suite'],
                profileImage: getProfileImage('James Brown'),
                isEmailVerified: true
            },
            // Writers & Translators
            {
                username: 'olivia_writer',
                email: 'olivia@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Professional content writer with expertise in SEO and copywriting.',
                skills: ['Content Writing', 'SEO', 'Copywriting', 'Blogging'],
                profileImage: getProfileImage('Olivia Davis'),
                isEmailVerified: true
            },
            {
                username: 'lucas_translator',
                email: 'lucas@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Certified translator fluent in 5 languages with 10 years experience.',
                skills: ['Translation', 'Localization', 'Proofreading'],
                profileImage: getProfileImage('Lucas Garcia'),
                isEmailVerified: true
            },
            // Digital Marketers
            {
                username: 'mia_marketing',
                email: 'mia@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Digital marketing strategist helping businesses grow online.',
                skills: ['SEO', 'Google Ads', 'Social Media Marketing'],
                profileImage: getProfileImage('Mia Johnson'),
                isEmailVerified: true
            },
            // Video & Animation
            {
                username: 'noah_video',
                email: 'noah@example.com',
                password: hashedPassword,
                role: 'freelancer',
                bio: 'Video producer and animator creating engaging visual content.',
                skills: ['Video Editing', 'Motion Graphics', 'After Effects'],
                profileImage: getProfileImage('Noah Anderson'),
                isEmailVerified: true
            },
            // Clients
            {
                username: 'client_david',
                email: 'david@example.com',
                password: hashedPassword,
                role: 'client',
                bio: 'Startup founder looking for talented freelancers.',
                profileImage: getProfileImage('David Miller'),
                isEmailVerified: true
            },
            {
                username: 'client_rachel',
                email: 'rachel@example.com',
                password: hashedPassword,
                role: 'client',
                bio: 'Small business owner seeking quality digital services.',
                profileImage: getProfileImage('Rachel White'),
                isEmailVerified: true
            }
        ]);

        console.log(`Created ${users.length} users`);

        // Get user references by specialty
        const webDev1 = users[0]; // alex
        const webDev2 = users[1]; // emma
        const designer1 = users[2]; // sophia
        const designer2 = users[3]; // james
        const writer = users[4]; // olivia
        const translator = users[5]; // lucas
        const marketer = users[6]; // mia
        const videoCreator = users[7]; // noah
        const client1 = users[8]; // david
        const client2 = users[9]; // rachel

        // Create 20 gigs - 4 per category
        console.log('Creating gigs');
        const gigs = await Gig.insertMany([
            // ============ WEB DEVELOPMENT (4 gigs) ============
            {
                title: 'I will build a professional React website',
                description: 'I will develop a modern, responsive website using React.js with clean code and best practices. Includes responsive design, SEO optimization, and fast loading speeds. Perfect for businesses looking for a professional web presence.',
                category: 'Web Development',
                price: 299,
                deliveryTime: 7,
                freelancerId: webDev1._id,
                tags: ['React', 'JavaScript', 'Node.js'],
                images: [getGigImage(1)],
                status: 'active'
            },
            {
                title: 'I will create a full-stack e-commerce store',
                description: 'Complete e-commerce solution with shopping cart, secure payment integration (Stripe/PayPal), user authentication, product management, and admin dashboard. Built with Node.js and MongoDB for scalability.',
                category: 'Web Development',
                price: 599,
                deliveryTime: 14,
                freelancerId: webDev1._id,
                tags: ['Node.js', 'React', 'HTML/CSS'],
                images: [getGigImage(2)],
                status: 'active'
            },
            {
                title: 'I will design and code a landing page',
                description: 'High-converting landing page with modern design, smooth animations, and mobile-first approach. Optimized for speed and conversions. Includes contact form integration and analytics setup.',
                category: 'Web Development',
                price: 149,
                deliveryTime: 3,
                freelancerId: webDev2._id,
                tags: ['HTML/CSS', 'JavaScript'],
                images: [getGigImage(3)],
                status: 'active'
            },
            {
                title: 'I will build a custom WordPress website',
                description: 'Professional WordPress website with custom theme, responsive design, and essential plugins. Includes SEO setup, security hardening, and training on how to manage your content.',
                category: 'Web Development',
                price: 249,
                deliveryTime: 5,
                freelancerId: webDev2._id,
                tags: ['HTML/CSS', 'JavaScript'],
                images: [getGigImage(4)],
                status: 'active'
            },

            // ============ GRAPHIC DESIGN (4 gigs) ============
            {
                title: 'I will design a unique logo for your brand',
                description: 'Custom logo design that captures your brand essence. You will receive multiple concepts, unlimited revisions, and final files in all formats (AI, EPS, PNG, JPG, PDF). Perfect for startups and rebranding.',
                category: 'Graphic Design',
                price: 129,
                deliveryTime: 4,
                freelancerId: designer1._id,
                tags: ['Logo Design', 'Branding'],
                images: [getGigImage(5)],
                status: 'active'
            },
            {
                title: 'I will create stunning UI/UX designs',
                description: 'Modern, user-centered UI/UX design for web and mobile apps. Includes user research, wireframes, high-fidelity mockups, and interactive prototypes in Figma. Design that converts visitors to customers.',
                category: 'Graphic Design',
                price: 349,
                deliveryTime: 7,
                freelancerId: designer1._id,
                tags: ['UI Design', 'UX Design'],
                images: [getGigImage(6)],
                status: 'active'
            },
            {
                title: 'I will design business cards and stationery',
                description: 'Professional business card design with matching stationery (letterhead, envelope). Print-ready files with bleed marks. Multiple design options and unlimited revisions included.',
                category: 'Graphic Design',
                price: 79,
                deliveryTime: 2,
                freelancerId: designer2._id,
                tags: ['Print Design', 'Branding'],
                images: [getGigImage(7)],
                status: 'active'
            },
            {
                title: 'I will create social media graphics pack',
                description: 'Complete social media branding kit with templates for Instagram, Facebook, Twitter, and LinkedIn. Includes 20 customizable templates, story templates, and highlight covers.',
                category: 'Graphic Design',
                price: 199,
                deliveryTime: 5,
                freelancerId: designer2._id,
                tags: ['Social Media', 'Branding'],
                images: [getGigImage(8)],
                status: 'active'
            },

            // ============ WRITING & TRANSLATION (4 gigs) ============
            {
                title: 'I will write SEO blog posts that rank',
                description: 'Well-researched, engaging blog posts optimized for search engines. Each article includes keyword research, meta descriptions, and internal linking suggestions. Drive organic traffic to your site.',
                category: 'Writing & Translation',
                price: 89,
                deliveryTime: 3,
                freelancerId: writer._id,
                tags: ['SEO', 'Content Writing'],
                images: [getGigImage(9)],
                status: 'active'
            },
            {
                title: 'I will write compelling website copy',
                description: 'Persuasive website copywriting that converts visitors into customers. Includes homepage, about page, services page, and CTA optimization. Research-backed copy that speaks to your audience.',
                category: 'Writing & Translation',
                price: 199,
                deliveryTime: 5,
                freelancerId: writer._id,
                tags: ['Copywriting', 'Content Writing'],
                images: [getGigImage(10)],
                status: 'active'
            },
            {
                title: 'I will translate English to Spanish professionally',
                description: 'Accurate, natural-sounding translation from English to Spanish by native speaker. Specialized in business, legal, and marketing content. Includes proofreading and cultural adaptation.',
                category: 'Writing & Translation',
                price: 59,
                deliveryTime: 2,
                freelancerId: translator._id,
                tags: ['Translation', 'Spanish'],
                images: [getGigImage(11)],
                status: 'active'
            },
            {
                title: 'I will translate documents to French or German',
                description: 'Professional translation services for French and German. Certified translator with 10+ years experience. Perfect for legal documents, technical manuals, and marketing materials.',
                category: 'Writing & Translation',
                price: 79,
                deliveryTime: 3,
                freelancerId: translator._id,
                tags: ['Translation', 'French', 'German'],
                images: [getGigImage(12)],
                status: 'active'
            },

            // ============ DIGITAL MARKETING (4 gigs) ============
            {
                title: 'I will create a complete SEO strategy',
                description: 'Comprehensive SEO audit and strategy for your website. Includes technical SEO analysis, keyword research, competitor analysis, and a 90-day action plan to improve your rankings.',
                category: 'Digital Marketing',
                price: 299,
                deliveryTime: 7,
                freelancerId: marketer._id,
                tags: ['SEO', 'Marketing Strategy'],
                images: [getGigImage(13)],
                status: 'active'
            },
            {
                title: 'I will manage your Google Ads campaigns',
                description: 'Expert Google Ads management to maximize your ROI. Includes campaign setup, keyword optimization, A/B testing, and detailed monthly reports. Get more leads for less spend.',
                category: 'Digital Marketing',
                price: 399,
                deliveryTime: 30,
                freelancerId: marketer._id,
                tags: ['Google Ads', 'PPC'],
                images: [getGigImage(14)],
                status: 'active'
            },
            {
                title: 'I will grow your Instagram organically',
                description: 'Strategic Instagram growth service with content planning, hashtag strategy, engagement tactics, and analytics tracking. Real followers interested in your niche, no bots or fake accounts.',
                category: 'Digital Marketing',
                price: 179,
                deliveryTime: 30,
                freelancerId: marketer._id,
                tags: ['Social Media', 'Instagram'],
                images: [getGigImage(15)],
                status: 'active'
            },
            {
                title: 'I will setup email marketing automation',
                description: 'Complete email marketing setup with Mailchimp or ConvertKit. Includes welcome sequence, lead magnets, newsletter templates, and segmentation strategy to nurture your audience.',
                category: 'Digital Marketing',
                price: 249,
                deliveryTime: 5,
                freelancerId: marketer._id,
                tags: ['Email Marketing', 'Automation'],
                images: [getGigImage(16)],
                status: 'active'
            },

            // ============ VIDEO & ANIMATION (4 gigs) ============
            {
                title: 'I will create a professional explainer video',
                description: '60-90 second animated explainer video for your product or service. Includes script writing, professional voiceover, background music, and unlimited revisions. Engage your audience visually.',
                category: 'Video & Animation',
                price: 499,
                deliveryTime: 10,
                freelancerId: videoCreator._id,
                tags: ['Animation', 'Explainer Video'],
                images: [getGigImage(17)],
                status: 'active'
            },
            {
                title: 'I will edit your YouTube videos professionally',
                description: 'Professional video editing for YouTubers and content creators. Includes color grading, sound design, motion graphics, thumbnails, and end screens. Make your content stand out.',
                category: 'Video & Animation',
                price: 149,
                deliveryTime: 3,
                freelancerId: videoCreator._id,
                tags: ['Video Editing', 'YouTube'],
                images: [getGigImage(18)],
                status: 'active'
            },
            {
                title: 'I will create logo animation intro',
                description: 'Eye-catching logo animation for your brand. Perfect for YouTube intros, presentations, and social media. Multiple styles available: minimal, 3D, particle effects, and more.',
                category: 'Video & Animation',
                price: 99,
                deliveryTime: 2,
                freelancerId: videoCreator._id,
                tags: ['Animation', 'Logo Animation'],
                images: [getGigImage(19)],
                status: 'active'
            },
            {
                title: 'I will produce promotional video ads',
                description: 'High-converting video ads for Facebook, Instagram, and TikTok. Includes scripting, editing, captions, and multiple aspect ratios for all platforms. Drive sales with video.',
                category: 'Video & Animation',
                price: 279,
                deliveryTime: 5,
                freelancerId: videoCreator._id,
                tags: ['Video Production', 'Advertising'],
                images: [getGigImage(20)],
                status: 'active'
            }
        ]);

        console.log(`Created ${gigs.length} gigs`);

        // Create sample orders
        console.log('Creating orders...');
        const orders = await Order.insertMany([
            {
                gigId: gigs[0]._id,
                clientId: client1._id,
                freelancerId: webDev1._id,
                status: 'in-progress',
                totalPrice: gigs[0].price,
                requirements: 'Need a React website for my tech startup. Should have modern design with dark mode option.',
                deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                orderDate: new Date()
            },
            {
                gigId: gigs[4]._id,
                clientId: client1._id,
                freelancerId: designer1._id,
                status: 'completed',
                totalPrice: gigs[4].price,
                requirements: 'Logo for a fintech startup called "PayFlow". Modern, trustworthy look.',
                deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                orderDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                gigId: gigs[8]._id,
                clientId: client2._id,
                freelancerId: writer._id,
                status: 'pending',
                totalPrice: gigs[8].price,
                requirements: 'Need 5 blog posts about sustainable fashion. Target audience: millennials.',
                deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                orderDate: new Date()
            },
            {
                gigId: gigs[16]._id,
                clientId: client2._id,
                freelancerId: videoCreator._id,
                status: 'in-progress',
                totalPrice: gigs[16].price,
                requirements: 'Explainer video for our SaaS product. Should be 90 seconds with professional voiceover.',
                deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log(`Created ${orders.length} orders`);

        console.log('\n========================================');
        console.log('DATABASE SEEDED SUCCESSFULLY!');
        console.log('========================================\n');

        console.log('Summary:');
        console.log(`   - ${users.length} users (8 freelancers + 2 clients)`);
        console.log(`   - ${gigs.length} gigs (4 per category)`);
        console.log(`   - ${orders.length} sample orders\n`);

        console.log('Test Accounts (password: password123):');
        console.log('   FREELANCERS:');
        console.log('   - alex@example.com (Web Developer)');
        console.log('   - emma@example.com (Frontend Dev)');
        console.log('   - sophia@example.com (Designer)');
        console.log('   - james@example.com (Designer)');
        console.log('   - olivia@example.com (Writer)');
        console.log('   - lucas@example.com (Translator)');
        console.log('   - mia@example.com (Marketer)');
        console.log('   - noah@example.com (Video Creator)');
        console.log('   ');
        console.log('   CLIENTS:');
        console.log('   - david@example.com');
        console.log('   - rachel@example.com\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
