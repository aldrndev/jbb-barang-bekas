-- Fix broken images with verified matching Unsplash URLs

-- 1. Oppo Reno 16F (fix broken r2.jbb.market domain)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-1792558197714-0';

-- 2. Item 2: iPhone 14 Pro Deep Purple (img-2-2 was 404)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-2-2';

-- 3. Item 17: PS5 (img-17-1 was 404)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-17-1';

-- 4. Item 19: Nintendo Switch (img-19-2 was 404)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-19-2';

-- 5. Item 65: iPhone 15 Pro Max Natural Titanium (img-65-2 was 404)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-65-2';

-- 6. Item 66: iPhone 15 Black (img-66-2 was 404)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-66-1';
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-66-2';

-- 7. Item 68: iPhone 14 Plus Starlight (img-68-2 was 404)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-68-1';
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-68-2';

-- 8. Item 70: Samsung Galaxy S24 Ultra (img-70-1 was 404)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-70-1';
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-70-2';

-- 9. Item 71: Samsung Galaxy S24+ (replace generic with Samsung flagship)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-71-1';
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1585790051609-09928c362a42?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-71-2';

-- 10. Item 72: Samsung Galaxy Z Fold 5
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1585790051609-09928c362a42?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-72-1';
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-72-2';

-- 11. Item 73: Samsung Galaxy A55 (replace camera with Samsung iceblue phone)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-73-1';
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-73-2';

-- 12. Item 74: Samsung Galaxy S23 FE (replace headphones with Samsung mint phone)
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-74-1';
UPDATE listing_images
SET url = 'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=800&auto=format&fit=crop&q=80'
WHERE id = 'img-74-2';

-- 13. Boost view_count of iPhone 15 Pro Max to make it the top featured listing
UPDATE listings
SET view_count = 1500
WHERE id = 'item-65';
