"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { NepaliDatePicker } from "@kkeshavv18/nepali-datepicker";
import "@kkeshavv18/nepali-datepicker/dist/index.css";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import Pagination from "@/components/global/Pagination";

// tpes
interface Customer {
  id: number;
  organization_name: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  email: string;
  phone: string;
  address: string;
  leadSource: string;
  tags: string[];
  note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  callLogs: CallLog[];
  followUps: FollowUp[];
}

interface CallLog {
  id: number;
  callStatus: string;
  response: string;
  durationLabel: string;
  callTime: string;
  notes: string;
  calledBy?: { name: string };
}

interface FollowUp {
  id: number;
  scheduledAt: string;
  notes: string;
  status: "PENDING" | "COMPLETED" | "MISSED";
  createdBy?: { name: string };
}

interface CallLogForm {
  callStatus: string;
  response: string;
  durationLabel: string;
  callTime: string | null;
  notes: string;
}

interface FollowUpForm {
  scheduledAt: string | null;
  notes: string;
  status: "PENDING" | "COMPLETED" | "MISSED";
}

export default function ViewCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const tabFromUrl = searchParams.get("tab") as
    | "info"
    | "logs"
    | "followups"
    | null;
  const [activeTab, setActiveTab] = useState<"info" | "logs" | "followups">(
    tabFromUrl || "info",
  );

  const [showLogModal, setShowLogModal] = useState(false);
  const [showFuModal, setShowFuModal] = useState(false);

  const [logSubmitting, setLogSubmitting] = useState(false);
  const [fuSubmitting, setFuSubmitting] = useState(false);

  const todayBS = ADToBS(new Date());

  const [logForm, setLogForm] = useState<CallLogForm>({
    callStatus: "",
    response: "",
    durationLabel: "",
    callTime: todayBS + " 12:00",
    notes: "",
  });
  const [logDate, setLogDate] = useState<string>(todayBS);
  const [logTime, setLogTime] = useState<string>("12:00");

  const [fuForm, setFuForm] = useState<FollowUpForm>({
    scheduledAt: todayBS + " 12:00",
    notes: "",
    status: "PENDING",
  });
  const [fuDate, setFuDate] = useState<string>(todayBS);
  const [fuTime, setFuTime] = useState<string>("12:00");

  const convertToISO = (bsDate: string, time: string) => {
    const adDate = BSToAD(bsDate);
    return new Date(`${adDate} ${time}`).toISOString();
  };

  const formatToNepali = (iso: string) => {
    if (!iso) return "—";
    const date = new Date(iso);
    const bsDate = ADToBS(date);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${bsDate} ${hours}:${minutes}`;
  };

  // fetch customer
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error("Failed to load customer");

        const data = await res.json();
        const cust: Customer = data.customer;

        setCustomer(cust);
        setCallLogs(cust.callLogs || []);
        setFollowUps(cust.followUps || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const ITEMS_PER_PAGE = 10;

  const [logsPage, setLogsPage] = useState(1);
  const [followUpsPage, setFollowUpsPage] = useState(1);

  // For call logs
  const paginatedCallLogs =
    callLogs.length > ITEMS_PER_PAGE
      ? callLogs.slice(
          (logsPage - 1) * ITEMS_PER_PAGE,
          logsPage * ITEMS_PER_PAGE,
        )
      : callLogs;

  // For follow ups
  const paginatedFollowUps =
    followUps.length > ITEMS_PER_PAGE
      ? followUps.slice(
          (followUpsPage - 1) * ITEMS_PER_PAGE,
          followUpsPage * ITEMS_PER_PAGE,
        )
      : followUps;
  // tab change
  const handleTabChange = (tab: "info" | "logs" | "followups") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.toString());
  };

  const handleLogChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => setLogForm({ ...logForm, [e.target.name]: e.target.value });

  const handleFuChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => setFuForm({ ...fuForm, [e.target.name]: e.target.value });

  // log submit
  const submitCallLog = async () => {
    const token = Cookies.get("token");
    if (!token) return toast.error("You must be logged in");

    setLogSubmitting(true);
    try {
      const isoDate = convertToISO(logDate, logTime);
      const body = { ...logForm, callTime: isoDate };

      const res = await fetch(`/api/customers/${id}/call-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add call log");

      const newLog: CallLog = await res.json();
      setCallLogs((prev) => [newLog, ...prev]);
      toast.success("Call log added");
      setShowLogModal(false);
      setLogForm({
        callStatus: "",
        response: "",
        durationLabel: "",
        callTime: todayBS + " 12:00",
        notes: "",
      });
      setLogDate(todayBS);
      setLogTime("12:00");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLogSubmitting(false);
    }
  };

  // follow up submit
  const submitFollowUp = async () => {
    const token = Cookies.get("token");
    if (!token) return toast.error("You must be logged in");

    setFuSubmitting(true);
    try {
      const isoDate = convertToISO(fuDate, fuTime);
      const body = { ...fuForm, scheduledAt: isoDate };

      const res = await fetch(`/api/customers/${id}/follow-ups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add follow-up");

      const newFu: FollowUp = await res.json();
      setFollowUps((prev) => [newFu, ...prev]);
      toast.success("Follow-up added");
      setShowFuModal(false);
      setFuForm({
        scheduledAt: todayBS + " 12:00",
        notes: "",
        status: "PENDING",
      });
      setFuDate(todayBS);
      setFuTime("12:00");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFuSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!customer) return <div className="p-6">Customer not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">
        {customer.organization_name || "Customer Details"}
      </h1>

      {/* tabs */}
      <div className="flex gap-4 border-b mb-6 text-sm font-medium">
        {["info", "logs", "followups"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab as any)}
            className={activeTab === tab ? "border-b-2 border-black pb-2" : ""}
          >
            {tab === "info"
              ? "Info"
              : tab === "logs"
                ? "Call Logs"
                : "Follow Ups"}
          </button>
        ))}
      </div>

      {/* information tab */}
      {activeTab === "info" && (
        <div className="space-y-3 text-sm">
          <Field label="Organization Name" value={customer.organization_name} />
          <Field label="Contact Person" value={customer.contact_person_name} />
          <Field label="Email" value={customer.email} />
          <Field label="Phone" value={customer.phone} />
          <Field label="Address" value={customer.address} />
          <Field label="Lead Source" value={customer.leadSource} />
          <div>
            <p className="font-medium text-gray-700">Status</p>
            <span
              className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                customer.status === "NEW"
                  ? "bg-blue-500"
                  : customer.status === "CONTACTED"
                    ? "bg-yellow-500"
                    : customer.status === "INTERESTED"
                      ? "bg-[#99b84f]"
                      : customer.status === "NOT_INTERESTED"
                        ? "bg-red-500"
                        : "bg-gray-400"
              }`}
            >
              {customer.status}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-700">Tags</p>
            <p>
              {Array.isArray(customer.tags) ? customer.tags.join(", ") : "—"}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Note</p>
            <p className="whitespace-pre-wrap">{customer.note || "—"}</p>
          </div>
        </div>
      )}

      {/* call log tab */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Call Logs</h2>
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-[#99b84f] text-white px-3 py-1 rounded"
            >
              Add Log
            </button>
          </div>

          {callLogs.length === 0 && <p>No call logs</p>}

          {paginatedCallLogs.map((log) => (
            <div key={log.id} className="border p-4 rounded-md">
              <p>
                <strong>Time:</strong> {formatToNepali(log.callTime)}
              </p>
              <p>
                <strong>Status:</strong> {log.callStatus}
              </p>
              <p>
                <strong>Response:</strong> {log.response}
              </p>
              <p>
                <strong>Duration:</strong> {log.durationLabel}
              </p>
              <p>
                <strong>Notes:</strong> {log.notes}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                By: {log.calledBy?.name || "—"}
              </p>
            </div>
          ))}

          {/* Pagination */}
          {callLogs.length > ITEMS_PER_PAGE && (
            <Pagination
              total={callLogs.length}
              perPage={ITEMS_PER_PAGE}
              currentPage={logsPage}
              onPageChange={setLogsPage}
            />
          )}
        </div>
      )}

      {/* follow up tab */}
      {activeTab === "followups" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Follow Ups</h2>
            <button
              onClick={() => setShowFuModal(true)}
              className="bg-[#99b84f] text-white px-3 py-1 rounded"
            >
              Add Follow-Up
            </button>
          </div>

          {followUps.length === 0 && <p>No follow-ups</p>}

          {paginatedFollowUps.map((fu) => (
            <div
              key={fu.id}
              className="border p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Scheduled:</strong> {formatToNepali(fu.scheduledAt)}
                </p>
                <p>
                  <strong>Notes:</strong> {fu.notes || "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  By: {fu.createdBy?.name || "—"}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  fu.status === "PENDING"
                    ? "bg-yellow-500 text-white"
                    : fu.status === "COMPLETED"
                      ? "bg-[#99b84f] text-white"
                      : fu.status === "MISSED"
                        ? "bg-red-500 text-white"
                        : "bg-gray-400 text-white"
                }`}
              >
                {fu.status}
              </span>
            </div>
          ))}

          {/* Pagination */}
          {followUps.length > ITEMS_PER_PAGE && (
            <Pagination
              total={followUps.length}
              perPage={ITEMS_PER_PAGE}
              currentPage={followUpsPage}
              onPageChange={setFollowUpsPage}
            />
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#4998d1] font-semibold hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* call log modal */}
      {showLogModal && (
        <Modal onClose={() => setShowLogModal(false)}>
          <h2 className="text-lg font-semibold mb-3">Add Call Log</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-2/3 border p-2 rounded">
                <NepaliDatePicker
                  initialDate={logDate || null}
                  onDateChange={setLogDate}
                />
              </div>
              <div className="w-1/3 border p-3 rounded">
                <input
                  type="time"
                  value={logTime}
                  onChange={(e) => setLogTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <select
              name="callStatus"
              value={logForm.callStatus}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Status</option>
              <option value="CONNECTED">Connected</option>
              <option value="NOT_PICKED">Not Picked</option>
              <option value="BUSY">Busy</option>
            </select>
            <select
              name="response"
              value={logForm.response}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Response</option>
              <option value="INTERESTED">Interested</option>
              <option value="CALL_LATER">Call Later</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
            <input
              name="durationLabel"
              placeholder="Duration (e.g., 5 mins)"
              value={logForm.durationLabel}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={logForm.notes}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={submitCallLog}
              className="w-full bg-blue-500 text-white py-2 rounded"
              disabled={logSubmitting}
            >
              {logSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </Modal>
      )}

      {/* follow up modal */}
      {showFuModal && (
        <Modal onClose={() => setShowFuModal(false)}>
          <h2 className="text-lg font-semibold mb-3">Add Follow-Up</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-2/3 border p-2 rounded">
                <NepaliDatePicker
                  initialDate={fuDate || null}
                  onDateChange={setFuDate}
                />
              </div>
              <div className="w-1/3 border p-3 rounded">
                <input
                  type="time"
                  value={fuTime}
                  onChange={(e) => setFuTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <textarea
              name="notes"
              placeholder="Notes"
              value={fuForm.notes}
              onChange={handleFuChange}
              className="w-full border p-2 rounded"
            />
            <select
              name="status"
              value={fuForm.status}
              onChange={handleFuChange}
              className="w-full border p-2 rounded"
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="MISSED">Missed</option>
            </select>
            <button
              onClick={submitFollowUp}
              className="w-full bg-[#99b84f] text-white py-2 rounded"
              disabled={fuSubmitting}
            >
              {fuSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// field component
const Field = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => (
  <div>
    <p className="font-medium text-gray-700">{label}</p>
    <p>{value || "—"}</p>
  </div>
);

const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl w-96 relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </div>
  </div>
);
