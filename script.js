// ===== MINIMAL DEV PORTFOLIO JS =====

// Mobile menu toggle functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on nav links (but not theme toggle)
        const navLinks = navMenu.querySelectorAll('.nav-link:not(.mobile-theme-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && 
                !navMenu.contains(e.target) && 
                !e.target.classList.contains('mobile-theme-toggle')) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
        
        // Close menu on window resize to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
    if (mobileThemeToggle) mobileThemeToggle.textContent = '☀️ theme';
}

// Function to toggle theme
function toggleTheme() {
    body.classList.toggle('dark-mode');
    
    // Update button text and save preference
    if (body.classList.contains('dark-mode')) {
        if (themeToggle) themeToggle.textContent = '☀️';
        if (mobileThemeToggle) mobileThemeToggle.textContent = '☀️ theme';
        localStorage.setItem('theme', 'dark');
    } else {
        if (themeToggle) themeToggle.textContent = '🌙';
        if (mobileThemeToggle) mobileThemeToggle.textContent = '🌙 theme';
        localStorage.setItem('theme', 'light');
    }
}

// Theme toggle event listeners
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', () => {
        toggleTheme();
        // Close mobile menu after theme toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Blog post loading functionality
async function loadBlogPosts() {
    const blogContainer = document.getElementById('blog-posts');
    if (!blogContainer) return;

    try {
        // Show loading state
        blogContainer.innerHTML = '<div class="loading">Loading posts...</div>';

        // List of blog post files (in a real implementation, this could come from an API)
        const posts = [
            'getting-started-with-web-development.md',
            'why-i-love-javascript.md',
            'building-my-first-react-app.md',
            'MCP-The-Magic-Connector-Making-AI-Smarter-for-You.md'
        ];

        // Load and render posts
        const postElements = await Promise.all(
            posts.map(async (filename) => {
                try {
                    const response = await fetch(`posts/${filename}`);
                    if (!response.ok) throw new Error(`Failed to load ${filename}`);
                    
                    const content = await response.text();
                    return parseMarkdownPost(content, filename);
                } catch (error) {
                    console.warn(`Could not load ${filename}:`, error);
                    return null;
                }
            })
        );

        // Filter out failed loads and render
        const validPosts = postElements.filter(post => post !== null);
        
        if (validPosts.length === 0) {
            blogContainer.innerHTML = `
                <div class="blog-post">
                    <h3>Welcome to My Blog</h3>
                    <div class="blog-meta">Coming Soon</div>
                    <p class="blog-excerpt">Blog posts will be available soon. Stay tuned!</p>
                </div>
            `;
        } else {
            blogContainer.innerHTML = validPosts.join('');
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogContainer.innerHTML = `
            <div class="blog-post">
                <h3>Blog Coming Soon</h3>
                <div class="blog-meta">Under Development</div>
                <p class="blog-excerpt">The blog functionality is currently being developed. Check back soon!</p>
            </div>
        `;
    }
}

// Simple markdown parser for blog posts
function parseMarkdownPost(content, filename) {
    const lines = content.split('\n');
    let title = '';
    let date = '';
    let excerpt = '';
    let inFrontMatter = false;
    let frontMatterEnded = false;
    let contentLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Handle frontmatter
        if (line === '---') {
            if (!inFrontMatter) {
                inFrontMatter = true;
                continue;
            } else {
                frontMatterEnded = true;
                continue;
            }
        }
        
        if (inFrontMatter && !frontMatterEnded) {
            if (line.startsWith('title:')) {
                title = line.replace('title:', '').trim().replace(/['"]/g, '');
            } else if (line.startsWith('date:')) {
                date = line.replace('date:', '').trim();
            } else if (line.startsWith('excerpt:')) {
                excerpt = line.replace('excerpt:', '').trim().replace(/['"]/g, '');
            }
            continue;
        }
        
        if (frontMatterEnded) {
            contentLines.push(line);
        }
    }

    // If no frontmatter, try to extract title from first # heading
    if (!title && contentLines.length > 0) {
        const firstLine = contentLines[0];
        if (firstLine.startsWith('#')) {
            title = firstLine.replace(/^#+\s*/, '');
            contentLines = contentLines.slice(1);
        } else {
            title = filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    // Extract excerpt from content if not provided
    if (!excerpt) {
        const textContent = contentLines.join(' ').replace(/[#*`]/g, '').trim();
        excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
    }

    // Format date
    if (!date) {
        date = 'Recent';
    }

    const slug = filename.replace('.md', '');
    
    return `
        <div class="blog-post">
            <h3><a href="blog-post.html?post=${slug}">${title}</a></h3>
            <div class="blog-meta">${date}</div>
            <p class="blog-excerpt">${excerpt}</p>
        </div>
    `;
}

// Load individual blog post
async function loadBlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('post');
    const contentElement = document.getElementById('post-content');
    
    if (!postSlug || !contentElement) return;

    try {
        const response = await fetch(`posts/${postSlug}.md`);
        if (!response.ok) throw new Error('Post not found');
        
        const content = await response.text();
        const html = parseMarkdownToHTML(content);
        contentElement.innerHTML = html;
        
        // Update page title
        const title = extractTitle(content);
        if (title) {
            document.title = `${title} - Your Name`;
        }
    } catch (error) {
        console.error('Error loading blog post:', error);
        contentElement.innerHTML = `
            <h2>Post Not Found</h2>
            <p>Sorry, the requested blog post could not be found.</p>
            <p><a href="blog.html">← Back to Blog</a></p>
        `;
    }
}

// Simple markdown to HTML converter
function parseMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Remove frontmatter
    html = html.replace(/^---[\s\S]*?---\n/, '');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    
    return html;
}

// Extract title from markdown content
function extractTitle(content) {
    const lines = content.split('\n');
    
    // Check frontmatter first
    let inFrontMatter = false;
    for (const line of lines) {
        if (line.trim() === '---') {
            inFrontMatter = !inFrontMatter;
            continue;
        }
        if (inFrontMatter && line.startsWith('title:')) {
            return line.replace('title:', '').trim().replace(/['"]/g, '');
        }
    }
    
    // Check for first heading
    for (const line of lines) {
        if (line.startsWith('#')) {
            return line.replace(/^#+\s*/, '');
        }
    }
    
    return null;
}

// Contact form handling
function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Here you would typically send the data to a server
        // For this demo, we'll just show a success message
        alert('Thank you for your message! I\'ll get back to you soon.');
        form.reset();
    });
}

// Initialize functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initMobileMenu();
    
    // Load blog posts if on blog page
    if (window.location.pathname.includes('blog.html')) {
        loadBlogPosts();
    }
    
    // Load individual blog post if on blog post page
    if (window.location.pathname.includes('blog-post.html')) {
        loadBlogPost();
    }
    
    // Initialize contact form
    handleContactForm();
});

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Add typing effect to cursor elements
function addTypingEffect() {
    const cursors = document.querySelectorAll('.cursor');
    cursors.forEach(cursor => {
        // The cursor effect is handled by CSS animation
    });
}

// Initialize typing effect
document.addEventListener('DOMContentLoaded', addTypingEffect);
