// index.js
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Config / Member Tokens
const VALID_TOKENS = new Set([
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222"
]);

// Forbidden Inputs
const FORBIDDEN_KEYS = [
  "CV", "Academic_Degrees", "Social_Profiles", "Work_History",
  "Psychological_Diagnosis", "Background_Checks", "Reputation_Scores",
  "External_Databases"
];

// Utility: Generate Human Signature Vector
function generateHumanSignatureVector(dims = 128) {
  const arr = [];
  for (let i = 0; i < dims; i++) {
    arr.push(parseFloat(Math.random().toFixed(6)));
  }
  return arr;
}

// Load mock users (Pilot only)
function loadMockUsers() {
  const filePath = path.join(__dirname, 'users_mock.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

// Main API
app.post('/api', (req, res) => {
  const { member_token, section, inputs } = req.body;

  if (!member_token || !VALID_TOKENS.has(member_token)) {
    return res.status(401).json({
      status: "block",
      message: "Invalid or missing member token"
    });
  }

  for (const key of Object.keys(inputs || {})) {
    if (FORBIDDEN_KEYS.includes(key)) {
      return res.json({
        status: "block",
        section,
        output: { Validation: "block" }
      });
    }
  }

  let output = {};

  switch (section) {
    case "legal":
      output = {
        Legal_Gate_Status:
          inputs.Consent_Confidential_Evaluation &&
          inputs.Consent_Match_Suggestions &&
          inputs.Consent_No_Match_Outcome &&
          inputs.Consent_Feedback_Obligation &&
          inputs.Acceptance_Elite_Not_Final_Authority
            ? "pass"
            : "fail"
      };
      break;

    case "sectionA":
      output = {
        Human_Signature_Vector: generateHumanSignatureVector(128)
      };
      break;

    case "sectionB":
      output = {
        Filtered_Top_Matches_List: [
          {
            match_id: crypto.randomUUID(),
            attributes: {
              Language: inputs.Language_Preference,
              Geography: inputs.Geography_Preference
            }
          },
          {
            match_id: crypto.randomUUID(),
            attributes: {
              Language: inputs.Language_Preference,
              Geography: inputs.Geography_Preference
            }
          }
        ]
      };
      break;

    case "system":
      output = {
        Behavioral_Analysis_Layer: {
          stability_score: Math.random().toFixed(3)
        },
        Access_Status: "Active"
      };
      break;

    case "feedback":
      output = {
        Access_Status:
          inputs.Feedback_Submission_Status === "submitted"
            ? "Active"
            : "Temporarily_Suspended"
      };
      break;

    default:
      return res.status(400).json({
        status: "error",
        message: "Unknown section"
      });
  }

  return res.json({ status: "success", section, output });
});

// 🔹 Pilot Report Endpoint
app.get('/report', (req, res) => {
  try {
    const users = loadMockUsers();

    const eligible = users.filter(u => u.eligibility === "eligible");
    const ineligible = users.filter(u => u.eligibility !== "eligible");

    const clusters = {};
    for (const u of eligible) {
      if (!clusters[u.cluster]) clusters[u.cluster] = [];
      clusters[u.cluster].push(u.user_id);
    }

    res.json({
      status: "success",
      pilot_mode: true,
      summary: {
        total_users: users.length,
        eligible_users: eligible.length,
        ineligible_users: ineligible.length,
        clusters
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Elite Pilot API running on port ${PORT}`);
});
