const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let requests = [];

// Auto department assignment
function assignDepartment(requestType) {
  const type = requestType.toLowerCase();

  if (type.includes("cardio")) return "Cardiology";
  if (type.includes("ortho")) return "Orthopedics";

  return "General Medicine";
}

// Allowed status transitions
const allowedTransitions = {
  Submitted: ["Assigned"],
  Assigned: ["In Review"],
  "In Review": ["Approved", "Rejected"],
  Approved: ["Completed"],
  Rejected: [],
  Completed: [],
};

// GET ALL REQUESTS
app.get("/requests/department/:dept", (req, res) => {
  const dept = req.params.dept;
  const filtered = requests.filter((r) => r.department === dept);
  res.json(filtered);
});

app.get("/requests", (req, res) => {
  res.json(requests);
});

app.get("/requests/:id", (req, res) => {
  const request = requests.find((r) => r.id == req.params.id);
  if (!request) return res.status(404).json({ message: "Not found" });
  res.json(request);
});

// CREATE REQUEST
app.post("/requests", (req, res) => {
  console.log("Incoming body:", req.body);

  const { patientName, requestType, department } = req.body;

  if (!patientName || !requestType) {
    return res.status(400).json({ message: "Missing data" });
  }

  const newRequest = {
    id: Date.now(),
    patientName,
    requestType,
    department,
    status: "Assigned",
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: "Reception",
    history: [
      {
        status: "Assigned",
        timestamp: new Date(),
      },
    ],
  };

  requests.push(newRequest);

  res.status(201).json(newRequest);
});

// UPDATE STATUS
app.put("/requests/:id/status", (req, res) => {
  console.log("PUT HIT");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  const requestId = req.params.id;
  const { newStatus, updatedBy, department } = req.body;

  const request = requests.find((r) => r.id == requestId);

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  // Department authorization
  if (request.department !== department) {
    return res.status(403).json({ message: "Unauthorized department" });
  }

  // Status transition check

  const transitions = allowedTransitions[request.status];

  if (!transitions) {
    return res.status(400).json({ message: "Unknown current status" });
  }

  if (!transitions.includes(newStatus)) {
    return res.status(400).json({ message: "Invalid status transition" });
  }
  // SLA delay check (1 minute demo)
  const diffInMinutes =
    (new Date() - new Date(request.createdAt)) / (1000 * 60);

  if (diffInMinutes > 1) {
    request.isDelayed = true;
  }

  request.history.push({
    from: request.status,
    to: newStatus,
    updatedBy,
    timestamp: new Date(),
  });

  request.status = newStatus; // ← THIS IS CRITICAL
  request.updatedAt = new Date();
  request.updatedBy = updatedBy;
  res.json(request);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
