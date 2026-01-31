CREATE TABLE "coustome_recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"cook_time" text,
	"ingredients" text,
	"calories" text,
	"steps" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "non_veg_recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"ingredients" json,
	"instructions" json,
	"image" text,
	"cook_time" text,
	"servings" text,
	"user_id" text,
	"user_name" text,
	"user_image" text,
	"is_public" text DEFAULT 'false',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "veg_recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"ingredients" json,
	"instructions" json,
	"image" text,
	"cook_time" text,
	"servings" text,
	"user_id" text,
	"user_name" text,
	"user_image" text,
	"is_public" text DEFAULT 'false',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "recipe_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "favorites" ALTER COLUMN "recipe_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "user_name" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "user_image" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "is_public" text DEFAULT 'false';