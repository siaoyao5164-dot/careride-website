CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY,
	"reference" text NOT NULL UNIQUE,
	"customer_id" integer,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"pickup" jsonb NOT NULL,
	"destination" jsonb NOT NULL,
	"travel_date" date NOT NULL,
	"pickup_time" text,
	"return_time" text,
	"trip_type" text NOT NULL,
	"accompaniment_hours" integer DEFAULT 0 NOT NULL,
	"distance_km" double precision,
	"distance_fare_sen" integer,
	"crossing_sen" integer,
	"peak_sen" integer,
	"accompaniment_sen" integer,
	"subtotal_sen" integer,
	"discount_sen" integer DEFAULT 0 NOT NULL,
	"total_sen" integer,
	"language" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"mobile" text NOT NULL UNIQUE,
	"referrer_mobile" text,
	"referrer_id" integer,
	"first_ride_status" text DEFAULT 'pending' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"admin_note" text,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY,
	"referrer_id" integer NOT NULL,
	"referred_id" integer NOT NULL UNIQUE,
	"reward_sen" integer NOT NULL,
	"status" text NOT NULL,
	"reward_voucher_id" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"detail" text,
	"quote" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_events" (
	"id" serial PRIMARY KEY,
	"voucher_id" integer NOT NULL,
	"booking_id" integer,
	"event" text NOT NULL,
	"actor" text DEFAULT 'system' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"customer_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount_sen" integer NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"booking_id" integer,
	"note" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"reserved_at" timestamp with time zone,
	"redeemed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" ("status","created_at");--> statement-breakpoint
CREATE INDEX "bookings_mobile_idx" ON "bookings" ("mobile");--> statement-breakpoint
CREATE INDEX "customers_ip_hash_idx" ON "customers" ("ip_hash","registered_at");--> statement-breakpoint
CREATE INDEX "voucher_events_voucher_idx" ON "voucher_events" ("voucher_id");--> statement-breakpoint
CREATE INDEX "vouchers_customer_idx" ON "vouchers" ("customer_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "vouchers_one_welcome_per_customer" ON "vouchers" ("customer_id") WHERE type = 'welcome';--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_customers_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_customers_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_reward_voucher_id_vouchers_id_fkey" FOREIGN KEY ("reward_voucher_id") REFERENCES "vouchers"("id");--> statement-breakpoint
ALTER TABLE "voucher_events" ADD CONSTRAINT "voucher_events_voucher_id_vouchers_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id");--> statement-breakpoint
ALTER TABLE "voucher_events" ADD CONSTRAINT "voucher_events_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id");--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id");