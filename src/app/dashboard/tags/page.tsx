import { Plus, Save, Trash2 } from "lucide-react";
import { DashboardNotice } from "@/components/dashboard-notice";
import { DashboardShell } from "@/components/dashboard-shell";
import { getTagManagementData } from "@/lib/dashboard-data";
import { createTag, deleteTag, updateTag } from "@/app/dashboard/manage/tags";

export const dynamic = "force-dynamic";

export default async function TagsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [records, query] = await Promise.all([getTagManagementData(), searchParams]);
  return (
    <DashboardShell active="tags">
      <header className="dashboard-header"><div><p>Discovery vocabulary</p><h1>Tags</h1></div></header>
      <DashboardNotice error={query.error} success={query.success} />
      <section className="management-layout">
        <aside className="management-create">
          <div><h2>Add tag</h2><p>Tags describe focused capabilities. They are also created automatically from application forms and imports.</p></div>
          <form action={createTag} className="compact-form">
            <label><span>Name</span><input name="name" placeholder="Menu bar" required /></label>
            <label><span>Slug</span><input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="menu-bar" required /></label>
            <button className="button-primary" type="submit"><Plus size={15} /> Add tag</button>
          </form>
        </aside>
        <section className="dashboard-panel management-panel" aria-labelledby="tag-list-heading">
          <div className="panel-toolbar"><div><h2 id="tag-list-heading">All tags</h2><p>{records.length} records, most frequently used first.</p></div></div>
          {records.length === 0 ? <div className="dashboard-empty"><h3>No tags yet</h3><p>Tags appear when you add them to an application.</p></div> : (
            <div className="management-list">
              {records.map((tag) => (
                <article className="management-row management-row-tag" key={tag.id}>
                  <form action={updateTag} className="management-row-form">
                    <input name="id" type="hidden" value={tag.id} />
                    <label><span>Name</span><input defaultValue={tag.name} name="name" required /></label>
                    <label className="management-description"><span>Slug</span><input defaultValue={tag.slug} name="slug" required /></label>
                    <div className="management-row-actions"><span>{tag.applicationCount} apps</span><button className="icon-button" aria-label={`Save ${tag.name}`} type="submit"><Save size={15} /></button></div>
                  </form>
                  <details className="delete-control"><summary aria-label={`Delete ${tag.name}`}><Trash2 size={14} /></summary><form action={deleteTag}><input name="id" type="hidden" value={tag.id} /><span>Delete unused tag?</span><button type="submit">Confirm delete</button></form></details>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </DashboardShell>
  );
}
