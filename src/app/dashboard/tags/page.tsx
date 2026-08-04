import { ChevronDown, Pencil, Plus, Save, Trash2 } from "lucide-react";
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
            <div className="record-list">
              <div className="record-list-header record-list-header-tags" aria-hidden="true">
                <span>Tag</span><span>Slug</span><span>Usage</span><span />
              </div>
              {records.map((tag) => (
                <details className="record-item record-item-tag" key={tag.id}>
                  <summary>
                    <span className="record-identity"><strong>{tag.name}</strong></span>
                    <span className="record-slug">/{tag.slug}</span>
                    <span className="record-usage">{tag.applicationCount} apps</span>
                    <span className="record-edit-label"><Pencil aria-hidden="true" size={14} /> Edit</span>
                    <ChevronDown aria-hidden="true" className="record-chevron" size={16} />
                  </summary>
                  <div className="record-editor">
                    <form action={updateTag} className="record-editor-form record-editor-form-tag">
                      <input name="id" type="hidden" value={tag.id} />
                      <label><span>Name</span><input defaultValue={tag.name} name="name" required /></label>
                      <label><span>Slug</span><input defaultValue={tag.slug} name="slug" required /></label>
                      <div className="record-editor-actions"><button className="button-primary" type="submit"><Save aria-hidden="true" size={14} /> Save changes</button></div>
                    </form>
                    <details className="record-delete">
                      <summary><Trash2 aria-hidden="true" size={14} /> Delete tag</summary>
                      <form action={deleteTag}><input name="id" type="hidden" value={tag.id} /><span>Only unused tags can be deleted.</span><button type="submit">Delete tag</button></form>
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
