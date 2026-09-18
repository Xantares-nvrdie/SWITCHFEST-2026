-- Safely create ENUMs (skip if already exists)
DO \$\$ BEGIN CREATE TYPE "public"."bid_status" AS ENUM('SEALED', 'REVEALED_VALID', 'REVEALED_INVALID', 'NOT_REVEALED'); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE TYPE "public"."blockchain_transaction_type" AS ENUM('COMMIT', 'REVEAL_ATTESTATION', 'TENDER_STATE', 'RESULT'); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE TYPE "public"."organization_member_role" AS ENUM('ORGANIZATION_ADMIN', 'PROCUREMENT_OFFICER', 'AUDITOR', 'MEMBER'); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE TYPE "public"."organization_member_status" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE TYPE "public"."organization_type" AS ENUM('BUYER', 'VENDOR', 'BOTH'); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE TYPE "public"."tender_participant_status" AS ENUM('INVITED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE TYPE "public"."tender_status" AS ENUM('DRAFT', 'OPEN', 'CLOSED', 'REVEAL', 'SCORING', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
