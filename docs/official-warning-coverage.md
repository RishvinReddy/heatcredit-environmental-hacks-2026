# Official Warning Coverage

## 1. Supported Providers and Jurisdictions

Currently, HeatCredit officially supports the following provider(s):

- **United States**: National Weather Service (NWS)
  - Endpoint: `https://api.weather.gov/alerts/active?point={lat},{lon}`
  - Coverage Verification: Checked via `https://api.weather.gov/points/{lat},{lon}`.

We **do not** claim global official warning coverage. Users requesting coordinates outside the United States will explicitly receive an `unsupported` status.

## 2. Meaning of Warning States

The `GET /warnings` endpoint returns one of four explicit states:

- **`active`**: A supported official provider was successfully queried, and at least one relevant heat warning is currently active for the coordinate.
- **`none`**: A supported official provider was successfully queried, and no matching active heat warning was found.
- **`unsupported`**: No verified official provider adapter is available for the building's jurisdiction.
- **`unavailable`**: The relevant provider could not be queried, timed out, or its response could not be trusted (e.g. malformed JSON).

These states are distinct. `unsupported` and `unavailable` are never reported as `none` to avoid providing a false sense of security. **Absence of a warning (`none`) does not imply absolute safety**, only that the official provider has no alerts issued.

## 3. Heat Event Classification Rules

Heat alerts are explicitly matched against a strict taxonomy. For the US NWS, the accepted events are:
- Excessive Heat Warning
- Excessive Heat Watch
- Heat Advisory
- Extreme Heat Warning

Other severe weather events (e.g., thunderstorms, floods) are ignored by the heat warning pipeline.

## 4. Timestamps and Expiry

Alerts must be currently active.
- Evaluates `effective` (or `onset`) and `expires` (or `ends`).
- If the current time is before the effective time, the alert is not yet active.
- If the current time is after the expiration time, the alert is ignored.
- Malformed timestamps are rejected or safely ignored in accordance with validation best practices.

## 5. Failure and Timeout Behavior

- The provider is given a strict timeout of 5 seconds per request.
- Network errors or HTTP 500s from the provider result in an `unavailable` state.
- Warning failures are gracefully handled during an assessment: an assessment can succeed with an `unavailable` warning status, ensuring scoring infrastructure remains unblocked.

## 6. Caching and Rate Limiting

To comply with NWS guidelines and prevent excessive load:

- Requests identify themselves via the `User-Agent: HeatCredit/1.0` header.
- Internal timeouts are strictly capped at 5 seconds.
- The `/warnings` Lambda endpoint returns a `Cache-Control: public, max-age=300` header to instruct downstream clients, browsers, and intermediaries to cache successful warning states for 5 minutes per coordinate. This does not automatically enable API Gateway-level caching unless explicitly configured.

## 7. How to Add a Future Provider

1. Create a new provider adapter in `backend/lib/warnings/warnings.ts`.
2. Ensure the provider uses an official government or trusted meteorological endpoint.
3. Validate its coverage map or point-lookup mechanism.
4. Implement the strict `active`, `none`, `unsupported`, `unavailable` contract.
5. Add unit tests with mocked responses.
6. Submit a pull request and update this coverage document.
