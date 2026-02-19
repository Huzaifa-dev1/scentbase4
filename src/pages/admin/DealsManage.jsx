import PageShell from "../../components/layout/PageShell";

export default function DealsManage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-semibold">Manage Deals</h1>
      <p className="text-black/60 mt-2">
        Create bundle offers (2/3/4/5) and set active deals.
      </p>

      <div className="mt-8 rounded-2xl border border-black/10 p-5">
        <p className="text-sm text-black/70">
          Deal builder UI + deals list will be added here.
        </p>
      </div>
    </PageShell>
  );
}
