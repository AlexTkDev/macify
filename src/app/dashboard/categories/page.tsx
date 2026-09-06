import { ChevronDown, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { DashboardNotice } from "@/components/dashboard-notice";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCategoryManagementData } from "@/lib/dashboard-data";
import { createCategory, deleteCategory, updateCategory } from "@/app/dashboard/manage/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [records, query] = await Promise.all([getCategoryManagementData(), searchParams]);
  return (
    <DashboardShell active="categories">
      <header className="dashboard-header"><div><p>Discovery vocabulary</p><h1>Categories</h1></div></header>
      <DashboardNotice error={query.error} success={query.success} />
      <section className="management-layout">
        <aside className="management-create">
          <div><h2>Add category</h2><p>Categories describe focused capabilities. They are also created automatically from application forms and imports.</p></div>
          <form action={createCategory} className="compact-form">
            <label><span>Name</span><input name="name" placeholder="Menu bar" required /></label>
            <label><span>Slug</span><input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="menu-bar" required /></label>
            <button className="button-primary" type="submit"><Plus size={15} /> Add category</button>
          </form>
        </aside>
        <section className="dashboard-panel management-panel" aria-labelledby="category-list-heading">
          <div className="panel-toolbar"><div><h2 id="category-list-heading">All categories</h2><p>{records.length} records, most frequently used first.</p></div></div>
          {records.length === 0 ? <div className="dashboard-empty"><h3>No categories yet</h3><p>Categories appear when you add them to an application.</p></div> : (
            <div className="record-list">
              <div className="record-list-header record-list-header-categories" aria-hidden="true">
                <span>Category</span><span>Slug</span><span>Usage</span><span />
              </div>
              {records.map((category) => (
                <details className="record-item record-item-category" key={category.id}>
                  <summary>
                    <span className="record-identity"><strong>{category.name}</strong></span>
                    <span className="record-slug">/{category.slug}</span>
                    <span className="record-usage">{category.applicationCount} apps</span>
                    <span className="record-edit-label"><Pencil aria-hidden="true" size={14} /> Edit</span>
                    <ChevronDown aria-hidden="true" className="record-chevron" size={16} />
                  </summary>
                  <div className="record-editor">
                    <form action={updateCategory} className="record-editor-form record-editor-form-category">
                      <input name="id" type="hidden" value={category.id} />
                      <label><span>Name</span><input defaultValue={category.name} name="name" required /></label>
                      <label><span>Slug</span><input defaultValue={category.slug} name="slug" required /></label>
                      <div className="record-editor-actions"><button className="button-primary" type="submit"><Save aria-hidden="true" size={14} /> Save changes</button></div>
                    </form>
                    <details className="record-delete">
                      <summary><Trash2 aria-hidden="true" size={14} /> Delete category</summary>
                      <form action={deleteCategory}><input name="id" type="hidden" value={category.id} /><span>Only unused categories can be deleted.</span><button type="submit">Delete category</button></form>
                    </details>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </section>
    </DashboardShell>
  );
}
