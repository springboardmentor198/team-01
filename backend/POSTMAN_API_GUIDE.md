# DueDiligence Backend — Postman Testing Guide

## 1. Postman environment

Create an environment with:

| Variable | Initial value |
|---|---|
| `baseUrl` | `http://localhost:8081/api` |
| `token` | *(set after login)* |
| `propertyId` | `1` |
| `reportId` | *(set after generating a report)* |

For protected endpoints send:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

The backend identifies the current user from the JWT. Never send a user ID in request bodies.

## 2. Recommended test order

1. Register or log in.
2. Save `token` from the login response/text.
3. Get/create a property and save its ID as `propertyId`.
4. Open/property-view it, then test Popular Properties.
5. Test search history, Saved Searches, documents, permits, risk, and report generation.

### Authentication

| Method | URL | JSON body |
|---|---|---|
| POST | `{{baseUrl}}/auth/register` | `{"name":"Test Buyer","email":"buyer@example.com","password":"Password@123","phoneNumber":"9876543210"}` |
| POST | `{{baseUrl}}/auth/login` | `{"email":"buyer@example.com","password":"Password@123"}` |
| POST | `{{baseUrl}}/auth/verify-otp` | `{"email":"buyer@example.com","token":"OTP"}` |
| POST | `{{baseUrl}}/auth/forgot-password` | `{"email":"buyer@example.com"}` |
| POST | `{{baseUrl}}/auth/reset-password` | `{"token":"RESET_TOKEN","newPassword":"NewPassword@123"}` |
| GET | `{{baseUrl}}/auth/reset?email=buyer@example.com` | — |
| POST | `{{baseUrl}}/auth/google` | `{"code":"GOOGLE_AUTHORIZATION_CODE"}` |

> Login may return a plain token or JSON depending on the configured authentication flow. Set `{{token}}` to the returned JWT.

## 3. User profile and onboarding

| Method | URL | JSON body / notes |
|---|---|---|
| GET | `{{baseUrl}}/users/profile` | Current user profile |
| PUT | `{{baseUrl}}/users/profile` | `{"name":"Test Buyer","phoneNumber":"9876543210","bio":"Property investor","avatarUrl":"https://...","location":"Noida"}` — send only fields to update |
| GET | `{{baseUrl}}/users/profile/dashboard` | Completion percentage, per-user stats, activity |
| POST | `{{baseUrl}}/profile/complete` | `{"accountType":"RETAIL_CLIENT"}` |

## 4. Properties and discovery

| Method | URL | JSON body / query |
|---|---|---|
| POST | `{{baseUrl}}/properties` | See property body below |
| GET | `{{baseUrl}}/properties` | List all properties |
| GET | `{{baseUrl}}/properties/{{propertyId}}` | Property details |
| PUT | `{{baseUrl}}/properties/{{propertyId}}` | Same body as create; use fields you intend to persist |
| DELETE | `{{baseUrl}}/properties/{{propertyId}}` | Delete property |
| GET | `{{baseUrl}}/properties/popular?limit=6` | Popularity-ranked properties; limit is 1–12 |
| GET | `{{baseUrl}}/properties/search?keyword=Noida` | Basic search |
| GET | `{{baseUrl}}/properties/autocomplete?keyword=sky` | Autocomplete suggestions |
| GET | `{{baseUrl}}/properties/global-search?keyword=sky&page=0&size=20` | Ranked search |
| GET | `{{baseUrl}}/properties/{{propertyId}}/overview` | Property overview |
| GET | `{{baseUrl}}/properties/{{propertyId}}/risk` | Risk summary |
| GET | `{{baseUrl}}/properties/{{propertyId}}/documents` | Documents for property |
| GET | `{{baseUrl}}/properties/{{propertyId}}/permits` | Permits for property |

Example create/update property body:

```json
{
  "propertyCode": "Sky Heights Apartments",
  "parcelId": "PARCEL-1001",
  "address": "Jubilee Hills Road",
  "city": "Hyderabad",
  "country": "India",
  "propertyType": "Residential",
  "landUse": "Residential",
  "lotSizeSqft": 1800,
  "estimatedPrice": 12500000,
  "yearBuilt": 2020,
  "bedrooms": 3,
  "bathrooms": 2,
  "ownerName": "Test Owner",
  "status": "AVAILABLE",
  "imageUrl": "https://example.com/property.jpg"
}
```

### Property views and Popular Properties

| Method | URL | Notes |
|---|---|---|
| POST | `{{baseUrl}}/activity-log/{{propertyId}}/view` | Records an authenticated property view. Same user/property is deduplicated for 30 minutes. |
| GET | `{{baseUrl}}/activity-log/{{propertyId}}` | Activity timeline for a property |
| GET | `{{baseUrl}}/properties/popular?limit=6` | Returns actual view counts, unique viewers, popularity score, and risk data |

The frontend automatically records a view when Property Details opens. In Postman call the view endpoint manually, then call `/properties/popular`.

## 5. Property search history and Saved Searches

| Method | URL | JSON body / notes |
|---|---|---|
| POST | `{{baseUrl}}/search-history` | `{"query":"Sky Heights","propertyId":1,"propertyType":"Residential","city":"Hyderabad","risk":"Medium","status":"AVAILABLE"}` — all except supplied criteria are optional |
| DELETE | `{{baseUrl}}/search-history/{searchId}` | Delete one history item |
| DELETE | `{{baseUrl}}/search-history` | Clear current user's history |
| GET | `{{baseUrl}}/dashboard/recent-searches` | Current user's recent searches |
| POST | `{{baseUrl}}/saved-searches` | `{"name":"Hyderabad low risk homes","propertyType":"Residential","city":"Hyderabad","riskLevel":"Low","status":"AVAILABLE"}` |
| GET | `{{baseUrl}}/saved-searches` | Current user's saved searches only |
| DELETE | `{{baseUrl}}/saved-searches/{id}` | Delete a saved search owned by current user |

## 6. Dashboard and notifications

| Method | URL | Notes |
|---|---|---|
| GET | `{{baseUrl}}/dashboard/stats` | Current user's dashboard statistics |
| GET | `{{baseUrl}}/dashboard/recent-properties` | Properties viewed by current user |
| GET | `{{baseUrl}}/dashboard/risk-distribution` | Current user's viewed-property risk distribution |
| GET | `{{baseUrl}}/dashboard/notifications` | Dashboard notification feed |
| GET | `{{baseUrl}}/notifications?page=0&size=20&filter=ALL` | Paginated notifications; `filter` is optional |
| GET | `{{baseUrl}}/notifications/unread?page=0&size=20` | Unread notifications |
| GET | `{{baseUrl}}/notifications/count` | Unread count |
| PATCH | `{{baseUrl}}/notifications/{id}/read` | Mark one as read |
| PATCH | `{{baseUrl}}/notifications/read-all` | Mark all as read |
| DELETE | `{{baseUrl}}/notifications/{id}` | Delete one notification |

## 7. Due diligence resources

### Risk summaries

| Method | URL | JSON body / notes |
|---|---|---|
| POST | `{{baseUrl}}/risk-summary` | RiskSummaryRequest |
| GET | `{{baseUrl}}/risk-summary/{{propertyId}}` | Get by property |
| PUT | `{{baseUrl}}/risk-summary/{id}` | RiskSummaryRequest |
| DELETE | `{{baseUrl}}/risk-summary/{id}` | Delete |

Typical request fields: `propertyId`, `riskScore`, `overallRisk`, `floodRisk`, `legalRisk`, `environmentalRisk`, `financialRisk`, `marketRisk`, `ownershipRisk`, `complianceStatus`, `remarks`, `reviewedBy`.

### Documents

| Method | URL | JSON body / notes |
|---|---|---|
| POST | `{{baseUrl}}/documents` | `{"propertyId":1,"documentName":"Property Deed.pdf","documentType":"DEED","fileUrl":"https://example.com/deed.pdf"}` |
| GET | `{{baseUrl}}/documents/{{propertyId}}` | List documents |
| GET | `{{baseUrl}}/documents/download/{id}?email=buyer@example.com` | Download/log access |
| PUT | `{{baseUrl}}/documents/{id}` | DocumentRequest |
| DELETE | `{{baseUrl}}/documents/{id}` | Delete document |

### Permits, ownership, zoning, flood, and tax

| Method | URL | JSON body / notes |
|---|---|---|
| POST | `{{baseUrl}}/permits` | PermitRequest (`propertyId`, `permitType`, `issuingAuthority`, `issueDate`, `expiryDate`, `status`, `remarks`) |
| GET | `{{baseUrl}}/permits/{{propertyId}}` | List permits |
| PUT / DELETE | `{{baseUrl}}/permits/{id}` | PermitRequest / delete |
| GET | `{{baseUrl}}/ownership/{{propertyId}}` | Ownership records |
| POST | `{{baseUrl}}/ownership` | OwnershipRecord |
| PUT / DELETE | `{{baseUrl}}/ownership/{ownershipId}` | OwnershipRecord / delete |
| POST | `{{baseUrl}}/zoning` | ZoningRequest |
| GET | `{{baseUrl}}/zoning/{{propertyId}}` | Zoning data |
| PUT / DELETE | `{{baseUrl}}/zoning/{id}` | ZoningRequest / delete |
| GET | `{{baseUrl}}/flood-zone/{{propertyId}}` | Flood-zone data |
| POST | `{{baseUrl}}/flood-zone/verify/{{propertyId}}` | Run verification |
| GET | `{{baseUrl}}/properties/{{propertyId}}/tax-history` | Tax-history records |
| GET | `{{baseUrl}}/properties/{{propertyId}}/tax-summary` | Tax summary |
| POST | `{{baseUrl}}/properties/{{propertyId}}/tax-history` | PropertyTaxHistoryResponse body |
| PUT / DELETE | `{{baseUrl}}/properties/tax-history/{taxHistoryId}` | Tax record body / delete |
| GET | `{{baseUrl}}/property-profile/{{propertyId}}` | Combined property profile |

## 8. Reports

| Method | URL | JSON body / notes |
|---|---|---|
| POST | `{{baseUrl}}/report/generate` | `{"propertyId":{{propertyId}}}` |
| GET | `{{baseUrl}}/report/latest/{{propertyId}}` | Latest generated report for property |
| GET | `{{baseUrl}}/report/pdf/{{reportId}}` | Download PDF |
| GET | `{{baseUrl}}/report/excel/{{reportId}}` | Download Excel |
| GET | `{{baseUrl}}/reports/{{propertyId}}` | Property report endpoint; requires JWT |

## 9. Buyer engagement and review workflow

| Method | URL | JSON body / notes |
|---|---|---|
| POST | `{{baseUrl}}/engagements/properties/{{propertyId}}/save` | Save property |
| DELETE | `{{baseUrl}}/engagements/properties/{{propertyId}}/save` | Unsave property |
| POST | `{{baseUrl}}/engagements/properties/{{propertyId}}/contact-agent` | Optional JSON body accepted |
| POST | `{{baseUrl}}/engagements/properties/{{propertyId}}/visits` | `{"visitDate":"2026-08-20"}` |
| DELETE | `{{baseUrl}}/engagements/properties/{{propertyId}}/visits` | Cancel visit |
| POST | `{{baseUrl}}/engagements/properties/{{propertyId}}/offers` | `{"amount":"12500000"}` |
| POST | `{{baseUrl}}/reviews/legal/{{propertyId}}/start` | Start legal review |
| POST | `{{baseUrl}}/reviews/legal/{{propertyId}}/complete` | Optional review JSON body |
| POST | `{{baseUrl}}/reviews/financial/{{propertyId}}/start` | Start financial review |
| POST | `{{baseUrl}}/reviews/financial/{{propertyId}}/complete` | Optional review JSON body |

## 10. Roles, administration, audit, and analytics

| Method | URL | JSON body / notes |
|---|---|---|
| POST | `{{baseUrl}}/role-request` | RoleRequestRequest; authenticated user requests a role change |
| GET | `{{baseUrl}}/admin/role-requests?status=PENDING&requestedRole=AGENT` | Admin-only; both query parameters optional |
| GET | `{{baseUrl}}/admin/role-requests/{id}` | Admin-only |
| PUT | `{{baseUrl}}/admin/role-requests/{id}/approve` | Admin-only |
| PUT | `{{baseUrl}}/admin/role-requests/{id}/reject` | Admin-only |
| GET | `{{baseUrl}}/audit` | Audit logs; requires authorization |
| GET | `{{baseUrl}}/risk/{{propertyId}}` | Property analytics risk response |
| GET | `{{baseUrl}}/comparison/{{propertyId}}` | Comparable properties |
| GET | `{{baseUrl}}/valuation/{{propertyId}}` | Valuation |
| GET | `{{baseUrl}}/government/verify/{propertyCode}` | Government verification |

## 11. Useful Postman tests

**Login request Tests tab** (when the login response is JSON):

```javascript
pm.environment.set("token", pm.response.json().token);
```

**Popular Properties flow**

1. Authenticate.
2. `POST /activity-log/{{propertyId}}/view`.
3. `GET /properties/popular?limit=6`.
4. Repeating step 2 within 30 minutes with the same JWT should not increase that user's view count again.

**Saved Search flow**

1. `POST /saved-searches` with at least a name and one filter.
2. `GET /saved-searches`; copy its `id`.
3. `DELETE /saved-searches/{id}`.
4. `GET /saved-searches` confirms removal.

## Notes

- All paths above are relative to `{{baseUrl}}`; do not add `/api` twice.
- Resource-creation endpoints may require an active role with permission for that feature.
- `Property`, `OwnershipRecord`, and tax/zoning DTOs expose additional fields. Use the matching Java DTO/entity under `src/main/java/com/realestate/duediligence/dto` as the final field reference when testing those optional fields.
