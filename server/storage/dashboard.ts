
import { db } from "../db";
import { userDashboardConfigs, dashboardWidgets, userWidgetPreferences, type UserDashboardConfig, type InsertUserDashboardConfig, type DashboardWidget, type InsertDashboardWidget, type UserWidgetPreference, type InsertUserWidgetPreference } from "@shared/schema";
import { eq, asc, and } from "drizzle-orm";

// Dashboard System
export const getUserDashboardConfig = async (userId: string): Promise<UserDashboardConfig | undefined> => {
  return await db.query.userDashboardConfigs.findFirst({
    where: eq(userDashboardConfigs.userId, userId),
  });
};

export const createOrUpdateDashboardConfig = async (config: InsertUserDashboardConfig): Promise<UserDashboardConfig> => {
  const existing = await getUserDashboardConfig(config.userId);
  if (existing) {
    const [updated] = await db.update(userDashboardConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(userDashboardConfigs.userId, config.userId))
      .returning();
    return updated;
  }
  const [created] = await db.insert(userDashboardConfigs).values(config).returning();
  return created;
};

export const getDashboardWidgets = async (): Promise<DashboardWidget[]> => {
  return await db.query.dashboardWidgets.findMany({
    orderBy: [asc(dashboardWidgets.type)],
  });
};

export const createDashboardWidget = async (widget: InsertDashboardWidget): Promise<DashboardWidget> => {
  const [created] = await db.insert(dashboardWidgets).values(widget).returning();
  return created;
};

export const getUserWidgetPreferences = async (userId: string): Promise<UserWidgetPreference[]> => {
  return await db.query.userWidgetPreferences.findMany({
    where: eq(userWidgetPreferences.userId, userId),
    with: { widget: true },
  });
};

export const createOrUpdateWidgetPreference = async (pref: InsertUserWidgetPreference): Promise<UserWidgetPreference> => {
  const [result] = await db.insert(userWidgetPreferences)
    .values(pref)
    .onConflictDoUpdate({
      target: [userWidgetPreferences.userId, userWidgetPreferences.widgetId],
      set: {
        position: pref.position,
        config: pref.config,
        isVisible: pref.isVisible,
      },
    })
    .returning();
  return result;
};

export const deleteWidgetPreference = async (userId: string, widgetId: string): Promise<boolean> => {
  const result = await db.delete(userWidgetPreferences)
    .where(and(
      eq(userWidgetPreferences.userId, userId),
      eq(userWidgetPreferences.widgetId, widgetId)
    ))
    .returning();
  return result.length > 0;
};
