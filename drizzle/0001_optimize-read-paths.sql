DROP INDEX "idx_notifications_user_id";--> statement-breakpoint
DROP INDEX "idx_notifications_created_at";--> statement-breakpoint
CREATE INDEX "idx_org_members_user_id" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_org_members_org_user_status" ON "organization_members" USING btree ("organization_id","user_id","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created_at" ON "notifications" USING btree ("user_id","created_at");