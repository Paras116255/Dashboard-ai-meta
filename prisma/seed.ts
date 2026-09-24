import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for AdPilot AI...');

  // Clean existing tables
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.automationExecution.deleteMany({});
  await prisma.automationRule.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.adInsight.deleteMany({});
  await prisma.ad.deleteMany({});
  await prisma.adSet.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.adCreative.deleteMany({});
  await prisma.metaAdAccount.deleteMany({});
  await prisma.metaBusiness.deleteMany({});
  await prisma.metaConnection.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.aIGeneration.deleteMany({});
  await prisma.aIProject.deleteMany({});
  await prisma.trendAd.deleteMany({});
  await prisma.trendProduct.deleteMany({});
  await prisma.watchlist.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Demo User & Organization
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      id: 'usr_demo_paras_01',
      email: 'paras@adpilot.ai',
      name: 'Paras Sharma',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const org = await prisma.organization.create({
    data: {
      id: 'org_demo_agency_01',
      name: 'AdPilot Growth Agency',
      slug: 'adpilot-growth',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      plan: 'PRO',
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 2. Create Meta Integration Objects
  const metaConn = await prisma.metaConnection.create({
    data: {
      id: 'mconn_demo_01',
      organizationId: org.id,
      metaUserId: '109283749102938',
      metaUserName: 'Paras Sharma (Business Admin)',
      accessTokenEncrypted: 'enc_mock_long_lived_meta_access_token_v20',
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
    },
  });

  const metaBus = await prisma.metaBusiness.create({
    data: {
      id: 'mbus_demo_01',
      organizationId: org.id,
      metaConnectionId: metaConn.id,
      metaBusinessId: 'biz_88392019482',
      name: 'AdPilot Global Ecom Manager',
      verificationStatus: 'VERIFIED',
    },
  });

  const adAccount = await prisma.metaAdAccount.create({
    data: {
      id: 'act_demo_01',
      organizationId: org.id,
      businessId: metaBus.id,
      metaAccountId: 'act_994021049281',
      name: 'AdPilot Direct Response - INR Account',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      status: 'ACTIVE',
      spendCap: 50000000, // 500,000 INR in paise
      amountSpent: 18450000, // 184,500 INR in paise
      lastSyncedAt: new Date(),
    },
  });

  // 3. Create Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      id: 'cmp_scale_01',
      organizationId: org.id,
      adAccountId: adAccount.id,
      metaCampaignId: '23851092830192',
      name: '🔥 Q3 Scaling - Waterproof Backpack (US/IN)',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      objective: 'OUTCOME_SALES',
      dailyBudget: 1500000, // ₹15,000 / day
      spend: 9425000, // ₹94,250
      impressions: 482000,
      reach: 310000,
      clicks: 14200,
      ctr: 2.95,
      cpc: 6.63,
      cpm: 195.5,
      conversions: 382,
      roas: 3.42,
      lastSyncedAt: new Date(),
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      id: 'cmp_retarget_02',
      organizationId: org.id,
      adAccountId: adAccount.id,
      metaCampaignId: '23851092830193',
      name: '🎯 Retargeting - Add To Cart 7 Days',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      objective: 'OUTCOME_SALES',
      dailyBudget: 500000, // ₹5,000 / day
      spend: 3200000, // ₹32,000
      impressions: 98000,
      reach: 42000,
      clicks: 4900,
      ctr: 5.0,
      cpc: 6.53,
      cpm: 326.5,
      conversions: 185,
      roas: 4.85,
      lastSyncedAt: new Date(),
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      id: 'cmp_ugc_03',
      organizationId: org.id,
      adAccountId: adAccount.id,
      metaCampaignId: '23851092830194',
      name: '🎥 UGC Video Hooks Testing',
      status: 'PAUSED',
      effectiveStatus: 'PAUSED',
      objective: 'OUTCOME_LEADS',
      dailyBudget: 300000,
      spend: 1850000,
      impressions: 120000,
      reach: 95000,
      clicks: 2800,
      ctr: 2.33,
      cpc: 6.6,
      cpm: 154.1,
      conversions: 42,
      roas: 1.15,
      lastSyncedAt: new Date(),
    },
  });

  // 4. Create AdSets
  const adSet1 = await prisma.adSet.create({
    data: {
      id: 'adset_us_broad_01',
      organizationId: org.id,
      campaignId: campaign1.id,
      metaAdSetId: '23851092830201',
      name: 'US - Broad Adults 22-45 (Advantage+)',
      status: 'ACTIVE',
      dailyBudget: 1000000,
      targetingJson: JSON.stringify({ geo: ['US'], age_min: 22, age_max: 45, broad: true }),
      spend: 6420000,
      impressions: 340000,
      reach: 220000,
      clicks: 9800,
      ctr: 2.88,
      cpc: 6.55,
      cpm: 188.8,
      conversions: 260,
      roas: 3.55,
      lastSyncedAt: new Date(),
    },
  });

  const adSet2 = await prisma.adSet.create({
    data: {
      id: 'adset_in_metro_02',
      organizationId: org.id,
      campaignId: campaign1.id,
      metaAdSetId: '23851092830202',
      name: 'IN - Tier 1 Metro Frequent Travelers',
      status: 'ACTIVE',
      dailyBudget: 500000,
      targetingJson: JSON.stringify({ geo: ['IN'], cities: ['Mumbai', 'Delhi', 'Bengaluru'], interests: ['Travel'] }),
      spend: 3005000,
      impressions: 142000,
      reach: 90000,
      clicks: 4400,
      ctr: 3.1,
      cpc: 6.82,
      cpm: 211.6,
      conversions: 122,
      roas: 3.15,
      lastSyncedAt: new Date(),
    },
  });

  // 5. Create Creatives
  const creative1 = await prisma.adCreative.create({
    data: {
      id: 'cr_backpack_video_01',
      organizationId: org.id,
      name: 'Rainproof Test - 10L Expandable Backpack',
      title: 'Never Worry About Rain Again 🎒🌧️',
      body: 'Designed for digital nomads and weekend travelers. 100% waterproof TPU coating, anti-theft secret pockets, built-in USB charging port.',
      callToAction: 'SHOP_NOW',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      linkUrl: 'https://adpilot-demo.shop/products/travel-backpack',
      format: 'VIDEO',
    },
  });

  const creative2 = await prisma.adCreative.create({
    data: {
      id: 'cr_backpack_carousel_02',
      organizationId: org.id,
      name: 'Unboxing UGC Reel - Travel Must-Haves',
      title: 'Fits 3 Days of Clothes in a Carry-on Size!',
      body: 'Watch how I pack for a 4-day flight in this ultra-lightweight ergonomic pack.',
      callToAction: 'GET_OFFER',
      imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
      linkUrl: 'https://adpilot-demo.shop/products/travel-backpack',
      format: 'IMAGE',
    },
  });

  // 6. Create Ads
  const ad1 = await prisma.ad.create({
    data: {
      id: 'ad_backpack_hero_01',
      organizationId: org.id,
      adAccountId: adAccount.id,
      campaignId: campaign1.id,
      adSetId: adSet1.id,
      metaAdId: '23851092830301',
      name: 'Backpack Hero UGC #1 - Waterproof Shower Test',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      configuredStatus: 'ACTIVE',
      dailyBudget: 600000,
      spend: 4200000, // ₹42,000
      impressions: 210000,
      reach: 140000,
      clicks: 6500,
      ctr: 3.09,
      cpc: 6.46,
      cpm: 200.0,
      conversions: 180,
      cpa: 233.33,
      roas: 3.85,
      creativeId: creative1.id,
      lastSyncedAt: new Date(),
    },
  });

  const ad2 = await prisma.ad.create({
    data: {
      id: 'ad_backpack_carousel_02',
      organizationId: org.id,
      adAccountId: adAccount.id,
      campaignId: campaign1.id,
      adSetId: adSet1.id,
      metaAdId: '23851092830302',
      name: 'Backpack Multi-Pocket Feature Breakdown',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      configuredStatus: 'ACTIVE',
      dailyBudget: 400000,
      spend: 2220000, // ₹22,200
      impressions: 130000,
      reach: 80000,
      clicks: 3300,
      ctr: 2.54,
      cpc: 6.72,
      cpm: 170.7,
      conversions: 80,
      cpa: 277.5,
      roas: 3.02,
      creativeId: creative2.id,
      lastSyncedAt: new Date(),
    },
  });

  const ad3 = await prisma.ad.create({
    data: {
      id: 'ad_low_perf_03',
      organizationId: org.id,
      adAccountId: adAccount.id,
      campaignId: campaign3.id,
      adSetId: adSet2.id,
      metaAdId: '23851092830303',
      name: 'Old Static Banner - 15% OFF Discount',
      status: 'PAUSED',
      effectiveStatus: 'PAUSED',
      configuredStatus: 'PAUSED',
      dailyBudget: 200000,
      spend: 1850000, // ₹18,500
      impressions: 120000,
      reach: 95000,
      clicks: 2800,
      ctr: 2.33,
      cpc: 6.6,
      cpm: 154.1,
      conversions: 42,
      cpa: 440.47,
      roas: 1.15,
      creativeId: creative2.id,
      lastSyncedAt: new Date(),
    },
  });

  // 7. Create Comments
  await prisma.comment.createMany({
    data: [
      {
        id: 'cmt_01',
        organizationId: org.id,
        adId: ad1.id,
        metaCommentId: 'mcmt_1001',
        authorName: 'Aarav Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        text: 'How long does delivery take to Bengaluru? I have a trip next Monday!',
        sentiment: 'POSITIVE',
        category: 'PURCHASE_INTENT',
        purchaseIntent: 'HIGH',
        status: 'UNREAD',
        replyText: 'Hi Aarav! Delivery to Bengaluru takes 2-3 business days via express courier.',
      },
      {
        id: 'cmt_02',
        organizationId: org.id,
        adId: ad1.id,
        metaCommentId: 'mcmt_1002',
        authorName: 'Sneha Patel',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        text: 'Does this backpack fit a 16 inch MacBook Pro safely?',
        sentiment: 'NEUTRAL',
        category: 'QUESTION',
        purchaseIntent: 'MEDIUM',
        status: 'UNREAD',
      },
      {
        id: 'cmt_03',
        organizationId: org.id,
        adId: ad2.id,
        metaCommentId: 'mcmt_1003',
        authorName: 'Rohan Gupta',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
        text: 'Bought this last week! Super sturdy zip and totally waterproof during Mumbai monsoons 🌧️👍',
        sentiment: 'POSITIVE',
        category: 'OTHER',
        purchaseIntent: 'LOW',
        status: 'REVIEWED',
      },
      {
        id: 'cmt_04',
        organizationId: org.id,
        adId: ad3.id,
        metaCommentId: 'mcmt_1004',
        authorName: 'Spam Bot 99',
        text: 'Make $500/day from home crypto trading dm me fast fast',
        sentiment: 'NEGATIVE',
        category: 'SPAM',
        purchaseIntent: 'LOW',
        status: 'HIDDEN',
        isHidden: true,
      },
    ],
  });

  // 8. Create Automation Rules & Executions
  const rule1 = await prisma.automationRule.create({
    data: {
      id: 'rule_stop_high_spend_01',
      organizationId: org.id,
      name: '🛡️ Budget Safety Guard: Pause if Spend >= ₹5,000 with ROAS < 1.5',
      ruleType: 'BUDGET_SPEND_THRESHOLD',
      metricType: 'SPEND',
      condition: 'GREATER_THAN_EQUAL',
      thresholdValue: 500000, // 5,000 INR in paise
      action: 'PAUSE_AD',
      isEnabled: true,
      cooldownMinutes: 60,
      lastTriggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  });

  await prisma.automationExecution.create({
    data: {
      id: 'exec_01',
      organizationId: org.id,
      ruleId: rule1.id,
      adId: ad3.id,
      triggeredBy: 'Spend reached ₹18,500 with ROAS 1.15 (Target ROAS >= 1.5)',
      actionTaken: 'PAUSED_AD',
      status: 'SUCCESS',
      details: JSON.stringify({ metaAdId: ad3.metaAdId, spendINR: 18500, previousStatus: 'ACTIVE' }),
      executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  });

  // 9. Create AI Projects & Generations
  const aiProject = await prisma.aIProject.create({
    data: {
      id: 'aip_backpack_01',
      organizationId: org.id,
      name: 'Rainproof Travel Backpack - Q4 Launch',
      description: 'Generate high-converting direct response copy, image concepts & UGC scripts for commuters.',
      targetCountry: 'US & IN',
      targetAudience: 'Working Professionals, Tech Nomads & Weekend Hikers (24-42)',
      language: 'English',
      objective: 'OUTCOME_SALES',
      brandTone: 'Urgent, High Utility & Modern Premium',
      status: 'REVIEWED',
    },
  });

  await prisma.aIGeneration.createMany({
    data: [
      {
        id: 'aigen_01',
        organizationId: org.id,
        projectId: aiProject.id,
        conceptName: 'Problem-Solution: Wet Laptop Disaster',
        headline: 'Stop Worrying About Unexpected Rain Ruining Your $2,000 Laptop 💻🌧️',
        primaryText: 'Did you know standard backpacks soak through in under 3 minutes of rain? The AdPilot Nomad Shield features military-grade 900D waterproof TPU, YKK sealed zips, and dedicated TSA laptop suspension.',
        callToAction: 'SHOP_NOW',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        videoScript: 'HOOK (0-3s): [Splashes bucket of water on backpack while laptop is inside].\nBODY (3-12s): Show dry laptop coming out unharmed + TSA checkpoint fold.\nCTA (12-15s): Get 20% OFF today only!',
        complianceStatus: 'PASS',
        complianceDetails: JSON.stringify([{ check: 'No medical/financial claims', result: 'PASS' }]),
      },
      {
        id: 'aigen_02',
        organizationId: org.id,
        projectId: aiProject.id,
        conceptName: 'UGC Testimonial: Flight Packing Hack',
        headline: 'How I Skip Baggage Fees Every Single Flight ✈️',
        primaryText: 'Pack 4 days of clothes, 2 pairs of shoes, and your work gear into a single carry-on that fits under airline seats.',
        callToAction: 'GET_OFFER',
        imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
        complianceStatus: 'PASS',
        complianceDetails: JSON.stringify([{ check: 'Claim verification', result: 'PASS' }]),
      },
    ],
  });

  // 10. Create Trend Intelligence Products & Ads
  const trendProd1 = await prisma.trendProduct.create({
    data: {
      id: 'tp_01',
      name: 'Orthopedic Cloud Slides ☁️',
      category: 'Footwear & Comfort',
      country: 'US',
      brand: 'CloudWalk Footwear',
      landingPageUrl: 'https://cloudwalkslides.com',
      imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
      adCount: 42,
      creativeCount: 128,
      trendScore: 94,
      trendVelocity: 'EXPLOSIVE',
      source: 'Meta Ad Library & Public Signals',
    },
  });

  const trendProd2 = await prisma.trendProduct.create({
    data: {
      id: 'tp_02',
      name: 'Portable Espresso Press V2',
      category: 'Kitchen & Coffee',
      country: 'DE',
      brand: 'NomadBrew Co',
      landingPageUrl: 'https://nomadbrew.co',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
      adCount: 28,
      creativeCount: 64,
      trendScore: 88,
      trendVelocity: 'HIGH',
      source: 'Meta Ad Library',
    },
  });

  await prisma.trendAd.createMany({
    data: [
      {
        id: 'tad_01',
        trendProductId: trendProd1.id,
        title: 'Walking on Air All Day - 45% OFF Flash Sale',
        brandName: 'CloudWalk Footwear',
        headline: 'Say Goodbye To Foot & Heel Pain in 7 Days 👣',
        bodyText: '4.5cm compression molded EVA foam cushions every step. Waterproof, washable, and non-slip.',
        ctaText: 'Shop Now',
        creativeType: 'VIDEO',
        creativeUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
        pageUrl: 'https://facebook.com/cloudwalkofficial',
        country: 'US',
        durationDays: 28,
        hookAnalysis: 'Relief Hook: Targets foot pain sufferers immediately with visual squish test.',
      },
      {
        id: 'tad_02',
        trendProductId: trendProd2.id,
        title: 'Barista Quality Espresso Anywhere',
        brandName: 'NomadBrew Co',
        headline: 'Fresh Espresso On The Mountain Trail 🏔️☕',
        bodyText: 'No electricity needed. 18-bar manual pressure pump creates authentic crema in 30 seconds.',
        ctaText: 'Order Today',
        creativeType: 'IMAGE',
        creativeUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
        pageUrl: 'https://facebook.com/nomadbrew',
        country: 'DE',
        durationDays: 19,
        hookAnalysis: 'Aesthetic Outdoor Hook: Displays hot espresso being poured on a snowy peak.',
      },
    ],
  });

  // 11. Create Audit Logs & Notifications
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'log_01',
        organizationId: org.id,
        userId: user.id,
        userName: 'Paras Sharma',
        action: 'UPDATE_AD_BUDGET',
        objectType: 'AD',
        objectId: ad1.id,
        details: JSON.stringify({ oldBudgetINR: 4000, newBudgetINR: 6000, metaAdId: ad1.metaAdId }),
        result: 'SUCCESS',
      },
      {
        id: 'log_02',
        organizationId: org.id,
        userName: 'Automation Worker',
        action: 'AUTOMATION_PAUSE_AD',
        objectType: 'AD',
        objectId: ad3.id,
        details: JSON.stringify({ ruleId: rule1.id, reason: 'Spend threshold reached' }),
        result: 'SUCCESS',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        id: 'notif_01',
        organizationId: org.id,
        userId: user.id,
        title: '🛑 Ad Automatically Paused',
        message: 'Rule "Budget Safety Guard" paused "Old Static Banner - 15% OFF Discount" (Spend ₹18,500).',
        type: 'WARNING',
        isRead: false,
      },
      {
        id: 'notif_02',
        organizationId: org.id,
        userId: user.id,
        title: '🚀 New High Intent Comment',
        message: 'Aarav Sharma commented: "How long does delivery take to Bengaluru?"',
        type: 'INFO',
        isRead: false,
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
