import prisma from "@/lib/prisma";
import type {
  AnalyticsKpis,
  AnalyticsResponse,
  DateRange,
  FunnelStage,
  PlatformMixItem,
  VolumeDataPoint,
} from "./types";

function getRangeStartDate(range: DateRange): Date {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getPreviousPeriodRange(range: DateRange): { start: Date; end: Date } {
  const end = getRangeStartDate(range);
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function calculateChange(
  current: number,
  previous: number,
): number | undefined {
  if (previous === 0) return undefined;
  return Math.round(((current - previous) / previous) * 100);
}

function addComparisonToKpis(
  current: AnalyticsKpis,
  previous: AnalyticsKpis,
): AnalyticsKpis {
  return {
    ...current,
    totalPostsChange: calculateChange(current.totalPosts, previous.totalPosts),
    scheduledPostsChange: calculateChange(
      current.scheduledPosts,
      previous.scheduledPosts,
    ),
    conversionRateChange: calculateChange(
      current.conversionRate,
      previous.conversionRate,
    ),
    streakChange: calculateChange(current.streak, previous.streak),
  };
}

export async function getPostVolume(
  userId: string,
  range: DateRange,
): Promise<VolumeDataPoint[]> {
  const startDate = getRangeStartDate(range);

  const posts = await prisma.post.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      linkedinPost: { select: { id: true } },
      xPost: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const dayMap = new Map<string, VolumeDataPoint>();

  for (const post of posts) {
    const d = new Date(post.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (!dayMap.has(key)) {
      dayMap.set(key, { date: key, total: 0, linkedinCount: 0, xCount: 0 });
    }

    const entry = dayMap.get(key);
    if (!entry) continue;
    entry.total++;
    if (post.linkedinPost) entry.linkedinCount++;
    if (post.xPost) entry.xCount++;
  }

  // Fill missing days with zeroes
  const result: VolumeDataPoint[] = [];
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const current = new Date(startDate);

  while (current <= endDate) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    result.push(
      dayMap.get(key) ?? {
        date: key,
        total: 0,
        linkedinCount: 0,
        xCount: 0,
      },
    );
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export async function getPlatformMix(
  userId: string,
  range: DateRange,
): Promise<PlatformMixItem[]> {
  const startDate = getRangeStartDate(range);

  const posts = await prisma.post.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    select: {
      linkedinPost: { select: { id: true } },
      xPost: { select: { id: true } },
    },
  });

  let linkedinCount = 0;
  let xCount = 0;

  for (const post of posts) {
    if (post.linkedinPost) linkedinCount++;
    if (post.xPost) xCount++;
  }

  const result: PlatformMixItem[] = [];
  if (linkedinCount > 0)
    result.push({ platform: "LinkedIn", count: linkedinCount });
  if (xCount > 0) result.push({ platform: "X", count: xCount });

  return result;
}

export async function getPipelineFunnel(
  userId: string,
  range: DateRange,
): Promise<FunnelStage[]> {
  const startDate = getRangeStartDate(range);

  const [createdCount, scheduledCount] = await Promise.all([
    prisma.post.count({
      where: { userId, createdAt: { gte: startDate } },
    }),
    prisma.post.count({
      where: {
        userId,
        createdAt: { gte: startDate },
        OR: [
          { linkedinPost: { status: "SCHEDULED" } },
          { xPost: { status: "SCHEDULED" } },
        ],
      },
    }),
  ]);

  return [
    { stage: "Created", count: createdCount },
    { stage: "Scheduled", count: scheduledCount },
  ];
}

export async function getPostCounts(
  userId: string,
  range: DateRange,
): Promise<AnalyticsKpis> {
  const startDate = getRangeStartDate(range);

  const [totalPosts, scheduledPosts, postsInRange] = await Promise.all([
    prisma.post.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    }),
    prisma.post.count({
      where: {
        userId,
        createdAt: { gte: startDate },
        OR: [
          { linkedinPost: { status: "SCHEDULED" } },
          { xPost: { status: "SCHEDULED" } },
        ],
      },
    }),
    prisma.post.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    }),
  ]);

  const conversionRate =
    totalPosts > 0 ? Math.round((scheduledPosts / totalPosts) * 100) : 0;
  const streak = calculateStreak(
    postsInRange.map((p) => p.createdAt),
    startDate,
  );

  return { totalPosts, scheduledPosts, conversionRate, streak };
}

export async function getAnalyticsResponse(
  userId: string,
  range: DateRange,
): Promise<AnalyticsResponse> {
  const [kpis, volume, platformMix, funnel] = await Promise.all([
    getPostCounts(userId, range),
    getPostVolume(userId, range),
    getPlatformMix(userId, range),
    getPipelineFunnel(userId, range),
  ]);

  const previousRange = getPreviousPeriodRange(range);
  const prevKpis = await getPostCountsWithRange(
    userId,
    previousRange.start,
    previousRange.end,
  );

  return {
    kpis: addComparisonToKpis(kpis, prevKpis),
    volume,
    platformMix,
    funnel,
  };
}

export async function getPostCountsWithRange(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<AnalyticsKpis> {
  const [totalPosts, scheduledPosts, postsInRange] = await Promise.all([
    prisma.post.count({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.post.count({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
        OR: [
          { linkedinPost: { status: "SCHEDULED" } },
          { xPost: { status: "SCHEDULED" } },
        ],
      },
    }),
    prisma.post.findMany({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { createdAt: true },
    }),
  ]);

  const conversionRate =
    totalPosts > 0 ? Math.round((scheduledPosts / totalPosts) * 100) : 0;
  const streak = calculateStreak(
    postsInRange.map((p) => p.createdAt),
    startDate,
  );

  return { totalPosts, scheduledPosts, conversionRate, streak };
}

function calculateStreak(dates: Date[], startDate?: Date): number {
  if (dates.length === 0) return 0;

  const filteredDates = startDate ? dates.filter((d) => d >= startDate) : dates;

  if (filteredDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeDays = new Set<string>();
  for (const date of filteredDates) {
    const d = new Date(date);
    const key = d.toISOString().split("T")[0];
    activeDays.add(key);
  }

  const todayKey = today.toISOString().split("T")[0];
  const hasPostsToday = activeDays.has(todayKey);

  let streak = 0;
  let i = hasPostsToday ? 0 : 1;

  while (true) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().split("T")[0];

    if (activeDays.has(key)) {
      streak++;
      i++;
    } else {
      break;
    }
  }

  return streak;
}
