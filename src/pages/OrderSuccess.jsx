import PageShell from "../components/layout/PageShell";

export default function OrderSuccess() {
  return (
    <PageShell showBack={false}>
      <h1 className="text-3xl font-semibold">Order Success</h1>
      <p className="text-black/60 mt-2">Order number + summary here.</p>
    </PageShell>
  );
}
