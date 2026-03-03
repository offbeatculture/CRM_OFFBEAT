export const coaches = [
  { id: 1, name: "Sarah Mitchell", avatar: "SM", specialty: "Mindset & Performance", color: "hsl(221, 83%, 53%)" },
  { id: 2, name: "James Rodriguez", avatar: "JR", specialty: "Business Growth", color: "hsl(142, 71%, 45%)" },
  { id: 3, name: "Priya Sharma", avatar: "PS", specialty: "Leadership", color: "hsl(280, 67%, 55%)" },
  { id: 4, name: "David Kim", avatar: "DK", specialty: "Sales Mastery", color: "hsl(38, 92%, 50%)" },
  { id: 5, name: "Emma Wilson", avatar: "EW", specialty: "Life Transformation", color: "hsl(349, 79%, 55%)" },
];

export const campaigns = [
  { id: 1, name: "Scale Your Business 2024", platform: "Facebook", budget: 12500, spend: 9800, leads: 342, revenue: 48200, roas: 4.92 },
  { id: 2, name: "Leadership Masterclass", platform: "Instagram", budget: 8000, spend: 6200, leads: 198, revenue: 31500, roas: 5.08 },
  { id: 3, name: "Sales Bootcamp Launch", platform: "YouTube", budget: 15000, spend: 11300, leads: 456, revenue: 62800, roas: 5.56 },
];

export type Lead = {
  id: number; name: string; phone: string; email: string; source: string; campaign: string;
  coachId: number; status: string; waJoined: boolean; zoomAttended: boolean; paymentStatus: string; tags: string[];
};

export const leads: Lead[] = [
  { id: 1, name: "Alex Turner", phone: "+1-555-0101", email: "alex@email.com", source: "Facebook", campaign: "Scale Your Business 2024", coachId: 1, status: "Converted", waJoined: true, zoomAttended: true, paymentStatus: "Paid", tags: ["Hot", "VIP"] },
  { id: 2, name: "Maria Santos", phone: "+1-555-0102", email: "maria@email.com", source: "Instagram", campaign: "Leadership Masterclass", coachId: 3, status: "Attended Zoom", waJoined: true, zoomAttended: true, paymentStatus: "Pending", tags: ["Warm"] },
  { id: 3, name: "John Chen", phone: "+1-555-0103", email: "john@email.com", source: "YouTube", campaign: "Sales Bootcamp Launch", coachId: 4, status: "Joined WA", waJoined: true, zoomAttended: false, paymentStatus: "None", tags: ["New"] },
  { id: 4, name: "Lisa Park", phone: "+1-555-0104", email: "lisa@email.com", source: "Facebook", campaign: "Scale Your Business 2024", coachId: 2, status: "Contacted", waJoined: false, zoomAttended: false, paymentStatus: "None", tags: [] },
  { id: 5, name: "Omar Hassan", phone: "+1-555-0105", email: "omar@email.com", source: "Google", campaign: "Leadership Masterclass", coachId: 3, status: "New", waJoined: false, zoomAttended: false, paymentStatus: "None", tags: ["Cold"] },
  { id: 6, name: "Sophie Brown", phone: "+1-555-0106", email: "sophie@email.com", source: "Instagram", campaign: "Sales Bootcamp Launch", coachId: 5, status: "Converted", waJoined: true, zoomAttended: true, paymentStatus: "Paid", tags: ["VIP"] },
  { id: 7, name: "Ryan Murphy", phone: "+1-555-0107", email: "ryan@email.com", source: "Facebook", campaign: "Scale Your Business 2024", coachId: 1, status: "Joined WA", waJoined: true, zoomAttended: false, paymentStatus: "None", tags: ["Warm"] },
  { id: 8, name: "Aisha Khan", phone: "+1-555-0108", email: "aisha@email.com", source: "YouTube", campaign: "Leadership Masterclass", coachId: 2, status: "Attended Zoom", waJoined: true, zoomAttended: true, paymentStatus: "Pending", tags: ["Hot"] },
  { id: 9, name: "Carlos Mendez", phone: "+1-555-0109", email: "carlos@email.com", source: "Google", campaign: "Sales Bootcamp Launch", coachId: 4, status: "New", waJoined: false, zoomAttended: false, paymentStatus: "None", tags: [] },
  { id: 10, name: "Emily Davis", phone: "+1-555-0110", email: "emily@email.com", source: "Facebook", campaign: "Scale Your Business 2024", coachId: 5, status: "Contacted", waJoined: false, zoomAttended: false, paymentStatus: "None", tags: ["Cold"] },
  { id: 11, name: "Tanaka Yuki", phone: "+1-555-0111", email: "tanaka@email.com", source: "Instagram", campaign: "Leadership Masterclass", coachId: 1, status: "Converted", waJoined: true, zoomAttended: true, paymentStatus: "Paid", tags: ["VIP", "Hot"] },
  { id: 12, name: "Grace Lee", phone: "+1-555-0112", email: "grace@email.com", source: "YouTube", campaign: "Sales Bootcamp Launch", coachId: 3, status: "Joined WA", waJoined: true, zoomAttended: false, paymentStatus: "None", tags: ["Warm"] },
  { id: 13, name: "Ben Wright", phone: "+1-555-0113", email: "ben@email.com", source: "Facebook", campaign: "Scale Your Business 2024", coachId: 2, status: "Attended Zoom", waJoined: true, zoomAttended: true, paymentStatus: "Pending", tags: [] },
  { id: 14, name: "Nina Patel", phone: "+1-555-0114", email: "nina@email.com", source: "Google", campaign: "Leadership Masterclass", coachId: 4, status: "New", waJoined: false, zoomAttended: false, paymentStatus: "None", tags: ["New"] },
  { id: 15, name: "Luke Anderson", phone: "+1-555-0115", email: "luke@email.com", source: "Instagram", campaign: "Sales Bootcamp Launch", coachId: 5, status: "Converted", waJoined: true, zoomAttended: true, paymentStatus: "Paid", tags: ["VIP"] },
  { id: 16, name: "Fatima Ali", phone: "+1-555-0116", email: "fatima@email.com", source: "Facebook", campaign: "Scale Your Business 2024", coachId: 1, status: "Contacted", waJoined: false, zoomAttended: false, paymentStatus: "None", tags: [] },
  { id: 17, name: "Chris Taylor", phone: "+1-555-0117", email: "chris@email.com", source: "YouTube", campaign: "Leadership Masterclass", coachId: 3, status: "Joined WA", waJoined: true, zoomAttended: false, paymentStatus: "None", tags: ["Warm"] },
  { id: 18, name: "Rachel Green", phone: "+1-555-0118", email: "rachel@email.com", source: "Google", campaign: "Sales Bootcamp Launch", coachId: 2, status: "Attended Zoom", waJoined: true, zoomAttended: true, paymentStatus: "Pending", tags: ["Hot"] },
  { id: 19, name: "Diego Rivera", phone: "+1-555-0119", email: "diego@email.com", source: "Facebook", campaign: "Scale Your Business 2024", coachId: 4, status: "New", waJoined: false, zoomAttended: false, paymentStatus: "None", tags: [] },
  { id: 20, name: "Hannah Scott", phone: "+1-555-0120", email: "hannah@email.com", source: "Instagram", campaign: "Leadership Masterclass", coachId: 5, status: "Converted", waJoined: true, zoomAttended: true, paymentStatus: "Paid", tags: ["VIP", "Hot"] },
];

export const automations = [
  { id: 1, name: "Lead Assigned → WA Message", trigger: "Lead Assignment", status: "Active", lastTriggered: "2 mins ago", executions: 1245, failureRate: 0.8 },
  { id: 2, name: "WA Joined → Reminder Sequence", trigger: "WA Group Join", status: "Active", lastTriggered: "15 mins ago", executions: 892, failureRate: 1.2 },
  { id: 3, name: "Zoom Registered → Reminder + Follow-up", trigger: "Zoom Registration", status: "Active", lastTriggered: "1 hour ago", executions: 567, failureRate: 0.5 },
  { id: 4, name: "Payment Done → Onboarding Flow", trigger: "Payment Confirmation", status: "Paused", lastTriggered: "3 hours ago", executions: 234, failureRate: 2.1 },
  { id: 5, name: "No Show → Re-engagement", trigger: "Zoom No-Show", status: "Active", lastTriggered: "30 mins ago", executions: 156, failureRate: 3.4 },
];

export const whatsappGroups = [
  { id: 1, name: "Scale Business - Batch 12", coachId: 1, joinLink: "https://wa.me/group1", members: 87, status: "Active", zoomLink: "https://zoom.us/j/111" },
  { id: 2, name: "Leadership Elite", coachId: 3, joinLink: "https://wa.me/group2", members: 64, status: "Active", zoomLink: "https://zoom.us/j/222" },
  { id: 3, name: "Sales Mastery Pro", coachId: 4, joinLink: "https://wa.me/group3", members: 112, status: "Active", zoomLink: "https://zoom.us/j/333" },
  { id: 4, name: "Growth Accelerator", coachId: 2, joinLink: "https://wa.me/group4", members: 45, status: "Closed", zoomLink: "https://zoom.us/j/444" },
  { id: 5, name: "Life Transform Circle", coachId: 5, joinLink: "https://wa.me/group5", members: 93, status: "Active", zoomLink: "https://zoom.us/j/555" },
];

export const zoomSessions = [
  { id: 1, name: "Scale Your Business Webinar", coachId: 1, date: "2024-03-15 7:00 PM", link: "https://zoom.us/j/111", registrations: 156, attendance: 78, revenue: 12400 },
  { id: 2, name: "Leadership Masterclass Live", coachId: 3, date: "2024-03-16 6:00 PM", link: "https://zoom.us/j/222", registrations: 98, attendance: 62, revenue: 8900 },
  { id: 3, name: "Sales Bootcamp Session 1", coachId: 4, date: "2024-03-17 8:00 PM", link: "https://zoom.us/j/333", registrations: 210, attendance: 85, revenue: 18500 },
  { id: 4, name: "Business Growth Workshop", coachId: 2, date: "2024-03-18 5:00 PM", link: "https://zoom.us/j/444", registrations: 134, attendance: 71, revenue: 9800 },
  { id: 5, name: "Life Transformation Event", coachId: 5, date: "2024-03-19 7:30 PM", link: "https://zoom.us/j/555", registrations: 178, attendance: 82, revenue: 15200 },
];

export const creatives = [
  { id: 1, name: "Scale Business - Video Ad", platform: "Facebook", ctr: 3.2, cpc: 1.45, cpl: 28.65, roas: 4.92, coachId: 1, status: "Active" },
  { id: 2, name: "Leadership - Carousel", platform: "Instagram", ctr: 2.8, cpc: 1.12, cpl: 31.31, roas: 5.08, coachId: 3, status: "Active" },
  { id: 3, name: "Sales Bootcamp - YT Pre-roll", platform: "YouTube", ctr: 4.1, cpc: 0.98, cpl: 24.78, roas: 5.56, coachId: 4, status: "Active" },
  { id: 4, name: "Growth Hack - Static", platform: "Facebook", ctr: 1.9, cpc: 2.10, cpl: 42.00, roas: 3.21, coachId: 2, status: "Paused" },
  { id: 5, name: "Transform Life - Reel", platform: "Instagram", ctr: 3.6, cpc: 0.87, cpl: 22.50, roas: 6.12, coachId: 5, status: "Active" },
];

export const dailyLeadData = [
  { day: "Mon", leads: 42 }, { day: "Tue", leads: 58 }, { day: "Wed", leads: 35 },
  { day: "Thu", leads: 67 }, { day: "Fri", leads: 52 }, { day: "Sat", leads: 28 }, { day: "Sun", leads: 19 },
];

export const revenueVsSpend = [
  { month: "Jan", revenue: 32000, spend: 6800 }, { month: "Feb", revenue: 38000, spend: 7200 },
  { month: "Mar", revenue: 45000, spend: 8500 }, { month: "Apr", revenue: 52000, spend: 9100 },
  { month: "May", revenue: 48000, spend: 8800 }, { month: "Jun", revenue: 61000, spend: 10200 },
];

export const funnelData = [
  { stage: "Total Leads", value: 996 },
  { stage: "WA Joined", value: 612 },
  { stage: "Zoom Attended", value: 378 },
  { stage: "Purchased", value: 142 },
];
