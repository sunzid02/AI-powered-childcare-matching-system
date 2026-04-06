import ParentRequestForm from "../components/forms/ParentRequestForm";
import PageContainer from "../components/layout/PageContainer";

export default function ParentRequestPage() {
  return (
    <PageContainer>
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <h1 className="page-title">Create Childcare Request</h1>
          <p className="page-subtitle">
            Select a family profile, define care needs, and generate the top matching childminders.
          </p>
        </div>

        <ParentRequestForm />
      </div>
    </PageContainer>
  );
}