# Ticket evidence (untrusted source text)

{
  "ticket": {
    "id": "10048",
    "key": "CRM-1",
    "title": "Bulk upload saves wrong follow-up dates (2026/03/15 becomes 1905)",
    "description": "When prospects are bulk-uploaded from a CSV, some \"Follow Up Date\" values are saved wrong, with no warning:\n2026/03/15 is saved as 1905\n\n15.03.2026 is saved as 1900\n\n2026-02-30 (not a real day) is saved as 1 March\n\nWhere: src/utils/bulkUploadTransformer.js, function parseDate\nFix:\nRead 2026/03/15 and 15.03.2026 correctly\n\nReject dates that don't exist\n\nShow an error for a date it can't read, instead of guessing",
    "url": "https://balaramansethuramanr.atlassian.net/browse/CRM-1",
    "state": "To Do",
    "priority": "Medium",
    "labels": [],
    "assignees": [],
    "updated_at": "2026-10-29T13:02:29.645+0530",
    "comments": [],
    "repository": "",
    "kind": "issue",
    "source_status": "",
    "availability": "available",
    "status_group": "new",
    "issue_type_id": "10047",
    "issue_type_name": "Bug",
    "label_identities": [],
    "labels_complete": true,
    "comments_complete": true,
    "comment_records": []
  },
  "requirement_digest": "5a5ae78e5fb83cf42fda70972914610bb33ed570521b9d6b98a1c441cf4ce03e",
  "repo_url": "https://github.com/Balaramansethu/crm-prototype-client.git",
  "base_branch": "main",
  "baseline_sha": "325788b830c18476bb1cf3661958fc8f2d95d842"
}

Investigate this repository. Reproduce the defect before changing implementation. Use the existing Specify, Plan, Tasks, Analyze and Referee approval flow.
