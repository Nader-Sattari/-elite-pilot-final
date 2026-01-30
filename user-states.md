# User State Machine

REGISTERED
→ UNDER_REVIEW
→ MATCH_SIMULATION
→ (REPORT_READY | NO_MATCH_FOUND)

## Notes
- NO_MATCH_FOUND is intentional for control users
- All states are reversible except REPORT_READY
- State transitions happen automatically based on eligibility
