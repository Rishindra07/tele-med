# Seeded Test Data

Run the seed command from `backend/`:

```bash
npm run seed:test-data
```

All seeded accounts use this password:

```text
Test@123
```

## Accounts

| Role | Approved | Email |
| --- | --- | --- |
| admin | yes | `admin.test@seva.local` |
| patient | yes | `aarti.patient@seva.local` |
| patient | yes | `rohan.patient@seva.local` |
| doctor | yes | `meera.doctor@seva.local` |
| doctor | no | `pending.doctor@seva.local` |
| pharmacist | yes | `city.pharmacy@seva.local` |
| pharmacist | yes | `relief.pharmacy@seva.local` |
| pharmacist | no | `pending.pharmacy@seva.local` |

## What Gets Seeded

- 2 patient profiles with records, settings, vitals, and symptom logs
- 1 approved doctor profile and 1 pending doctor profile
- 2 approved pharmacy profiles and 1 pending pharmacy profile
- doctor availability for tomorrow and the next day
- completed, scheduled, cancelled, and follow-up consultations
- ready, partial, completed, and pending prescriptions
- pharmacy stock with one alternative-pharmacy scenario
- notifications, complaints, and system logs for admin screens

## Manual Test Cases

1. Auth login by role
   Use each approved account to verify role-based login redirects.

2. Pending approval guard
   Try `pending.doctor@seva.local` and `pending.pharmacy@seva.local`.
   Expected: backend rejects login with approval message.

3. Patient profile and records
   Login as `aarti.patient@seva.local`.
   Verify profile data is prefilled and records list contains a prescription and lab report.

4. Patient pharmacy list
   As patient, open pharmacies and confirm both seeded pharmacies appear.

5. Doctor discovery
   As patient, fetch all doctors or filter by `General Physician`.
   Expected: `Dr. Meera Sharma` is returned.

6. Doctor slots
   As patient, request slots for the approved doctor on tomorrow's date.
   Expected: slots include `09:00`, `10:00`, `10:30`, `11:00`.

7. Appointment booking success
   As `aarti.patient@seva.local`, book tomorrow at `10:30` with the approved doctor.
   Expected: booking succeeds and appears in patient and doctor appointment lists.

8. Appointment booking conflict
   Try booking tomorrow at `10:00`.
   Expected: conflict because that slot is already seeded as booked.

9. Patient appointment cancellation
   Cancel the newly booked appointment from test 7.
   Expected: status changes to cancelled.

10. Doctor appointment list
    Login as `meera.doctor@seva.local`.
    Verify the doctor sees scheduled, cancelled, completed, and follow-up examples.

11. Prescription verification
    Open `/api/doctor/prescriptions/verify/:prescriptionId` using one of the seeded prescription IDs printed by the seed command.
    Expected: verified prescription payload is returned.

12. Doctor prescription generation
    Login as approved doctor and create a prescription for either patient.
    Expected: prescription is created and a health record is generated automatically.

13. Pharmacy queue
    Login as `city.pharmacy@seva.local`.
    Expected: queue includes ready, partial, and pending work relevant to the pharmacy.

14. Pharmacy availability check
    Check the seeded partial prescription.
    Expected: `Paracetamol 650` is available and `Cetirizine` is unavailable.

15. Alternative pharmacies
    For the partial prescription, request alternatives.
    Expected: `ReliefMeds Pharmacy` appears with `Cetirizine` stock.

16. Fulfillment completion
    Complete pickup for a ready prescription from the primary pharmacy.
    Expected: prescription becomes completed and stock decreases.

17. Notifications
    As patient, load notifications and mark one or all as read.

18. Admin pending approvals
    Login as `admin.test@seva.local`.
    Expected: pending doctor and pending pharmacy accounts are listed.

19. Admin analytics
    As admin, load analytics.
    Expected: counts for consultations, complaints, symptom issues, fulfillment states, and logs are non-empty.

20. Admin complaints and resolution
    As admin, confirm seeded complaints are visible and resolve the open one.

21. Admin system logs
    As admin, fetch logs and verify seeded info and error entries exist.

22. Admin export report
    Export overview and complaints reports.
    Expected: CSV response is returned for both supported report types.

## Notes

- The seed script is idempotent for these seeded accounts. Re-running it refreshes their related appointments, prescriptions, records, notifications, complaints, symptom logs, and test logs.
- It only rebuilds data tied to the seeded users, so unrelated project data stays untouched.
