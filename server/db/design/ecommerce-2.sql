CREATE TABLE "public.users" (
	"id" serial NOT NULL UNIQUE,
	"email" varchar NOT NULL UNIQUE,
	"password_hash" TEXT NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"phone" varchar NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.products" (
	"guid" uuid(36) NOT NULL UNIQUE,
	"name" varchar NOT NULL UNIQUE,
	"category" varchar NOT NULL,
	"price" DECIMAL NOT NULL,
	"description" varchar NOT NULL,
	"designer" varchar NOT NULL,
	CONSTRAINT "products_pk" PRIMARY KEY ("guid")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.orders" (
	"id" serial NOT NULL UNIQUE,
	"created" DATE NOT NULL,
	"modified" DATE NOT NULL,
	"status" varchar NOT NULL,
	"total_price" DECIMAL NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "orders_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.order_items" (
	"id" serial NOT NULL UNIQUE,
	"order_id" integer NOT NULL,
	"product_guid" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"price_unit" DECIMAL NOT NULL,
	CONSTRAINT "order_items_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.carts" (
	"id" serial NOT NULL,
	"created" DATE NOT NULL,
	"modified" DATE NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "carts_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.cart_items" (
	"id" serial NOT NULL UNIQUE,
	"cart_id" integer NOT NULL,
	"product_guid" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "cart_items_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);





ALTER TABLE "orders" ADD CONSTRAINT "orders_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fk0" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fk1" FOREIGN KEY ("product_guid") REFERENCES "products"("guid");

ALTER TABLE "carts" ADD CONSTRAINT "carts_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_fk0" FOREIGN KEY ("cart_id") REFERENCES "carts"("id");
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_fk1" FOREIGN KEY ("product_guid") REFERENCES "products"("guid");







