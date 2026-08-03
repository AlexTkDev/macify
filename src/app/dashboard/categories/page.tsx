import { Plus, Save, Trash2 } from "lucide-react";
import { DashboardNotice } from "@/components/dashboard-notice";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCategoryManagementData } from "@/lib/dashboard-data";
import { createCategory, deleteCategory, updateCategory } from "../manage-actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [records, query] = await Promise.all([getCategoryManagementData(), searchParams]);
  return (
    <DashboardShell active="categories">
      <header className="dashboard-header">
        <div><p>Directory structure</p><h1>Categories</h1></div>
      </header>
      <DashboardNotice error={query.error} success={query.success} />

      <section className="management-layout">
        <aside className="management-create">
          <div><h2>Add category</h2><p>Categories are the primary browsing structure and must remain broad enough to contain several applications.</p></div>
          <form action={createCategory} className="compact-form">
            <label><span>Name</span><input name="name" placeholder="Productivity" required /></label>
            <label><span>Slug</span><input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="productivity" required /></label>
            <label><span>Description</span><textarea name="description" placeholder="Applications that help people organize and complete work." rows={4} /></label>
            <label><span>Sort order</span><input defaultValue="0" min="0" name="sortOrder" type="number" /></label>
            <button className="button-primary" type="submit"><Plus size={15} /> Add category</button>
          </form>
        </aside>

        <section className="dashboard-panel management-panel" aria-labelledby="category-list-heading">
          <div className="panel-toolbar"><div><h2 id="category-list-heading">All categories</h2><p>{records.length} records, ordered as they appear publicly.</p></div></div>
          {records.length === 0 ? <div className="dashboard-empty"><h3>No categories yet</h3><p>Add one to classify applications.</p></div> : (
            <div className="management-list">
              {records.map((category) => (
                <article className="management-row" key={category.id}>
                  <form action={updateCategory} className="management-row-form">
                    <input name="id" type="hidden" value={category.id} />
                    <label><span>Name</span><input defaultValue={category.name} name="name" required /></label>
                    <label><span>Slug</span><input defaultValue={category.slug} name="slug" required /></label>
                    <label className="management-description"><span>Description</span><input defaultValue={category.description ?? ""} name="description" /></label>
                    <label className="management-order"><span>Order</span><input defaultValue={category.sortOrder} min="0" name="sortOrder" type="number" /></label>
                    <div className="management-row-actions"><span>{category.applicationCount} apps</span><button className="icon-button" aria-label={`Save ${category.name}`} type="submit"><Save size={15} /></button></div>
                  </form>
                  <details className="delete-control"><summary aria-label={`Delete ${category.name}`}><Trash2 size={14} /></summary><form action={deleteCategory}><input name="id" type="hidden" value={category.id} /><span>Delete unused category?</span><button type="submit">Confirm delete</button></form></details>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </DashboardShell>
  );
}
