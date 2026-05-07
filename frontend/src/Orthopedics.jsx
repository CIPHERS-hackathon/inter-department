import { useEffect, useState } from "react";

function Orthopedics({ updateStatus }) {
  const [orthoRequests, setOrthoRequests] = useState([]);

  const fetchOrthoRequests = () => {
    fetch("http://localhost:5000/requests/department/Orthopedics")
      .then((res) => res.json())
      .then((data) => {
        console.log("Orthopedics Data:", data);
        setOrthoRequests(data);
      });
  };

  useEffect(() => {
    fetchOrthoRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await updateStatus(id, newStatus, "Orthopedics");
    fetchOrthoRequests();
  };

  return (
    <div>
      <h2>Orthopedics Department</h2>

      {orthoRequests.length === 0 ? (
        <p>No orthopedics requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Type</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orthoRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.patientName}</td>
                <td>{request.requestType}</td>
                <td>{request.status}</td>
                <td>
                  <select
                    value={request.status}
                    onChange={(e) =>
                      handleStatusChange(request.id, e.target.value)
                    }
                  >
                    <option>Assigned</option>
                    <option>In Review</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Orthopedics;
