ALTER TYPE "public"."tender_status" ADD VALUE 'TIED' BEFORE 'COMPLETED';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "tie_breaker_criteria_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "tie_break_policy_hash" varchar(66);--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "tie_candidate_bid_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "tie_break_evidence_hash" varchar(66);--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "tie_break_reason" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "tie_resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "tie_resolved_by" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_tie_resolved_by_user_id_fk" FOREIGN KEY ("tie_resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;