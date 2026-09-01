CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`phone` text,
	`avatar_url` text,
	`role` text DEFAULT 'BUYER' NOT NULL,
	`is_kyc_verified` integer DEFAULT false NOT NULL,
	`is_phone_verified` integer DEFAULT false NOT NULL,
	`trust_score` integer DEFAULT 80 NOT NULL,
	`total_transactions` integer DEFAULT 0 NOT NULL,
	`rating_average` real DEFAULT 5 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`city` text,
	`province` text,
	`bio` text,
	`nik` text,
	`ktp_image_url` text,
	`selfie_image_url` text,
	`kyc_submitted_at` text,
	`bank_name` text,
	`bank_account_number` text,
	`bank_account_holder` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text NOT NULL,
	`parent_id` text,
	`item_count` integer DEFAULT 0 NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `listing_images` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`url` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`seller_id` text NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`price` real NOT NULL,
	`original_price` real,
	`is_negotiable` integer DEFAULT true NOT NULL,
	`min_offer_price` real,
	`condition` text NOT NULL,
	`completeness` text NOT NULL,
	`purchase_year` integer,
	`warranty_until` text,
	`has_original_receipt` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`offer_count` integer DEFAULT 0 NOT NULL,
	`favorite_count` integer DEFAULT 0 NOT NULL,
	`province` text NOT NULL,
	`city` text NOT NULL,
	`district` text NOT NULL,
	`postal_code` text,
	`is_cod_available` integer DEFAULT true NOT NULL,
	`cod_meeting_point` text,
	`specs` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_slug_unique` ON `listings` (`slug`);--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`buyer_id` text NOT NULL,
	`seller_id` text NOT NULL,
	`offered_price` real NOT NULL,
	`message` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`counter_price` real,
	`counter_message` text,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`listing_id` text NOT NULL,
	`buyer_id` text NOT NULL,
	`seller_id` text NOT NULL,
	`offer_id` text,
	`amount` real NOT NULL,
	`shipping_fee` real DEFAULT 0 NOT NULL,
	`service_fee` real DEFAULT 0 NOT NULL,
	`total_amount` real NOT NULL,
	`delivery_method` text NOT NULL,
	`escrow_status` text DEFAULT 'WAITING_PAYMENT' NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_phone` text NOT NULL,
	`shipping_address` text NOT NULL,
	`courier_name` text,
	`tracking_number` text,
	`shipped_at` text,
	`delivered_at` text,
	`inspection_deadline` text,
	`dispute_reason` text,
	`dispute_evidence_urls` text,
	`dispute_status` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`seller_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text NOT NULL,
	`item_condition_match` integer DEFAULT true NOT NULL,
	`fast_response` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`listing_id` text,
	`message` text NOT NULL,
	`is_offer_card` integer DEFAULT false NOT NULL,
	`offer_id` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlists_user_listing_unique` ON `wishlists` (`user_id`, `listing_id`);
