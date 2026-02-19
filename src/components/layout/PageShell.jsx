import RootLayout from "./RootLayout";
import PageWrapper from "./PageWrapper";
import BackButton from "../common/BackButton";

export default function PageShell({
  children,
  showBack = true,
  container = true,
}) {
  return (
    <RootLayout>
      <PageWrapper>
        <div className={container ? "mx-auto max-w-6xl px-4 py-10" : ""}>
          {showBack ? <BackButton className="mb-6" /> : null}
          {children}
        </div>
      </PageWrapper>
    </RootLayout>
  );
}
