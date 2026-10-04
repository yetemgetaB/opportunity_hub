import { useState } from "react";
import ApplicationPipeline from "../../components/applications/ApplicationPipeline";
import ApplicationTabs, {
  type ApplicationFilter,
} from "../../components/applications/ApplicationTabs";
import ApplicationsTable from "../../components/applications/ApplicationsTable";
import ApplicationDetailsModal from "../../components/applications/ApplicationDetailsModal";
import { APPLICATIONS, isPrevious } from "../../utils/applicationData";
import type { ApplicationItem } from "../../types/application";

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<ApplicationFilter>("all");
  const [selected, setSelected] = useState<ApplicationItem | null>(null);

  const counts = {
    all: APPLICATIONS.length,
    active: APPLICATIONS.filter((a) => !isPrevious(a.status)).length,
    previous: APPLICATIONS.filter((a) => isPrevious(a.status)).length,
  };

  function exportApplications() {
    const headers = [
      "Company",
      "Position",
      "Location",
      "Date Applied",
      "Status",
      "AI Match",
    ];
    const rows = APPLICATIONS.map((item) => [
      item.company,
      item.title,
      item.location,
      item.appliedDate,
      item.status,
      `${item.matchScore}%`,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "application-tracker.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <div className="space-y-6">
      <ApplicationPipeline items={APPLICATIONS} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <ApplicationTabs
            active={filter}
            onChange={setFilter}
            counts={counts}
            onExport={exportApplications}
          />
        </div>
        <ApplicationsTable
          items={APPLICATIONS}
          filter={filter}
          onView={setSelected}
        />
      </section>

      {selected && (
        <ApplicationDetailsModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
