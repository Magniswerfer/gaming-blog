#!/bin/bash

# Move component files to their new names
mv ./components/ArticleView.tsx ./components/ArticleDetail.tsx
mv ./components/ContentPage.tsx ./components/CollectionPage.tsx
mv ./components/ContentCard.tsx ./components/ArticleCard.tsx
mv ./components/ContentSection.tsx ./components/ArticleSidebar.tsx
mv ./components/DebatSection.tsx ./components/DebatSidebar.tsx

echo "All component files renamed successfully." 