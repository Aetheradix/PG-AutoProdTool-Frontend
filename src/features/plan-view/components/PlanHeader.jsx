import { Button } from "antd";
import { FiFileText } from "react-icons/fi";

const PlanHeader = ({
  activeTab,
  onTabChange,
  activeFilter,
  onFilterChange,
  onExportPDF,
  onExportExcel,
  isExporting,
}) => {
  const showTimeFilter =
    activeTab !== "table" &&
    activeTab !== "packing-schedule";

  return (
    <div className="flex flex-col gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">

      {/* Row 1: Tab switcher + Export button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex bg-slate-50 gap-1 p-1 rounded-lg overflow-x-auto custom-scrollbar shrink-0">
          <Button
            type={activeTab === "gantt" ? "primary" : "text"}
            className="rounded-md shadow-none font-bold whitespace-nowrap"
            onClick={() => onTabChange("gantt")}
          >
            Making Gantt Chart
          </Button>
          <Button
            type={activeTab === "table" ? "primary" : "text"}
            className="rounded-md shadow-none font-bold whitespace-nowrap"
            onClick={() => onTabChange("table")}
          >
            Making Schedule Table
          </Button>
          <Button
            type={activeTab === "packing-schedule" ? "primary" : "text"}
            className="rounded-md shadow-none font-bold whitespace-nowrap"
            onClick={() => onTabChange("packing-schedule")}
          >
            Packing Plan View
          </Button>
          <Button
            type={activeTab === "tank" ? "primary" : "text"}
            className="rounded-md shadow-none font-bold whitespace-nowrap"
            onClick={() => onTabChange("tank")}
          >
            Tank Timeline
          </Button>

        </div>

        {/* Export button - right side */}
        <div className="shrink-0">
          <Button
            icon={<FiFileText className="text-emerald-600" />}
            className="rounded-lg border-slate-200 font-bold hover:text-emerald-600 hover:border-emerald-600"
            onClick={onExportExcel}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Row 2: Time Filter strip - only shown for Gantt / Tank tabs */}
      {showTimeFilter && (
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 overflow-x-auto custom-scrollbar">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0 hidden sm:inline pr-1 border-r border-slate-200">
            Time Filter
          </span>
          <Button
            size="small"
            type={!activeFilter ? "primary" : "text"}
            className="rounded-md font-bold text-xs h-7 px-3 shrink-0"
            onClick={() => onFilterChange(null)}
          >
            Full
          </Button>
          {[
            "07:30-11:30",
            "11:30-15:30",
            "15:30-19:30",
            "19:30-23:30",
            "23:30-03:30",
            "03:30-07:30",
          ].map((interval) => (
            <Button
              key={interval}
              size="small"
              type={activeFilter === interval ? "primary" : "text"}
              className="rounded-md font-bold text-xs h-7 px-3 shrink-0"
              onClick={() => onFilterChange(interval)}
            >
              {interval}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanHeader;
