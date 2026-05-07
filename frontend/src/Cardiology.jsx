import { useEffect, useState } from "react";

function Cardiology({ updateStatus }) {
  const [cardioRequests, setCardioRequests] = useState([]);

  const fetchCardioRequests = () => {
    fetch("http://localhost:5000/requests/department/Cardiology")
      .then((res) => res.json())
      .then((data) => {
        console.log("Cardiology Data:", data); // debug line
        setCardioRequests(data);
      });
  };

  useEffect(() => {
    fetchCardioRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await updateStatus(id, newStatus, "Cardiology");
    fetchCardioRequests();
  };

  return (
    <div>
      <h2>Cardiology Department</h2>

      {cardioRequests.length === 0 ? (
        <p>No cardiology requests found.</p>
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
            {cardioRequests.map((request) => (
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

export default Cardiology;
