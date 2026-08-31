import { relations } from 'drizzle-orm';
import { users } from './users';
import { categories } from './categories';
import { listings, listingImages } from './listings';
import { offers } from './offers';
import { orders } from './orders';
import { reviews } from './reviews';
import { chats } from './chats';

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  sentOffers: many(offers, { relationName: 'buyerOffers' }),
  receivedOffers: many(offers, { relationName: 'sellerOffers' }),
  buyerOrders: many(orders, { relationName: 'buyerOrders' }),
  sellerOrders: many(orders, { relationName: 'sellerOrders' }),
  reviewsGiven: many(reviews, { relationName: 'reviewsGiven' }),
  reviewsReceived: many(reviews, { relationName: 'reviewsReceived' })
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parentChild'
  }),
  children: many(categories, { relationName: 'parentChild' }),
  listings: many(listings)
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [listings.categoryId],
    references: [categories.id]
  }),
  images: many(listingImages),
  offers: many(offers),
  orders: many(orders),
  reviews: many(reviews)
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id]
  })
}));

export const offersRelations = relations(offers, ({ one }) => ({
  listing: one(listings, {
    fields: [offers.listingId],
    references: [listings.id]
  }),
  buyer: one(users, {
    fields: [offers.buyerId],
    references: [users.id],
    relationName: 'buyerOffers'
  }),
  seller: one(users, {
    fields: [offers.sellerId],
    references: [users.id],
    relationName: 'sellerOffers'
  })
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  listing: one(listings, {
    fields: [orders.listingId],
    references: [listings.id]
  }),
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: 'buyerOrders'
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: 'sellerOrders'
  }),
  offer: one(offers, {
    fields: [orders.offerId],
    references: [offers.id]
  }),
  reviews: many(reviews)
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id]
  }),
  listing: one(listings, {
    fields: [reviews.listingId],
    references: [listings.id]
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: 'reviewsGiven'
  }),
  seller: one(users, {
    fields: [reviews.sellerId],
    references: [users.id],
    relationName: 'reviewsReceived'
  })
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  sender: one(users, {
    fields: [chats.senderId],
    references: [users.id]
  }),
  receiver: one(users, {
    fields: [chats.receiverId],
    references: [users.id]
  }),
  listing: one(listings, {
    fields: [chats.listingId],
    references: [listings.id]
  }),
  offer: one(offers, {
    fields: [chats.offerId],
    references: [offers.id]
  })
}));
