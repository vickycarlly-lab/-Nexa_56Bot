require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');

// Initialize Express app for Railway
const app = express();
const PORT = process.env.PORT || 3000;

// Bot token from environment variable
const token = process.env.BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store user sessions (in production, use a database)
const userSessions = new Map();

// Career data (you can expand this)
const careerData = {
  skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'AWS', 'Docker', 'Machine Learning'],
  industries: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Consulting'],
  jobTypes: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Internship'],
  experienceLevels: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
  commonQuestions: [
    'What are the top skills in demand?',
    'How to write a good resume?',
    'Tips for interview preparation',
    'How to negotiate salary?',
    'Best job search platforms'
  ]
};

// Sample job listings (mock data - replace with real API)
const mockJobs = [
  {
    id: 1,
    title: 'Full Stack Developer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    description: 'Exciting opportunity for a Full Stack Developer...',
    skills: ['JavaScript', 'React', 'Node.js']
  },
  {
    id: 2,
    title: 'Data Scientist',
    company: 'DataFlow Inc',
    location: 'New York, NY',
    type: 'Hybrid',
    description: 'Looking for a Data Scientist with ML expertise...',
    skills: ['Python', 'Machine Learning', 'SQL']
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    company: 'CloudMasters',
    location: 'Remote',
    type: 'Contract',
    description: 'Seeking DevOps professional with AWS experience...',
    skills: ['AWS', 'Docker', 'Kubernetes']
  }
];

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🚀 *Welcome to NexaBot - Your Career Assistant!* 🚀

I'm here to help you find your dream job and advance your career!

*What can I do for you?*
📌 Find job opportunities
📌 Get career advice
📌 Resume tips
📌 Interview preparation
📌 Skill recommendations

*Available Commands:*
/help - Show all commands
/jobs - Find job listings
/resume - Get resume tips
/interview - Interview preparation tips
/skills - In-demand skills
/advice - Career advice
/questions - Common interview questions
/salary - Salary negotiation tips
/industry - Industry insights
/contact - Contact support

*How to use:* Just click a command or type it in!
`;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
🤖 *NexaBot Help Center*

*Commands:*
/start - Start the bot
/help - Show this help message
/jobs - Search for job opportunities
/resume - Get professional resume tips
/interview - Ace your interviews
/skills - Learn in-demand skills
/advice - Career advancement advice
/questions - Common interview questions
/salary - Salary negotiation strategies
/industry - Industry insights
/contact - Get in touch with support

*Tips:*
• Be specific with your questions
• I can help with career planning
• Ask about any career-related topic
`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Jobs command
bot.onText(/\/jobs/, async (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    reply_markup: {
      keyboard: [
        ['💻 Technology Jobs', '💰 Finance Jobs'],
        ['🏥 Healthcare Jobs', '📚 Education Jobs'],
        ['🛒 Retail Jobs', '🏭 Manufacturing Jobs'],
        ['🔍 Search All Jobs', '❌ Cancel']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.sendMessage(chatId, '🔍 *Select a sector to find job opportunities:*', {
    parse_mode: 'Markdown',
    ...keyboard
  });
});

// Handle job sector selection
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && text.includes('Jobs')) {
    // Handle job search
    const sector = text.replace(/[🔍💻💰🏥📚🛒🏭]/g, '').replace('Jobs', '').trim();
    await handleJobSearch(chatId, sector || 'all');
  } else if (text === 'Search All Jobs') {
    await handleJobSearch(chatId, 'all');
  } else if (text === '❌ Cancel') {
    bot.sendMessage(chatId, '❌ Search cancelled. Use /jobs to search again.');
  }
});

// Resume tips command
bot.onText(/\/resume/, (msg) => {
  const chatId = msg.chat.id;
  const resumeTips = `
📝 *Professional Resume Tips*

*1. Format & Structure*
• Use a clean, professional layout
• Keep it to 1-2 pages
• Use bullet points for clarity
• Include relevant keywords

*2. Content Essentials*
• Strong summary/profile statement
• Highlight achievements (quantify when possible)
• List relevant skills
• Include education and certifications

*3. Common Mistakes to Avoid*
• Spelling and grammar errors
• Too much text or too little
• Irrelevant information
• Outdated format

*4. Customization*
• Tailor for each job application
• Use job description keywords
• Highlight transferable skills

*5. Keywords to Include*
${careerData.skills.slice(0, 10).map(s => `• ${s}`).join('\n')}

Need more help? Send your specific questions! 📩
`;

  bot.sendMessage(chatId, resumeTips, { parse_mode: 'Markdown' });
});

// Interview tips command
bot.onText(/\/interview/, (msg) => {
  const chatId = msg.chat.id;
  const interviewTips = `
🎯 *Interview Preparation Guide*

*Before the Interview:*
• Research the company thoroughly
• Study the job description
• Prepare your STAR stories (Situation, Task, Action, Result)
• Practice common questions
• Prepare questions to ask the interviewer

*During the Interview:*
• Dress appropriately
• Arrive 10-15 minutes early
• Maintain good eye contact
• Listen carefully and answer concisely
• Show enthusiasm and confidence

*After the Interview:*
• Send a thank-you email within 24 hours
• Follow up if you haven't heard back
• Reflect on what went well

*Common Questions:*
${careerData.commonQuestions.map(q => `• ${q}`).join('\n')}

Need practice? Just ask me any interview question! 💪
`;

  bot.sendMessage(chatId, interviewTips, { parse_mode: 'Markdown' });
});

// Skills command
bot.onText(/\/skills/, (msg) => {
  const chatId = msg.chat.id;
  const skillsMessage = `
📊 *In-Demand Skills for 2024*

*Technical Skills:*
${careerData.skills.map(s => `• ${s}`).join('\n')}

*Soft Skills:*
• Communication
• Problem-solving
• Teamwork
• Adaptability
• Leadership
• Time Management
• Critical Thinking
• Emotional Intelligence

*How to Develop Skills:*
1. Online courses (Coursera, edX)
2. Practice projects
3. Open source contributions
4. Networking with professionals
5. Industry certifications

Want to learn more about any specific skill? Just ask! 📚
`;

  bot.sendMessage(chatId, skillsMessage, { parse_mode: 'Markdown' });
});

// Advice command
bot.onText(/\/advice/, (msg) => {
  const chatId = msg.chat.id;
  const advice = `
💡 *Career Advice & Tips*

*Career Growth:*
• Set clear career goals
• Continuously learn new skills
• Network actively
• Find a mentor
• Build your personal brand

*Job Search Strategies:*
• Use multiple job platforms
• Customize applications
• Leverage referrals
• Stay organized
• Follow up professionally

*Workplace Success:*
• Deliver quality work
• Build good relationships
• Take initiative
• Be reliable
• Seek feedback

*Work-Life Balance:*
• Set boundaries
• Take breaks
• Pursue hobbies
• Maintain health
• Plan regular vacations

Need specific advice? Ask me anything! 🌟
`;

  bot.sendMessage(chatId, advice, { parse_mode: 'Markdown' });
});

// Questions command
bot.onText(/\/questions/, (msg) => {
  const chatId = msg.chat.id;
  const questions = `
❓ *Common Interview Questions*

*General Questions:*
1. Tell me about yourself
2. Why do you want to work here?
3. Where do you see yourself in 5 years?
4. What are your strengths and weaknesses?
5. Why should we hire you?

*Behavioral Questions:*
6. Describe a challenge you overcame
7. How do you handle conflict?
8. Tell me about a team success
9. How do you handle pressure?
10. Describe a failure and what you learned

*Technical Questions:*
${careerData.skills.slice(0, 5).map(s => `• ${s} related questions`).join('\n')}

*Your Turn:* 
Practice answering these questions, and I'll give you feedback! 🎯
`;

  bot.sendMessage(chatId, questions, { parse_mode: 'Markdown' });
});

// Salary command
bot.onText(/\/salary/, (msg) => {
  const chatId = msg.chat.id;
  const salaryTips = `
💰 *Salary Negotiation Guide*

*Before Negotiation:*
• Research market rates (Glassdoor, LinkedIn)
• Know your minimum acceptable offer
• Consider total compensation (benefits, bonus)
• Understand your unique value

*During Negotiation:*
• Be confident but professional
• Justify your request with data
• Focus on value you bring
• Be flexible and open
• Don't disclose your current salary

*Counter Offer Tips:*
• Ask for time to consider
• Evaluate the complete package
• Negotiate other benefits (vacation, remote work)
• Be prepared to walk away

*Common Mistakes:*
• Negotiating too early
• Being too aggressive
• Accepting too quickly
• Not negotiating at all

Remember: Most companies expect negotiation! 🎯
`;

  bot.sendMessage(chatId, salaryTips, { parse_mode: 'Markdown' });
});

// Industry command
bot.onText(/\/industry/, (msg) => {
  const chatId = msg.chat.id;
  const industryMessage = `
🏭 *Industry Insights*

*Top Industries & Trends:*
${careerData.industries.map((ind, i) => `${i+1}. ${ind}`).join('\n')}

*Current Trends:*
• AI and Automation
• Remote Work Culture
• Digital Transformation
• Green Energy
• Healthcare Innovation
• FinTech Growth
• E-commerce Evolution

*Emerging Fields:*
• Data Science
• Cybersecurity
• UX/UI Design
• Renewable Energy
• Biotechnology
• Cloud Computing

*Industry-Specific Skills:*
Each industry requires specific skills. 
Ask me about any industry for detailed insights! 📈
`;

  bot.sendMessage(chatId, industryMessage, { parse_mode: 'Markdown' });
});

// Contact command
bot.onText(/\/contact/, (msg) => {
  const chatId = msg.chat.id;
  const contactMessage = `
📧 *Contact Information*

For support, feedback, or suggestions:
• Email: support@nexabot.com
• Twitter: @NexaBot
• LinkedIn: NexaBot Careers

*Suggestions for Features:*
I'm always improving! Tell me what features you'd like to see.

*Report Issues:*
Found a bug or error? Let me know and I'll fix it ASAP!

*Partnerships:*
Interested in collaborating? Reach out!

Your feedback helps me serve you better! 🙏
`;

  bot.sendMessage(chatId, contactMessage, { parse_mode: 'Markdown' });
});

// Handle job search function
async function handleJobSearch(chatId, sector) {
  try {
    bot.sendMessage(chatId, '🔍 Searching for jobs... Please wait.');
    
    // Filter jobs based on sector
    let filteredJobs = mockJobs;
    if (sector !== 'all') {
      // Simple filtering - you can make this more sophisticated
      const sectorLower = sector.toLowerCase();
      filteredJobs = mockJobs.filter(job => 
        job.title.toLowerCase().includes(sectorLower) || 
        job.company.toLowerCase().includes(sectorLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(sectorLower))
      );
    }

    if (filteredJobs.length === 0) {
      bot.sendMessage(chatId, `😕 No jobs found in the ${sector} sector. Try /jobs to search again or /skills to see in-demand skills.`);
      return;
    }

    // Send job listings
    let message = `📋 *Job Opportunities (${sector} Sector)*\n\n`;
    filteredJobs.forEach((job, index) => {
      message += `*${index + 1}. ${job.title}*\n`;
      message += `🏢 ${job.company}\n`;
      message += `📍 ${job.location}\n`;
      message += `🕐 ${job.type}\n`;
      message += `📝 ${job.description.substring(0, 100)}...\n`;
      message += `🔧 Skills: ${job.skills.join(', ')}\n\n`;
    });

    message += `\n💡 Want more details? Just ask!`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
    // Provide quick action buttons
    const keyboard = {
      reply_markup: {
        keyboard: [
          ['📝 Resume Tips', '🎯 Interview Prep'],
          ['📊 Skills Guide', '💡 Career Advice'],
          ['🔍 New Search', '❌ Cancel']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
    
    bot.sendMessage(chatId, 'What would you like to do next?', keyboard);
    
  } catch (error) {
    console.error('Error searching jobs:', error);
    bot.sendMessage(chatId, '❌ Sorry, I encountered an error while searching for jobs. Please try again.');
  }
}

// Handle incoming text messages that aren't commands
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip if it's a command
  if (text && text.startsWith('/')) return;
  
  // Handle general questions
  if (text) {
    // Simple response for career-related questions
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('resume') || lowerText.includes('cv')) {
      bot.sendMessage(chatId, '📝 For resume tips, use /resume command. Do you have specific questions about your resume?');
    } else if (lowerText.includes('interview')) {
      bot.sendMessage(chatId, '🎯 For interview preparation, use /interview. Want to practice a specific question?');
    } else if (lowerText.includes('salary')) {
      bot.sendMessage(chatId, '💰 For salary negotiation tips, use /salary. Would you like specific advice for your industry?');
    } else if (lowerText.includes('skill')) {
      bot.sendMessage(chatId, '📊 For skills information, use /skills. Are you interested in any specific skill?');
    } else if (lowerText.includes('job') || lowerText.includes('work') || lowerText.includes('career')) {
      bot.sendMessage(chatId, '🔍 Use /jobs to search for job opportunities. What type of job are you looking for?');
    } else {
      // General response
      const responses = [
        "I'm here to help with your career! Try these commands: /help",
        "Need career advice? Just ask! Or use /help for commands.",
        "I can help with jobs, resumes, interviews, and more. What do you need?",
        "Use /jobs to find opportunities, or /help for all commands!"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      bot.sendMessage(chatId, randomResponse);
    }
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Express route for health check
app.get('/', (req, res) => {
  res.send('NexaBot is running! 🚀');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start Express server for Railway
app.listen(PORT, () => {
  console.log(`🚀 NexaBot is running on port ${PORT}`);
  console.log('🤖 Bot is active and ready to help job seekers!');
});

console.log('🤖 NexaBot is starting...');
