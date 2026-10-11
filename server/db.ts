import fs from 'fs';
import path from 'path';
import { 
  Product, 
  Category, 
  Order, 
  Promotion, 
  Entitlement, 
  DownloadEvent, 
  AdminSettings, 
  AdminAuditLog, 
  EmailNotification 
} from '../src/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PRIVATE_EBOOKS_DIR = path.join(DATA_DIR, 'private_ebooks');
const RECEIPTS_DIR = path.join(DATA_DIR, 'receipts');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PRIVATE_EBOOKS_DIR)) fs.mkdirSync(PRIVATE_EBOOKS_DIR, { recursive: true });
if (!fs.existsSync(RECEIPTS_DIR)) fs.mkdirSync(RECEIPTS_DIR, { recursive: true });

export interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  orders: Order[];
  promotions: Promotion[];
  entitlements: Entitlement[];
  downloadEvents: DownloadEvent[];
  settings: AdminSettings;
  auditLogs: AdminAuditLog[];
  emailNotifications: EmailNotification[];
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-freelancing',
    name: 'Freelancing',
    slug: 'freelancing',
    description: 'Master client acquisition, high-ticket proposals, Upwork/Fiverr scaling, and remote income.',
    displayOrder: 1
  },
  {
    id: 'cat-ai',
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'Practical AI tools, prompt engineering, automated workflows, and building modern AI solutions.',
    displayOrder: 2
  },
  {
    id: 'cat-marketing',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Performance advertising, conversion copywriting, social media organic growth, and sales funnels.',
    displayOrder: 3
  },
  {
    id: 'cat-business',
    name: 'Business',
    slug: 'business',
    description: 'Startup fundamentals, pricing strategy, operations, team scaling, and sustainable revenue.',
    displayOrder: 4
  },
  {
    id: 'cat-finance',
    name: 'Personal Finance',
    slug: 'personal-finance',
    description: 'Wealth preservation, emergency funds, investment vehicles, and financial independence.',
    displayOrder: 5
  },
  {
    id: 'cat-productivity',
    name: 'Productivity',
    slug: 'productivity',
    description: 'Deep work frameworks, time blocking, energy management, and high-performance daily habits.',
    displayOrder: 6
  },
  {
    id: 'cat-education',
    name: 'Education',
    slug: 'education',
    description: 'Accelerated skill acquisition, academic frameworks, and cognitive mental models.',
    displayOrder: 7
  },
  {
    id: 'cat-development',
    name: 'Personal Development',
    slug: 'personal-development',
    description: 'Mindset resilience, emotional intelligence, leadership mastery, and personal transformation.',
    displayOrder: 8
  }
];

const DEFAULT_SETTINGS: AdminSettings = {
  jazzcashNumber: '03247755484',
  jazzcashAccountName: 'Husnain Ebooks Official',
  easypaisaNumber: '03446730755',
  easypaisaAccountName: 'Husnain Ebooks Official',
  contactEmail: 'husnaincreator6@gmail.com',
  contactPhone: '+92 324 7755484',
  whatsappNumber: '+92 324 7755484',
  verificationPolicyHours: '1 to 3 hours during business hours (9 AM - 10 PM PKT)',
  currencySymbol: 'Rs.',
  currencyCode: 'PKR',
  storeNotice: 'Official JazzCash (03247755484) & Easypaisa (03446730755) manual payments accepted with rapid order verification.'
};

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    maxDiscount: 500,
    isActive: true,
    totalRedemptionLimit: 500,
    currentRedemptions: 14,
    perCustomerLimit: 1
  },
  {
    id: 'promo-growth20',
    code: 'GROWTH20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 1500,
    maxDiscount: 1000,
    isActive: true,
    totalRedemptionLimit: 200,
    currentRedemptions: 8,
    perCustomerLimit: 1
  },
  {
    id: 'promo-save300',
    code: 'SAVE300',
    discountType: 'fixed',
    discountValue: 300,
    minOrderValue: 2000,
    isActive: true,
    totalRedemptionLimit: 100,
    currentRedemptions: 3,
    perCustomerLimit: 1
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-freelance-blueprint',
    slug: '7-figure-freelance-blueprint',
    title: 'The 7-Figure Freelancer Blueprint: From Zero to High-Ticket Retainers',
    author: 'Muhammad Husnain',
    shortDescription: 'The definitive roadmap to landing international remote clients, closing $2,000+ retainers, and scaling beyond hourly billing.',
    fullDescription: 'Stop competing in the low-price race to the bottom on saturated freelancing portals. The 7-Figure Freelancer Blueprint reveals battle-tested client acquisition strategies, value-based pricing models, proposal templates, and contract frameworks used by top remote professionals. Designed specifically for Pakistani and global freelancers seeking reliable dollar-earning opportunities.',
    whatYouWillLearn: [
      'How to position your skillset as an indispensable business investment rather than an expense',
      'The exact 4-part cold email and LinkedIn outreach script that secures qualified client calls',
      'Transitioning from low hourly rates to monthly recurring $1,500 – $3,500 client retainers',
      'Bulletproof invoice structures, international payment receipt methods, and contract safeguards',
      'Building a client referral loop that fills your pipeline without manual prospecting'
    ],
    contents: [
      'Chapter 1: The High-Income Freelance Mindset',
      'Chapter 2: Identifying Your $1,000+ Specialized Offer',
      'Chapter 3: Outbound Acquisition: Cold Pitching & Social Selling',
      'Chapter 4: The Discovery Call: Uncovering Client Pain Points',
      'Chapter 5: Closing Proposals & Value-Based Pricing',
      'Chapter 6: Onboarding, Retention & Recurring Retainers',
      'Bonus: 10 Ready-to-Send Outreach & Follow-up Templates'
    ],
    sampleExcerpt: 'Freelance success is never about working 80 hours a week for pennies. It is about understanding where commercial value resides, communicating that value with unflinching clarity, and delivering outcomes that make your retainer the best return on investment your client ever made.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    fileName: '7-Figure-Freelancer-Blueprint.pdf',
    fileSize: '4.8 MB',
    pageCount: 168,
    categoryId: 'cat-freelancing',
    tags: ['Freelancing', 'Client Acquisition', 'High Ticket', 'Remote Work'],
    language: 'English',
    format: 'PDF',
    isFree: false,
    regularPrice: 2499,
    salePrice: 1799,
    discountStart: '2025-01-01',
    discountEnd: '2026-12-31',
    isPublished: true,
    isFeatured: true,
    featuredOrder: 1,
    createdAt: '2025-01-10T12:00:00.000Z',
    updatedAt: '2025-01-10T12:00:00.000Z'
  },
  {
    id: 'prod-ai-prompting-mastery',
    slug: 'practical-ai-prompt-engineering',
    title: 'Practical AI & Prompt Engineering: Accelerate Your Work 10x',
    author: 'Muhammad Husnain',
    shortDescription: 'Master generative AI, advanced prompt architectures, autonomous agent workflows, and real-world productivity shortcuts.',
    fullDescription: 'AI will not replace humans, but professionals who wield AI will outpace those who do not. This comprehensive handbook cuts through the noise of superficial prompts. Learn systematic prompting frameworks, role prompting, chain-of-thought methodologies, document synthesis, and automated business integrations.',
    whatYouWillLearn: [
      'Core architecture of LLMs and how to eliminate hallucinations through contextual grounding',
      'The CLEAR prompt formula: Context, Logic, Execution, Adjustment, and Results',
      'Automating complex tasks: data extraction, market research, content generation, and code review',
      'Building your own domain-specific AI knowledge repository and custom instructions',
      'Monetizing AI capabilities in modern client workflows and content agencies'
    ],
    contents: [
      'Chapter 1: The Mechanics of Modern AI Systems',
      'Chapter 2: The CLEAR Prompting Architecture',
      'Chapter 3: Few-Shot Prompting & Structured Output Formatting',
      'Chapter 4: Automating Research, Synthesis & Writing',
      'Chapter 5: AI for Business Operations & Customer Support',
      'Chapter 6: Ethical AI, IP Safeguards & Future Horizons',
      'Bonus: 50 Production-Tested Enterprise System Prompts'
    ],
    sampleExcerpt: 'Effective prompt engineering is not about casting magic spells; it is about providing unambiguous boundary conditions, structured schema definitions, and explicit thinking frameworks to computational intelligence.',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileName: 'Practical-AI-Prompt-Engineering.pdf',
    fileSize: '5.2 MB',
    pageCount: 194,
    categoryId: 'cat-ai',
    tags: ['Artificial Intelligence', 'Prompt Engineering', 'Automation', 'Productivity'],
    language: 'English',
    format: 'PDF',
    isFree: false,
    regularPrice: 2999,
    salePrice: 1999,
    discountStart: '2025-01-01',
    discountEnd: '2026-12-31',
    isPublished: true,
    isFeatured: true,
    featuredOrder: 2,
    createdAt: '2025-01-15T12:00:00.000Z',
    updatedAt: '2025-01-15T12:00:00.000Z'
  },
  {
    id: 'prod-free-starter-handbook',
    slug: 'freelancers-starter-handbook-free',
    title: 'The Freelancer’s Quick Start Handbook: First $500 Roadmap',
    author: 'Muhammad Husnain',
    shortDescription: 'Free starter guide detailing how to set up your profiles, avoid beginner traps, and earn your first $500 online.',
    fullDescription: 'A practical, actionable introductory manual created to empower beginners. Completely free of charge with instant digital delivery upon claiming. Learn how to craft a compelling profile bio, showcase a starter portfolio without past clients, and submit proposals that win projects.',
    whatYouWillLearn: [
      'How to build a credible 3-project portfolio from scratch in under 7 days',
      'The 5 fatal proposal mistakes that cause 90% of beginner proposals to be archived',
      'Selecting a profitable niche that matches your existing strengths',
      'Navigating client communications and receiving your first payment safely'
    ],
    contents: [
      'Section 1: The Foundational Skills Audit',
      'Section 2: The Zero-Client Portfolio Strategy',
      'Section 3: Crafting High-Converting Beginner Proposals',
      'Section 4: Delivering Excellence & Earning 5-Star Feedback',
      'Checklist: First Project Readiness Checklist'
    ],
    sampleExcerpt: 'Your very first client does not care how long you have been in business; they only care if you understand their immediate problem and can be trusted to resolve it reliably.',
    coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    fileName: 'Freelancers-Quick-Start-Handbook.pdf',
    fileSize: '2.4 MB',
    pageCount: 52,
    categoryId: 'cat-freelancing',
    tags: ['Freelancing', 'Beginner Guide', 'Free Resource', 'Career'],
    language: 'English',
    format: 'PDF',
    isFree: true,
    regularPrice: 0,
    isPublished: true,
    isFeatured: true,
    featuredOrder: 3,
    createdAt: '2025-01-05T12:00:00.000Z',
    updatedAt: '2025-01-05T12:00:00.000Z'
  },
  {
    id: 'prod-digital-marketing-playbook',
    slug: 'modern-digital-marketing-playbook',
    title: 'Modern Digital Marketing Playbook: Traffic, Funnels & Conversions',
    author: 'Muhammad Husnain',
    shortDescription: 'Master paid media, organic audience compounding, persuasive copywriting, and high-converting marketing funnels.',
    fullDescription: 'Modern digital marketing is no longer about blind spending on ads; it is about building sustainable ecosystems where traffic transforms predictably into revenue. This playbook details organic viral dynamics, meta advertising economics, email segmentation, and landing page psychology.',
    whatYouWillLearn: [
      'Structuring profitable Meta and Google ad campaigns with strict CPA controls',
      'Landing page wireframes that consistently hit 15%+ conversion rates',
      'Automated email sequences that generate passive revenue from day 1',
      'Organic storytelling tactics that build authentic social following'
    ],
    contents: [
      'Chapter 1: The Modern Customer Journey',
      'Chapter 2: High-Converting Landing Page Architecture',
      'Chapter 3: Paid Traffic Economics & Campaign Launch',
      'Chapter 4: Copywriting Formulas That Trigger Action',
      'Chapter 5: Email Automation & Customer Lifecycle Marketing'
    ],
    sampleExcerpt: 'Good marketing does not convince people to buy what they do not need. Great marketing illuminates the exact bridge between where your customer is today and where they desperately desire to be.',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    fileName: 'Modern-Digital-Marketing-Playbook.pdf',
    fileSize: '6.1 MB',
    pageCount: 210,
    categoryId: 'cat-marketing',
    tags: ['Marketing', 'Copywriting', 'Sales Funnels', 'Meta Ads'],
    language: 'English',
    format: 'PDF',
    isFree: false,
    regularPrice: 2200,
    salePrice: 1599,
    discountStart: '2025-01-01',
    discountEnd: '2026-12-31',
    isPublished: true,
    isFeatured: false,
    createdAt: '2025-01-20T12:00:00.000Z',
    updatedAt: '2025-01-20T12:00:00.000Z'
  },
  {
    id: 'prod-free-ai-prompt-vault',
    slug: '100-essential-ai-prompts-vault-free',
    title: '100 Essential AI Prompts Vault: Business & Career Toolkit',
    author: 'Muhammad Husnain',
    shortDescription: 'Free curated repository of high-yield prompts for market research, coding, copywriting, and daily executive management.',
    fullDescription: 'Skip the trial and error with 100 thoroughly tested prompts organized by function. Includes prompts for marketing campaigns, proposal generation, client negotiation, financial analysis, and strategic decision making. Free for immediate digital access.',
    whatYouWillLearn: [
      '20 battle-tested marketing and content generation prompts',
      '25 executive productivity and strategic decision prompts',
      '25 client communication and sales objection prompts',
      '30 technical and research synthesis prompts'
    ],
    contents: [
      'Section 1: Executive & Business Strategy Prompts',
      'Section 2: High-Converting Sales & Marketing Prompts',
      'Section 3: Research, Data & Synthesis Prompts',
      'Section 4: Daily Productivity & Workflow Prompts'
    ],
    sampleExcerpt: 'A generic prompt yields generic mediocrity. A structured prompt with clear persona, explicit constraints, and step-by-step logic yields superhuman output.',
    coverUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    fileName: '100-Essential-AI-Prompts-Vault.pdf',
    fileSize: '1.9 MB',
    pageCount: 44,
    categoryId: 'cat-ai',
    tags: ['AI', 'Prompt Vault', 'Free Resource', 'Productivity'],
    language: 'English',
    format: 'PDF',
    isFree: true,
    regularPrice: 0,
    isPublished: true,
    isFeatured: true,
    featuredOrder: 4,
    createdAt: '2025-01-18T12:00:00.000Z',
    updatedAt: '2025-01-18T12:00:00.000Z'
  },
  {
    id: 'prod-personal-finance-mastery',
    slug: 'smart-money-habits-financial-freedom',
    title: 'Smart Money Habits: A Practical Guide to Financial Independence',
    author: 'Muhammad Husnain',
    shortDescription: 'Actionable wealth preservation, cashflow allocation, smart investing, and inflation-shielding for modern earners.',
    fullDescription: 'Earning money is only half the battle; defending and multiplying it is what creates true autonomy. Learn how to allocate your personal cash flow, establish rock-solid emergency reserves, navigate currency devaluation, and build long-term capital assets.',
    whatYouWillLearn: [
      'The 50/30/20 adapted cashflow model for volatile developing market economies',
      'Hedging against currency depreciation through diversified assets',
      'Systematic index investing and dividend compounding principles',
      'Psychological traps that prevent high earners from accumulating genuine wealth'
    ],
    contents: [
      'Chapter 1: The Psychology of Money & Consumption',
      'Chapter 2: Cash Flow Architecture & Emergency Defense',
      'Chapter 3: Defeating Inflation: Asset Classes Decoded',
      'Chapter 4: The Automated Monthly Investment Protocol',
      'Chapter 5: Long-Term Financial Independence Milestones'
    ],
    sampleExcerpt: 'Wealth is not the car you drive or the watch on your wrist. Wealth is the number of days you can live comfortably on your own terms without needing anyone’s permission.',
    coverUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    fileName: 'Smart-Money-Habits-Guide.pdf',
    fileSize: '3.7 MB',
    pageCount: 152,
    categoryId: 'cat-finance',
    tags: ['Personal Finance', 'Investing', 'Wealth', 'Money Management'],
    language: 'English',
    format: 'PDF',
    isFree: false,
    regularPrice: 1999,
    salePrice: 1399,
    discountStart: '2025-01-01',
    discountEnd: '2026-12-31',
    isPublished: true,
    isFeatured: false,
    createdAt: '2025-01-22T12:00:00.000Z',
    updatedAt: '2025-01-22T12:00:00.000Z'
  },
  {
    id: 'prod-deep-work-productivity',
    slug: 'deep-work-high-output-productivity',
    title: 'High-Output Mastery: The Science of Deep Focus & Discipline',
    author: 'Muhammad Husnain',
    shortDescription: 'Eliminate digital distraction, construct unbreakable daily routines, and achieve in 4 hours what others do in 12.',
    fullDescription: 'In an era of relentless algorithmic distraction, the ability to focus deeply on demanding cognitive tasks is an extraordinary competitive advantage. This book details actionable neuroscience-backed protocols for dopamine regulation, circadian rhythm optimization, and high-leverage time blocking.',
    whatYouWillLearn: [
      'How to enter flow state on command within 15 minutes of sitting down',
      'Eliminating reactive phone checking through friction engineering',
      'The 90-minute ultradian rhythm work block protocol',
      'Designing an energy management system that prevents burnout'
    ],
    contents: [
      'Chapter 1: The Attention Economy vs. Your Cognitive Sovereignty',
      'Chapter 2: The Neurobiology of Deep Focus',
      'Chapter 3: Structuring the High-Output Daily Architecture',
      'Chapter 4: Overcoming Resistance & Procrastination Loops',
      'Chapter 5: Sustained Energy, Recovery & Mental Longevity'
    ],
    sampleExcerpt: 'Discipline is not self-punishment; it is the ultimate act of self-respect. When you protect your morning focus, you protect your future from being dictated by other people’s priorities.',
    coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    fileName: 'High-Output-Mastery.pdf',
    fileSize: '3.3 MB',
    pageCount: 140,
    categoryId: 'cat-productivity',
    tags: ['Productivity', 'Focus', 'Deep Work', 'Habits'],
    language: 'English',
    format: 'PDF',
    isFree: false,
    regularPrice: 1800,
    salePrice: 1299,
    isPublished: true,
    isFeatured: false,
    createdAt: '2025-01-25T12:00:00.000Z',
    updatedAt: '2025-01-25T12:00:00.000Z'
  },
  {
    id: 'prod-mindset-resilience',
    slug: 'unbreakable-mindset-stoic-resilience',
    title: 'The Unbreakable Mindset: Principles of Emotional Sovereignty',
    author: 'Muhammad Husnain',
    shortDescription: 'Timeless principles for navigating high-stakes pressure, failure, uncertainty, and career setbacks with composure.',
    fullDescription: 'Success is an emotional endurance race. This book draws from classical philosophy, modern psychology, and real entrepreneurial battles to show you how to master internal dialogue, conquer imposter syndrome, and maintain unshakeable poise during high-stakes moments.',
    whatYouWillLearn: [
      'Reframing acute obstacles into strategic advantages',
      'Developing emotional detachment from temporary outcomes',
      'Overcoming fear of judgment and public failure',
      'Building enduring self-confidence through verified competence'
    ],
    contents: [
      'Chapter 1: Internal Sovereignty: What You Control',
      'Chapter 2: The Dichotomy of Effort and Outcome',
      'Chapter 3: Dismantling Imposter Syndrome & Self-Doubt',
      'Chapter 4: Thriving Under Uncertainty & Pressure',
      'Chapter 5: The Daily Stoic Audit'
    ],
    sampleExcerpt: 'You cannot control the waves of the market or the unpredictability of others; you can only master the rudder of your own discipline and integrity.',
    coverUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=800&q=80',
    fileName: 'The-Unbreakable-Mindset.pdf',
    fileSize: '4.1 MB',
    pageCount: 160,
    categoryId: 'cat-development',
    tags: ['Mindset', 'Personal Development', 'Resilience', 'Philosophy'],
    language: 'English',
    format: 'PDF',
    isFree: false,
    regularPrice: 2100,
    salePrice: 1499,
    isPublished: true,
    isFeatured: false,
    createdAt: '2025-01-28T12:00:00.000Z',
    updatedAt: '2025-01-28T12:00:00.000Z'
  }
];

// Helper to initialize sample private files
function initializePrivateEbookFiles(products: Product[]) {
  for (const prod of products) {
    const filePath = path.join(PRIVATE_EBOOKS_DIR, prod.fileName);
    if (!fs.existsSync(filePath)) {
      const sampleContent = `%PDF-1.4
% HUSNAIN EBOOKS OFFICIAL DIGITAL PUBLICATION
% Title: ${prod.title}
% Author: ${prod.author}
% Format: ${prod.format} | Pages: ${prod.pageCount}
% Language: ${prod.language}
% Licensed to Authorized Reader

============================================================
              HUSNAIN EBOOKS — OFFICIAL EDITION
                "Read. Learn. Grow."
============================================================

Title: ${prod.title}
Author: ${prod.author}
Category: ${prod.categoryId}

OVERVIEW:
${prod.fullDescription}

WHAT YOU WILL LEARN:
${prod.whatYouWillLearn.map((item, idx) => `[${idx + 1}] ${item}`).join('\n')}

TABLE OF CONTENTS:
${prod.contents.map((ch, idx) => `* ${ch}`).join('\n')}

EXCERPT / CHAPTER PREVIEW:
"${prod.sampleExcerpt || 'Practical knowledge executed consistently compounds into extraordinary mastery.'}"

------------------------------------------------------------
Copyright (c) Husnain Ebooks. All rights reserved.
Unauthorized duplication, distribution, or re-selling is strictly prohibited.
`;
      fs.writeFileSync(filePath, sampleContent, 'utf-8');
    }
  }
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
    initializePrivateEbookFiles(this.data.products);
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          categories: parsed.categories || DEFAULT_CATEGORIES,
          products: parsed.products || DEFAULT_PRODUCTS,
          orders: parsed.orders || [],
          promotions: parsed.promotions || DEFAULT_PROMOTIONS,
          entitlements: parsed.entitlements || [],
          downloadEvents: parsed.downloadEvents || [],
          settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
          auditLogs: parsed.auditLogs || [],
          emailNotifications: parsed.emailNotifications || []
        };
      } catch (err) {
        console.error('Error reading db.json, recreating defaults:', err);
      }
    }

    const initial: DatabaseSchema = {
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      orders: [],
      promotions: DEFAULT_PROMOTIONS,
      entitlements: [],
      downloadEvents: [],
      settings: DEFAULT_SETTINGS,
      auditLogs: [
        {
          id: 'log-init',
          timestamp: new Date().toISOString(),
          adminEmail: 'system',
          action: 'STORE_INITIALIZED',
          targetType: 'system',
          targetId: 'all',
          details: 'Initial store catalog and settings successfully loaded.'
        }
      ],
      emailNotifications: []
    };

    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave: DatabaseSchema = this.data) {
    try {
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to atomically save database:', err);
    }
  }

  // --- Products ---
  getProducts(includeUnpublished = false): Product[] {
    return includeUnpublished 
      ? this.data.products 
      : this.data.products.filter(p => p.isPublished);
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug);
  }

  saveProduct(product: Product): Product {
    const idx = this.data.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      this.data.products.push(product);
    }
    // Also ensure mock private file exists for this product
    initializePrivateEbookFiles([product]);
    this.saveDatabase();
    return product;
  }

  deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx >= 0) {
      // Soft-delete / unpublish or remove safely
      this.data.products.splice(idx, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  saveCategory(cat: Category): Category {
    const idx = this.data.categories.findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      this.data.categories[idx] = cat;
    } else {
      this.data.categories.push(cat);
    }
    this.saveDatabase();
    return cat;
  }

  deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.data.categories.splice(idx, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Promotions ---
  getPromotions(): Promotion[] {
    return this.data.promotions;
  }

  getPromotionByCode(code: string): Promotion | undefined {
    const normalized = code.trim().toUpperCase();
    return this.data.promotions.find(p => p.code.toUpperCase() === normalized);
  }

  savePromotion(promo: Promotion): Promotion {
    const idx = this.data.promotions.findIndex(p => p.id === promo.id);
    if (idx >= 0) {
      this.data.promotions[idx] = promo;
    } else {
      this.data.promotions.push(promo);
    }
    this.saveDatabase();
    return promo;
  }

  deletePromotion(id: string): boolean {
    const idx = this.data.promotions.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.data.promotions.splice(idx, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  incrementPromoRedemption(id: string): void {
    const promo = this.data.promotions.find(p => p.id === id);
    if (promo) {
      promo.currentRedemptions = (promo.currentRedemptions || 0) + 1;
      this.saveDatabase();
    }
  }

  // --- Orders ---
  getOrders(): Order[] {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  getOrderByAccessToken(token: string): Order | undefined {
    return this.data.orders.find(o => o.accessToken === token);
  }

  getOrdersByEmail(email: string): Order[] {
    const norm = email.trim().toLowerCase();
    return this.data.orders.filter(o => o.customerEmail.toLowerCase() === norm);
  }

  saveOrder(order: Order): Order {
    const idx = this.data.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.data.orders[idx] = { ...order, updatedAt: new Date().toISOString() };
    } else {
      this.data.orders.push(order);
    }
    this.saveDatabase();
    return order;
  }

  // --- Entitlements ---
  getEntitlements(customerEmail?: string): Entitlement[] {
    if (customerEmail) {
      const norm = customerEmail.trim().toLowerCase();
      return this.data.entitlements.filter(e => e.customerEmail.toLowerCase() === norm && e.isActive);
    }
    return this.data.entitlements;
  }

  hasEntitlement(customerEmail: string, productId: string): boolean {
    const norm = customerEmail.trim().toLowerCase();
    return this.data.entitlements.some(e => 
      e.customerEmail.toLowerCase() === norm && 
      e.productId === productId && 
      e.isActive
    );
  }

  grantEntitlement(orderId: string, customerEmail: string, productId: string): Entitlement {
    const existing = this.data.entitlements.find(e => 
      e.orderId === orderId && 
      e.productId === productId && 
      e.isActive
    );
    if (existing) return existing;

    const newEntitlement: Entitlement = {
      id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      customerEmail: customerEmail.trim().toLowerCase(),
      productId,
      grantedAt: new Date().toISOString(),
      isActive: true
    };
    this.data.entitlements.push(newEntitlement);
    this.saveDatabase();
    return newEntitlement;
  }

  revokeEntitlement(orderId: string, productId: string, reason: string): boolean {
    let found = false;
    for (const ent of this.data.entitlements) {
      if (ent.orderId === orderId && (!productId || ent.productId === productId)) {
        ent.isActive = false;
        ent.revokedAt = new Date().toISOString();
        ent.revokeReason = reason;
        found = true;
      }
    }
    if (found) this.saveDatabase();
    return found;
  }

  // --- Download Events ---
  logDownloadEvent(orderId: string, productId: string, customerEmail: string, ipAddress?: string): DownloadEvent {
    const event: DownloadEvent = {
      id: `dl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      productId,
      customerEmail,
      ipAddress,
      downloadedAt: new Date().toISOString()
    };
    this.data.downloadEvents.push(event);
    this.saveDatabase();
    return event;
  }

  getDownloadEvents(orderId?: string): DownloadEvent[] {
    if (orderId) {
      return this.data.downloadEvents.filter(e => e.orderId === orderId);
    }
    return this.data.downloadEvents;
  }

  // --- Settings ---
  getSettings(): AdminSettings {
    return this.data.settings;
  }

  updateSettings(settings: Partial<AdminSettings>): AdminSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- Audit Logs ---
  logAudit(adminEmail: string, action: string, targetType: string, targetId: string, details: string): AdminAuditLog {
    const entry: AdminAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action,
      targetType,
      targetId,
      details
    };
    this.data.auditLogs.unshift(entry);
    // Keep last 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.saveDatabase();
    return entry;
  }

  getAuditLogs(): AdminAuditLog[] {
    return this.data.auditLogs;
  }

  // --- Email Notifications ---
  logEmail(emailNotification: Omit<EmailNotification, 'id'>): EmailNotification {
    const entry: EmailNotification = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...emailNotification
    };
    this.data.emailNotifications.unshift(entry);
    if (this.data.emailNotifications.length > 500) {
      this.data.emailNotifications = this.data.emailNotifications.slice(0, 500);
    }
    this.saveDatabase();
    return entry;
  }

  getEmailLogs(): EmailNotification[] {
    return this.data.emailNotifications;
  }

  // Private File Path helpers
  getPrivateFilePath(fileName: string): string {
    return path.join(PRIVATE_EBOOKS_DIR, fileName);
  }

  getReceiptFilePath(fileName: string): string {
    return path.join(RECEIPTS_DIR, fileName);
  }
}

export const db = new Database();
