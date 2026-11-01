# Ticket evidence (untrusted source text)

{
  "ticket": {
    "id": "10050",
    "key": "CRM-3",
    "title": "Lead follow-up date shifts by the time-zone offset on every save",
    "description": "What happens\nWhen a lead is saved, its follow-up date is sent to the server with the user\u2019s local time labelled as UTC. Each time the lead is edited and saved, even without changing the date, the stored date moves by the user\u2019s time-zone offset. After a few saves, the list shows a different day.\nSteps to reproduce (browser time zone: India, UTC+5:30)\nGo to Leads \u2192 Create Lead.\n\nEnter a company name and one contact name. Set Follow Up to 15-03-2026. Save.\n\nIn the Leads list, the Follow Up column shows 15-03-2026.\n\nOpen the lead \u2192 Edit \u2192 click Save without changing anything.\n\nRepeat step 4 three more times (4 saves in total).\n\nLook at the Follow Up column in the Leads list.\n\nExpected\nThe follow-up date stays 15-03-2026 however many times the lead is saved.\nActual\nAfter the 4th save it shows 16-03-2026, and after 8 saves 17-03-2026.\n\nIn Riyadh (UTC+3) it moves a day after 7 saves.\n\nIn New York (UTC\u22124) it shows 14-03-2026 straight after creating the lead, and keeps moving earlier.\n\nWhat is sent to the server (India)\nStep\nfollowUp sent\nCreate\n2026-03-15T00:00:00.000Z\nSave 1\n2026-03-15T05:30:00.000Z\nSave 4\n2026-03-15T22:00:00.000Z \u2192 list shows 16-03-2026\nAcceptance criteria\nCreating a lead with follow-up 15-03-2026 shows 15-03-2026 in the list, in any time zone.\n\nOpening Edit and saving without changes, any number of times, leaves the follow-up date unchanged.\n\nThe value sent to the server is the real moment the user picked (local midnight of 15-03-2026 converted to UTC, e.g. 2026-03-14T18:30:00.000Z in India).\n\nAn automated test covers create plus repeated saves in a time zone other than UTC.",
    "url": "https://balaramansethuramanr.atlassian.net/browse/CRM-3",
    "state": "To Do",
    "priority": "Medium",
    "labels": [],
    "assignees": [],
    "updated_at": "2026-10-30T12:12:58.738+0530",
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
  "requirement_digest": "0955de17fe0bfc9c8305ecccd687e4ff2140cc74a6dbc772514bd96262d5afc2",
  "repo_url": "https://github.com/Balaramansethu/crm-prototype-client.git",
  "base_branch": "main",
  "baseline_sha": "325788b830c18476bb1cf3661958fc8f2d95d842"
}

Investigate this repository. Reproduce the defect before changing implementation. Use the existing Specify, Plan, Tasks, Analyze and Referee approval flow.
