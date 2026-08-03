import { getCategoryDirectoryData } from "@/lib/category-directory-data";
import { getHomepageDirectoryData } from "@/lib/directory-search-data";

export async function getPublishedCategoryBySlug(slug: string) {
  const categories = await getCategoryDirectoryData();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;
  const data = await getHomepageDirectoryData({
    query: "",
    category: slug,
    pricing: "",
    billing: "",
    openSource: false,
    page: 1,
  });
  return { ...category, applications: data.search.applications };
}
