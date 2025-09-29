CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"ingredients" json,
	"instructions" json,
	"image" text,
	"cook_time" text,
	"servings" text,
	"created_at" timestamp DEFAULT now()
);
