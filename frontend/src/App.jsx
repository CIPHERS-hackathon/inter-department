import { useEffect, useState } from "react";
import "./App.css";
import Cardiology from "./Cardiology";
import Orthopedics from "./Orthopedics";

function App() {
  const [role, setRole] = useState(null);
  const [requests, setRequests] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [requestType, setRequestType] = useState("");
  const [department, setDepartment] = useState("");

  const fetchRequests = () => {
    fetch("http://localhost:5000/requests")
      .then((res) => res.json())
      .then((data) => setRequests(data));
  };

  useEffect(() => {
    if (role === "reception") {
      fetchRequests();
    }
  }, [role]);

  const createRequest = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:5000/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, requestType, department }),
    });

    setPatientName("");
    setRequestType("");
    setDepartment("");
    fetchRequests();
  };

  const updateStatus = async (id, newStatus, department) => {
    await fetch(`http://localhost:5000/requests/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newStatus,
        updatedBy: role,
        department,
      }),
    });

    fetchRequests();
  };

  if (!role) {
    return (
      <div className="role-container">
        <div className="role-card">
          <h1 className="role-title">Select Your Role</h1>

          <div className="role-buttons">
            <button
              className="role-btn reception"
              onClick={() => setRole("reception")}
            >
              Reception
            </button>

            <button
              className="role-btn cardiology"
              onClick={() => setRole("cardiology")}
            >
              Cardiology
            </button>

            <button
              className="role-btn orthopedics"
              onClick={() => setRole("orthopedics")}
            >
              Orthopedics
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>Inter-Department Workflow System</h1>
        <button className="logout-btn" onClick={() => setRole(null)}>
          Logout
        </button>
      </header>

      <div className="content">
        <main className="main-panel">
          {role === "reception" && (
            <>
              <section className="panel">
                <h2>Create New Request</h2>
                <form className="form" onSubmit={createRequest}>
                  <input
                    type="text"
                    placeholder="Patient Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Request Type"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    required
                  />

                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>

                  <button type="submit">Create</button>
                </form>
              </section>

              <div className="kpi-container">
                <div className="kpi-card">
                  <h3>Total Requests</h3>
                  <p>{requests.length}</p>
                </div>

                <div className="kpi-card">
                  <h3>In Progress</h3>
                  <p>
                    {requests.filter((r) => r.status === "In Progress").length}
                  </p>
                </div>

                <div className="kpi-card">
                  <h3>Completed</h3>
                  <p>
                    {requests.filter((r) => r.status === "Completed").length}
                  </p>
                </div>
              </div>

              <section className="panel">
                <h2>Active Requests</h2>

                <table className="request-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Type</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Update</th>
                      <th>Last Updated By</th>
                      <th>Last Updated At</th>
                      <th>Delayed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td>{req.patientName}</td>
                        <td>{req.requestType}</td>
                        <td>{req.department}</td>
                        <td>
                          <span
                            className={`status ${req.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <select
                            onChange={(e) =>
                              updateStatus(
                                req.id,
                                e.target.value,
                                req.department,
                              )
                            }
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Change Status
                            </option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Review">In Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td>{req.updatedBy}</td>
                        <td>
                          {req.updatedAt
                            ? new Date(req.updatedAt).toLocaleString()
                            : "—"}
                        </td>
                        <td>{req.isDelayed ? "⚠ Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {role === "cardiology" && <Cardiology updateStatus={updateStatus} />}
          {role === "orthopedics" && (
            <Orthopedics updateStatus={updateStatus} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
