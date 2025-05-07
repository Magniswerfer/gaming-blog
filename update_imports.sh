#!/bin/bash

# Update ArticleView to ArticleDetail
find ./routes -type f -name "*.tsx" -exec sed -i '' 's/import ArticleView from/import ArticleDetail from/g' {} \;
find ./routes -type f -name "*.tsx" -exec sed -i '' 's/<ArticleView/<ArticleDetail/g' {} \;
find ./routes -type f -name "*.tsx" -exec sed -i '' 's/<\/ArticleView>/<\/ArticleDetail>/g' {} \;

# Update ContentPage to CollectionPage
find ./routes -type f -name "*.tsx" -exec sed -i '' 's/import ContentPage from/import CollectionPage from/g' {} \;
find ./routes -type f -name "*.tsx" -exec sed -i '' 's/<ContentPage/<CollectionPage/g' {} \;
find ./routes -type f -name "*.tsx" -exec sed -i '' 's/<\/ContentPage>/<\/CollectionPage>/g' {} \;

# Update ContentCard to ArticleCard
find . -type f -name "*.tsx" -exec sed -i '' 's/import ContentCard from/import ArticleCard from/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/<ContentCard/<ArticleCard/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/<\/ContentCard>/<\/ContentCard>/g' {} \;

# Update ContentSection to ArticleSidebar
find . -type f -name "*.tsx" -exec sed -i '' 's/import ContentSection from/import ArticleSidebar from/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/<ContentSection/<ArticleSidebar/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/<\/ContentSection>/<\/ArticleSidebar>/g' {} \;

# Update DebatSection to DebatSidebar
find . -type f -name "*.tsx" -exec sed -i '' 's/import DebatSection from/import DebatSidebar from/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/<DebatSection/<DebatSidebar/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/<\/DebatSection>/<\/DebatSidebar>/g' {} \;

# Update import paths
find . -type f -name "*.tsx" -exec sed -i '' 's/ArticleView.tsx/ArticleDetail.tsx/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/ContentPage.tsx/CollectionPage.tsx/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/ContentCard.tsx/ArticleCard.tsx/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/ContentSection.tsx/ArticleSidebar.tsx/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/DebatSection.tsx/DebatSidebar.tsx/g' {} \;

echo "All component names updated successfully." 