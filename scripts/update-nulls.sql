DO $$
DECLARE
    prod RECORD;
    new_cat_id TEXT;
BEGIN
    FOR prod IN SELECT id, name FROM product WHERE "categoryId" IS NULL LOOP
        new_cat_id := 'c' || substr(md5(random()::text), 1, 24);
        INSERT INTO category (id, name, "createdAt", "updatedAt") 
        VALUES (new_cat_id, 'Category - ' || prod.name || ' - ' || substr(prod.id, 1, 5), NOW(), NOW());
        
        UPDATE product SET "categoryId" = new_cat_id WHERE id = prod.id;
    END LOOP;
END $$;
