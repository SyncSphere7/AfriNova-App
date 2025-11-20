/*
  # Seed Project Templates

  Populate the project_templates table with popular templates for various use cases.
*/

INSERT INTO project_templates (name, slug, description, category, icon, tech_stack, features, complexity, estimated_time, default_prompt, is_popular, is_featured, tags) VALUES

('E-commerce Store', 'ecommerce-store', 'Full-featured online store with cart, checkout, and payment processing', 'E-commerce', '🛍️', 
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": ["Stripe", "PayPal"], "integrations": []}'::jsonb,
ARRAY['Product catalog', 'Shopping cart', 'Secure checkout', 'Payment integration', 'Order management', 'User accounts', 'Search & filters'],
'intermediate', 8,
'Build a modern e-commerce store with product catalog, shopping cart, secure checkout, and payment processing. Include user authentication, order tracking, and an admin dashboard for managing products and orders.',
true, true,
ARRAY['ecommerce', 'store', 'shop', 'payments', 'cart']),

('SaaS Dashboard', 'saas-dashboard', 'Complete SaaS application with billing, authentication, and analytics', 'SaaS', '📊',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": ["Stripe"], "integrations": []}'::jsonb,
ARRAY['User authentication', 'Subscription billing', 'Analytics dashboard', 'Team management', 'API integration', 'Role-based access'],
'advanced', 10,
'Create a SaaS application with user authentication, subscription billing, team management, analytics dashboard, and API endpoints. Include role-based access control and usage tracking.',
true, true,
ARRAY['saas', 'dashboard', 'subscription', 'billing', 'analytics']),

('Blog Platform', 'blog-platform', 'Modern blog with markdown support, comments, and SEO optimization', 'Content', '✍️',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": [], "integrations": []}'::jsonb,
ARRAY['Markdown editor', 'Comments system', 'SEO optimization', 'Categories & tags', 'Search', 'RSS feed', 'User profiles'],
'beginner', 6,
'Build a modern blog platform with markdown support, commenting system, categories, tags, and SEO optimization. Include author profiles, social sharing, and RSS feed.',
true, false,
ARRAY['blog', 'content', 'cms', 'markdown', 'seo']),

('Task Management App', 'task-management', 'Collaborative task manager with boards, lists, and real-time updates', 'Productivity', '✅',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": [], "integrations": []}'::jsonb,
ARRAY['Kanban boards', 'Drag & drop', 'Real-time collaboration', 'Task assignments', 'Due dates', 'File attachments', 'Activity tracking'],
'intermediate', 7,
'Create a task management application with Kanban boards, drag-and-drop functionality, real-time collaboration, task assignments, due dates, and activity tracking.',
true, true,
ARRAY['tasks', 'productivity', 'kanban', 'collaboration', 'project-management']),

('Social Media App', 'social-media', 'Social networking platform with posts, likes, comments, and messaging', 'Social', '💬',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": [], "integrations": []}'::jsonb,
ARRAY['User profiles', 'Posts & feeds', 'Likes & comments', 'Direct messaging', 'Follow system', 'Notifications', 'Image uploads'],
'advanced', 12,
'Build a social media platform with user profiles, posts, likes, comments, direct messaging, follow system, and notifications. Include image upload and real-time updates.',
true, false,
ARRAY['social', 'network', 'messaging', 'posts', 'community']),

('Learning Management System', 'lms', 'Online course platform with video lessons, quizzes, and progress tracking', 'Education', '🎓',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": ["Stripe"], "integrations": []}'::jsonb,
ARRAY['Course catalog', 'Video lessons', 'Quizzes & tests', 'Progress tracking', 'Certificates', 'Discussion forums', 'Student dashboard'],
'advanced', 10,
'Create an LMS with course catalog, video lessons, quizzes, progress tracking, certificates, and discussion forums. Include payment processing for course purchases.',
false, false,
ARRAY['education', 'learning', 'courses', 'elearning', 'training']),

('Restaurant Website', 'restaurant-website', 'Restaurant site with menu, reservations, and online ordering', 'Business', '🍽️',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": ["Stripe"], "integrations": []}'::jsonb,
ARRAY['Menu display', 'Online ordering', 'Table reservations', 'Payment processing', 'Order tracking', 'Gallery', 'Contact form'],
'beginner', 5,
'Build a restaurant website with menu display, online ordering, table reservations, payment processing, and order tracking. Include gallery and contact information.',
true, false,
ARRAY['restaurant', 'food', 'ordering', 'reservations', 'menu']),

('Portfolio Website', 'portfolio', 'Professional portfolio with projects showcase and contact form', 'Personal', '🎨',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": [], "integrations": []}'::jsonb,
ARRAY['Project showcase', 'About section', 'Skills display', 'Contact form', 'Blog', 'Resume/CV', 'Responsive design'],
'beginner', 4,
'Create a professional portfolio website with project showcase, about section, skills display, blog, and contact form. Include responsive design and smooth animations.',
true, false,
ARRAY['portfolio', 'personal', 'showcase', 'projects', 'resume']),

('Booking System', 'booking-system', 'Appointment booking system with calendar, notifications, and payments', 'Business', '📅',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": ["Stripe"], "integrations": []}'::jsonb,
ARRAY['Calendar view', 'Availability management', 'Booking confirmation', 'Email notifications', 'Payment processing', 'Customer dashboard', 'Cancellation policy'],
'intermediate', 8,
'Build a booking system with calendar view, availability management, booking confirmations, email notifications, and payment processing. Include customer and admin dashboards.',
false, false,
ARRAY['booking', 'appointments', 'scheduling', 'calendar', 'reservations']),

('Real Estate Listings', 'real-estate', 'Property listing platform with search, filters, and virtual tours', 'Real Estate', '🏠',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": [], "integrations": []}'::jsonb,
ARRAY['Property listings', 'Advanced search', 'Map integration', 'Image galleries', 'Agent profiles', 'Contact forms', 'Favorites'],
'intermediate', 7,
'Create a real estate platform with property listings, advanced search and filters, map integration, image galleries, agent profiles, and contact forms.',
false, false,
ARRAY['real-estate', 'property', 'listings', 'housing', 'rentals']),

('Fitness Tracker', 'fitness-tracker', 'Workout tracking app with progress charts and goal setting', 'Health', '💪',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": [], "integrations": []}'::jsonb,
ARRAY['Workout logging', 'Progress charts', 'Goal setting', 'Exercise library', 'Nutrition tracking', 'Calendar view', 'Statistics'],
'intermediate', 6,
'Build a fitness tracking app with workout logging, progress charts, goal setting, exercise library, nutrition tracking, and detailed statistics.',
false, false,
ARRAY['fitness', 'health', 'workout', 'exercise', 'tracking']),

('Event Management', 'event-management', 'Event platform with ticketing, registration, and attendee management', 'Events', '🎉',
'{"frontend": "React", "backend": "Node.js (Express)", "database": "PostgreSQL", "styling": "Tailwind CSS", "payments": ["Stripe"], "integrations": []}'::jsonb,
ARRAY['Event creation', 'Ticket sales', 'Registration forms', 'Attendee management', 'QR code tickets', 'Email confirmations', 'Analytics'],
'intermediate', 9,
'Create an event management platform with event creation, ticket sales, registration forms, attendee management, QR code tickets, and analytics dashboard.',
false, true,
ARRAY['events', 'tickets', 'registration', 'conference', 'meetup']);
