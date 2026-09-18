CREATE TYPE "public"."bid_status" AS ENUM('SEALED', 'REVEALED_VALID', 'REVEALED_INVALID', 'NOT_REVEALED');--> statement-breakpoint
CREATE TYPE "public"."blockchain_transaction_type" AS ENUM('COMMIT', 'REVEAL_ATTESTATION', 'TENDER_STATE', 'RESULT');--> statement-breakpoint
CREATE TYPE "public"."organization_member_role" AS ENUM('ORGANIZATION_ADMIN', 'PROCUREMENT_OFFICER', 'AUDITOR', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."organization_member_status" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('BUYER', 'VENDOR', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."tender_participant_status" AS ENUM('INVITED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."tender_status" AS ENUM('DRAFT', 'OPEN', 'CLOSED', 'REVEAL', 'SCORING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"stamps" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"wallet_address" varchar(100) NOT NULL,
	"chain_id" bigint,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" "organization_type" DEFAULT 'BOTH' NOT NULL,
	"legal_name" varchar(255),
	"registration_number" varchar(100),
	"email" varchar(255),
	"phone" varchar(50),
	"address" text,
	"wallet_address" varchar(100),
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "organization_member_role" NOT NULL,
	"status" "organization_member_status" DEFAULT 'INVITED' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text NOT NULL,
	"code" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"status" "tender_status" DEFAULT 'DRAFT' NOT NULL,
	"commit_deadline" timestamp with time zone NOT NULL,
	"reveal_window_hours" integer DEFAULT 48 NOT NULL,
	"reveal_deadline" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tender_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"name" varchar(150) NOT NULL,
	"key" varchar(100) NOT NULL,
	"type" varchar(30) NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" jsonb,
	"validation_rules" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tender_fields_tender_key" UNIQUE("tender_id","key")
);
--> statement-breakpoint
CREATE TABLE "tender_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" "tender_participant_status" DEFAULT 'INVITED' NOT NULL,
	"invited_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tender_participants_tender_org" UNIQUE("tender_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "tender_criteria" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"weight" numeric(5, 2) NOT NULL,
	"scoring_type" varchar(30) DEFAULT 'MANUAL' NOT NULL,
	"max_score" numeric(10, 2) DEFAULT '100',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bid_crypto" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_id" text NOT NULL,
	"kdf_algorithm" text DEFAULT 'Argon2id' NOT NULL,
	"kdf_salt" text NOT NULL,
	"encryption_algorithm" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"bid_salt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bid_crypto_bid_id_unique" UNIQUE("bid_id")
);
--> statement-breakpoint
CREATE TABLE "bid_reveals" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_id" text NOT NULL,
	"revealed_payload" jsonb NOT NULL,
	"reveal_hash" text NOT NULL,
	"verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bid_reveals_bid_id_unique" UNIQUE("bid_id")
);
--> statement-breakpoint
CREATE TABLE "bids" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"commitment_hash" text NOT NULL,
	"status" "bid_status" DEFAULT 'SEALED' NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"revealed_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"verification_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_bids_tender_org" UNIQUE("tender_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "encrypted_bids" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_id" text NOT NULL,
	"encrypted_payload" text,
	"storage_provider" text DEFAULT 'POSTGRESQL' NOT NULL,
	"storage_key" text,
	"payload_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "encrypted_bids_bid_id_unique" UNIQUE("bid_id")
);
--> statement-breakpoint
CREATE TABLE "bid_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_id" text NOT NULL,
	"criterion_id" text NOT NULL,
	"raw_score" numeric(10, 2) NOT NULL,
	"weighted_score" numeric(10, 2) NOT NULL,
	"notes" text,
	"scored_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_bid_scores_bid_criterion" UNIQUE("bid_id","criterion_id")
);
--> statement-breakpoint
CREATE TABLE "blockchain_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"bid_id" text,
	"transaction_type" "blockchain_transaction_type" NOT NULL,
	"tx_hash" varchar(100) NOT NULL,
	"chain_id" bigint NOT NULL,
	"contract_address" varchar(100) NOT NULL,
	"wallet_address" varchar(100),
	"block_number" bigint,
	"block_timestamp" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blockchain_transactions_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_id" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" bigint,
	"storage_provider" varchar(50) NOT NULL,
	"storage_key" text NOT NULL,
	"file_hash" text NOT NULL,
	"is_encrypted" boolean DEFAULT true NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tender_results" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"winning_bid_id" text NOT NULL,
	"final_score" numeric(10, 2) NOT NULL,
	"decision_notes" text,
	"decided_by" text NOT NULL,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	"blockchain_tx_hash" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tender_results_tender_id_unique" UNIQUE("tender_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"user_id" text,
	"tender_id" text,
	"bid_id" text,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" text,
	"description" text,
	"ip_address" "inet",
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_fields" ADD CONSTRAINT "tender_fields_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_participants" ADD CONSTRAINT "tender_participants_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_participants" ADD CONSTRAINT "tender_participants_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_criteria" ADD CONSTRAINT "tender_criteria_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_crypto" ADD CONSTRAINT "bid_crypto_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_reveals" ADD CONSTRAINT "bid_reveals_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_reveals" ADD CONSTRAINT "bid_reveals_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encrypted_bids" ADD CONSTRAINT "encrypted_bids_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_scores" ADD CONSTRAINT "bid_scores_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_scores" ADD CONSTRAINT "bid_scores_criterion_id_tender_criteria_id_fk" FOREIGN KEY ("criterion_id") REFERENCES "public"."tender_criteria"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_scores" ADD CONSTRAINT "bid_scores_scored_by_user_id_fk" FOREIGN KEY ("scored_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_transactions" ADD CONSTRAINT "blockchain_transactions_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_transactions" ADD CONSTRAINT "blockchain_transactions_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_results" ADD CONSTRAINT "tender_results_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_results" ADD CONSTRAINT "tender_results_winning_bid_id_bids_id_fk" FOREIGN KEY ("winning_bid_id") REFERENCES "public"."bids"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_results" ADD CONSTRAINT "tender_results_decided_by_user_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE set null ON UPDATE no action;