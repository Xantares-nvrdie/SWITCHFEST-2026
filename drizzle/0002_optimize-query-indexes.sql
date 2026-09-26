CREATE INDEX "idx_tenders_created_at" ON "tenders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_tenders_open_commit_deadline" ON "tenders" USING btree ("status","commit_deadline");--> statement-breakpoint
CREATE INDEX "idx_tenders_reveal_deadline" ON "tenders" USING btree ("status","reveal_deadline");--> statement-breakpoint
CREATE INDEX "idx_tender_criteria_tender_id" ON "tender_criteria" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_is_read" ON "notifications" USING btree ("user_id","is_read");